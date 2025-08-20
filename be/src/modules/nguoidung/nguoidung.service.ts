import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { NguoiDung } from './entities/nguoidung.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CreateSocialDto } from './dto/create-social.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { comparePassword, hashPassword } from '../../common/utils';
import { UpdateUserDto } from './dto/update-user.dto';
import { VaiTro } from '../../common/constants/role.enum';
import { FilterUserDto } from './dto/filter-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { getWeekDateRange } from '../../common/utils/index';
import { RedisService } from 'src/services/redis/redis.service';

@Injectable()
export class NguoiDungService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepository: Repository<NguoiDung>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // SERVICE LẤY DANH SÁCH NGƯỜI DÙNG THEO VAI TRÒ
  async getAllUsersWithPermissions(dto: {
    admin: boolean;
    giangVien: boolean;
    hocVien: boolean;
  }) {
    const { admin, giangVien, hocVien } = dto;

    let permissions: VaiTro[] = [];
    if (admin) {
      permissions.push(VaiTro.ADMIN);
    }
    if (giangVien) {
      permissions.push(VaiTro.GIANGVIEN);
    }
    if (hocVien) {
      permissions.push(VaiTro.HOCVIEN);
    }

    const users = await this.nguoiDungRepository.find({
      where: {
        vaiTro: In(permissions),
      },
    });

    return users;
  }

  //SERVICE LẤY DANH SÁCH NGƯỜI DÙNG CÓ PHÂN TRANG VÀ BỘ LỌC
  async findAll(options: FilterUserDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      vaiTro,
      daKichHoat,
      deletedAt,
      createdAtFrom,
      createdAtTo,
    } = options;

    const skip = (page - 1) * limit;
    const queryBuilder = this.nguoiDungRepository
      .createQueryBuilder('user')
      .withDeleted();

    if (search) {
      queryBuilder.andWhere(
        '(unaccent(user.hoTen) ILIKE unaccent(:search) OR unaccent(user.email) ILIKE unaccent(:search))',
        { search: `%${search}%` },
      );
    }

    if (vaiTro) {
      queryBuilder.andWhere('user.vaiTro = :vaiTro', { vaiTro });
    }

    if (daKichHoat !== undefined) {
      queryBuilder.andWhere('user.daKichHoat = :daKichHoat', { daKichHoat });
    }

    if (createdAtFrom) {
      queryBuilder.andWhere('user.createdAt >= :createdAtFrom', {
        createdAtFrom: new Date(createdAtFrom),
      });
    }

    if (createdAtTo) {
      queryBuilder.andWhere('user.createdAt <= :createdAtTo', {
        createdAtTo: new Date(createdAtTo),
      });
    }

    if (deletedAt) {
      if (deletedAt === 'true') {
        queryBuilder.andWhere('user.deletedAt IS NOT NULL');
      } else {
        queryBuilder.andWhere('user.deletedAt IS NULL');
      }
    }

    queryBuilder.select([
      'user.id',
      'user.email',
      'user.hoTen',
      'user.hinhAnh',
      'user.tieuSu',
      'user.vaiTro',
      'user.daKichHoat',
      'user.googleId',
      'user.facebookId',
      'user.createdAt',
      'user.updatedAt',
      'user.deletedAt',
    ]);

    if (sortBy && this.isValidColumn(sortBy)) {
      queryBuilder.addOrderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.addOrderBy('user.createdAt', 'DESC');
    }

    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
    };
  }

  private isValidColumn(column: string): boolean {
    const validColumns = [
      'id',
      'email',
      'hoTen',
      'vaiTro',
      'daKichHoat',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ];
    return validColumns.includes(column);
  }

  //SERVICE LẤY NGƯỜI DUNGF THEO ID
  async findUserById(id: string): Promise<NguoiDung> {
    const key = `user:${id}`;
    const cachedUser = await this.redisService.get<NguoiDung>(key);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.nguoiDungRepository.findOne({
      where: { id },
      withDeleted: true,
      select: [
        'id',
        'email',
        'hoTen',
        'hinhAnh',
        'tieuSu',
        'vaiTro',
        'daKichHoat',
        'googleId',
        'facebookId',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
    }

    await this.redisService.set(key, user);

    return user;
  }

  async getUserByEmail(email: string) {
    return await this.nguoiDungRepository.findOne({
      where: { email },
      withDeleted: true,
    });
  }

  /**
   * SERVICE LẤY NGƯỜI DÙNG BẰNG EMAIL
   * OUTPUT: NGUOIDUNG + KHÓA HỌC ĐÃ ĐĂNG KÝ
   */
  async getInfoUserByEmail(email: string) {
    const user = await this.dataSource.query(
      `
        SELECT ng.id, ng."email", ng."hoTen", ng."hinhAnh", ng."vaiTro", ng."daKichHoat", 
          ng."googleId", ng."facebookId", ng."tieuSu"
        FROM "NGUOIDUNG" ng
        WHERE ng."email" = $1
      `,
      [email],
    );

    if (!user) {
      throw new ConflictException({
        message: {
          email: 'Email không tồn tại',
        },
      });
    }

    const khoaHocDangKys = await this.dataSource.query(
      `
        SELECT DISTINCT kh.*
        FROM "NGUOIDUNG_KHOAHOC" ndkh
        JOIN "KHOAHOC" kh ON kh.id = ndkh."maKhoaHoc"
        JOIN "GIAODICH" gd ON gd."maDangKy" = ndkh.id
        WHERE ndkh."maNguoiDung" = $1 
          AND kh."deletedAt" IS NULL 
          AND gd."trangThai" = $2
      `,
      [user[0].id, 'THANH_CONG'],
    );

    return {
      ...user[0],
      khoaHocDangKys,
    };
  }

  async getUserByUsername(username: string) {
    return await this.nguoiDungRepository.findOne({
      where: { hoTen: username },
    });
  }

  //SERVICE TẠO NGƯỜI DÙNG MỚI
  async createUser(user: CreateUserDto | CreateSocialDto) {
    if (await this.getUserByEmail(user.email)) {
      throw new ConflictException('Email đã được sử dụng');
    }

    try {
      if ('matKhau' in user && user.matKhau) {
        user.matKhau = await hashPassword(user.matKhau);
      } else {
        user.matKhau = await hashPassword(
          process.env.DEFAULT_PASSWORD || 'password123@',
        );
      }

      if (user.hinhAnh === '' || user.hinhAnh === undefined) {
        user.hinhAnh = process.env.DEFAULT_AVATAR;
      }

      const newUser = this.nguoiDungRepository.create(user);
      const result = await this.nguoiDungRepository.save(newUser);

      await this.clearUserStatsCache();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //SERVICE CẬP NHẬT NGƯỜI DÙNG, ADMIN
  async updateByAdmin(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.nguoiDungRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.getUserByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException({
          message: {
            email: 'Email đã được sử dụng',
          },
        });
      }
    }

    if (updateUserDto.hoTen && updateUserDto.hoTen !== user.hoTen) {
      const existingUser = await this.getUserByUsername(updateUserDto.hoTen);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException({
          message: {
            hoTen: 'Họ tên đã được sử dụng',
          },
        });
      }
    }

    await this.nguoiDungRepository.update(id, updateUserDto);

    await this.redisService.del(`user:${id}`);

    return {
      success: true,
      message: 'Cập nhật người dùng thành công',
    };
  }

  //SERVICE SOFT REMOVE + HARD REMOVE NGƯỜI DÙNG
  async remove(id: string) {
    const user = await this.nguoiDungRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
    }

    if (user.deletedAt) {
      await this.nguoiDungRepository.remove(user);

      await this.clearUserStatsCache();

      return {
        success: true,
        message: 'Tài khoản đã được xóa vĩnh viễn',
      };
    }

    if (user.vaiTro === VaiTro.ADMIN) {
      const adminCount = await this.nguoiDungRepository.count({
        where: { vaiTro: VaiTro.ADMIN },
      });

      if (adminCount <= 1) {
        throw new ConflictException(
          'Không thể xóa người dùng admin duy nhất trong hệ thống',
        );
      }
    }

    await this.nguoiDungRepository.softRemove(user);

    // Clear cache user và thống kê
    await this.redisService.del(`user:${id}`);
    await this.clearUserStatsCache();

    return {
      success: true,
      message: 'Xóa tài khoản thành công',
    };
  }

  //SERVICE RESTORE NGƯỜI DÙNG
  async restore(id: string) {
    const user = await this.nguoiDungRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
    }

    if (user.deletedAt) {
      await this.nguoiDungRepository.restore(user.id);
      await this.clearUserStatsCache();

      return {
        success: true,
        message: 'Tài khoản đã được khôi phục',
      };
    }

    return {
      success: false,
      message: 'Khôi phục tài khoản thất bại',
    };
  }

  async getUserByGoogleId(googleId: string): Promise<NguoiDung | null> {
    return await this.nguoiDungRepository.findOne({ where: { googleId } });
  }

  async getUserByFacebookId(facebookId: string): Promise<NguoiDung | null> {
    return await this.nguoiDungRepository.findOne({ where: { facebookId } });
  }

  async update(id: string, data: Partial<NguoiDung>) {
    await this.nguoiDungRepository.update(id, data);
    await this.redisService.del(`user:${id}`);

    return this.nguoiDungRepository.findOne({ where: { id } });
  }

  // người dùng tìm kiếm khóa học và bài đăng theo name
  async searchCourseAndBlogByName(name: string) {
    const [courses, blogs] = await Promise.all([
      await this.dataSource.query(
        `
          SELECT kh.id, kh."tenKhoaHoc", kh."hinhAnh"
          FROM "KHOAHOC" kh
          WHERE unaccent(kh."tenKhoaHoc") ILIKE unaccent($1)
        `,
        [`%${name}%`],
      ),
      await this.dataSource.query(
        `
          SELECT bd.id, bd."tieuDe"
          FROM "BAIDANG" bd
          WHERE unaccent(bd."tieuDe") ILIKE unaccent($1) 
              OR unaccent(bd."noiDungMarkdown") ILIKE unaccent($1)
        `,
        [`%${name}%`],
      ),
    ]);

    return {
      khoaHocs: courses.slice(0, 3),
      baiDangs: blogs.slice(0, 3),
    };
  }

  // SERVICE THAY ĐỔI MẬT KHẨU
  async changePassword(
    changePasswordDto: ChangePasswordDto,
    maNguoiDung: string,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.nguoiDungRepository.findOne({
        where: { id: maNguoiDung },
      });

      if (!user) {
        throw new ConflictException('Người dùng không tồn tại');
      }

      if (!(await comparePassword(oldPassword, user.matKhau))) {
        throw new ConflictException('Mật khẩu cũ không chính xác');
      }

      if (await comparePassword(newPassword, user.matKhau)) {
        throw new ConflictException('Mật khẩu hiện tại đã được sử dụng');
      }

      const hashedPassword = await hashPassword(newPassword);

      await this.nguoiDungRepository.update(user.id, {
        matKhau: hashedPassword,
      });

      await this.redisService.del(`user:${user.id}`);

      return {
        success: true,
        message: 'Mật khẩu đã được thay đổi thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  //SERVICE THAY ĐỔI ẢNH ĐẠI DIỆN
  async changeAvatar(imageUrl: string, maNguoiDung: string) {
    try {
      const user = await this.nguoiDungRepository.findOne({
        where: { id: maNguoiDung },
      });

      if (!user) {
        throw new ConflictException('Người dùng không tồn tại');
      }

      await this.nguoiDungRepository.update(user.id, {
        hinhAnh: imageUrl,
      });

      await this.redisService.del(`user:${user.id}`);

      return {
        success: true,
        message: 'Ảnh đại diện đã được thay đổi thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  //SERVICE CẬP NHẬT THÔNG TIN NGƯỜI DÙNG
  async updateInfoUser(body: UpdateUserDto) {
    const { maNguoiDung, hoTen, tieuSu } = body;

    try {
      const user = await this.nguoiDungRepository.findOne({
        where: { id: maNguoiDung },
      });

      if (!user) {
        throw new ConflictException('Người dùng không tồn tại');
      }

      if (hoTen) {
        const checkUsername = await this.getUserByUsername(hoTen);

        if (checkUsername && checkUsername.id !== user.id) {
          throw new ConflictException('Tên người dùng đã được sử dụng');
        }
      }

      await this.nguoiDungRepository.update(user.id, {
        hoTen,
        tieuSu,
      });

      await this.redisService.del(`user:${user.id}`);

      return {
        success: true,
        message: 'Thông tin người dùng đã được cập nhật thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  //SERVICE RESET PASSWORD
  async resetPassword(dto: ResetPasswordDto) {
    const { password, maNguoiDung } = dto;
    try {
      const user = await this.nguoiDungRepository.findOne({
        where: { id: maNguoiDung },
      });

      if (!user) {
        throw new ConflictException('Người dùng không tồn tại');
      }

      await this.nguoiDungRepository.update(user.id, {
        matKhau: await hashPassword(password),
      });

      await this.redisService.del(`user:${user.id}`);

      return {
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /*********************************************
   * SERVICE THỐNG KÊ SỐ LIỆU NHƯỜI DÙNG
   * @param query - bộ lọc thời gian
   */
  async getUserStats(year: number, month?: number) {
    const cacheKey = month
      ? `user_stats:${year}:${month}`
      : `user_stats:${year}`;

    const cachedStats = await this.redisService.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    /**
     * Thống kê số liệu người đăng ký theo từng tháng (year)
     * theo từng tuần trong tháng (month, year)
     */
    if (month) {
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 1));

      const daysInMonth =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const maxWeeks = Math.ceil((daysInMonth + startDate.getUTCDay()) / 7);

      const query = `
        SELECT 
          FLOOR((
            EXTRACT(DAY FROM (nd."createdAt" - $1::timestamp)) + 
            EXTRACT(DOW FROM $1::timestamp)
          ) / 7) + 1 AS week,
          SUM(CASE WHEN nd."googleId" IS NOT NULL THEN 1 ELSE 0 END) AS google_count,
          SUM(CASE WHEN nd."facebookId" IS NOT NULL THEN 1 ELSE 0 END) AS facebook_count,
          SUM(CASE WHEN nd."googleId" IS NULL AND nd."facebookId" IS NULL THEN 1 ELSE 0 END) AS email_count
        FROM "NGUOIDUNG" nd
        WHERE nd."createdAt" >= $1 AND nd."createdAt" < $2
        GROUP BY week
        ORDER BY week ASC
      `;

      const result = await this.dataSource.query(query, [startDate, endDate]);

      const stats = Array.from({ length: maxWeeks }, (_, index) => {
        const week = index + 1;
        const record = result.find((r) => parseInt(r.week) === week);

        return {
          period: getWeekDateRange(week, startDate, daysInMonth, month),
          google: parseInt(record?.google_count) || 0,
          facebook: parseInt(record?.facebook_count) || 0,
          email: parseInt(record?.email_count) || 0,
          total:
            (parseInt(record?.google_count) || 0) +
            (parseInt(record?.facebook_count) || 0) +
            (parseInt(record?.email_count) || 0),
        };
      });

      const finalResult = {
        total: await this.getTotalUsers(),
        userRegistrationStats: stats,
        registrationMethodStats: await this.getRegistrationMethodStats(),
      };

      const now = new Date();
      const isCurrentMonth =
        year === now.getFullYear() && month === now.getMonth() + 1;
      const ttl = isCurrentMonth ? 3600 : 86400; // 1 hour : 1 day

      await this.redisService.set(cacheKey, finalResult, ttl);
      return finalResult;
    } else {
      const startDate = `${year}-01-01`;
      const endDate = `${year + 1}-01-01`;

      const query = `
        SELECT 
          EXTRACT(MONTH FROM nd."createdAt") AS month,
          SUM(CASE WHEN nd."googleId" IS NOT NULL THEN 1 ELSE 0 END) AS google_count,
          SUM(CASE WHEN nd."facebookId" IS NOT NULL THEN 1 ELSE 0 END) AS facebook_count,
          SUM(CASE WHEN nd."googleId" IS NULL AND nd."facebookId" IS NULL THEN 1 ELSE 0 END) AS email_count
        FROM "NGUOIDUNG" nd
        WHERE nd."createdAt" >= $1 AND nd."createdAt" < $2
        GROUP BY month
        ORDER BY month ASC
      `;

      const result = await this.dataSource.query(query, [startDate, endDate]);

      const stats = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const record = result.find((r) => parseInt(r.month) === month);
        return {
          period: `Tháng ${month}`,
          google: parseInt(record?.google_count) || 0,
          facebook: parseInt(record?.facebook_count) || 0,
          email: parseInt(record?.email_count) || 0,
          total:
            (parseInt(record?.google_count) || 0) +
            (parseInt(record?.facebook_count) || 0) +
            (parseInt(record?.email_count) || 0),
        };
      });

      const finalResult = {
        total: await this.getTotalUsers(),
        userRegistrationStats: stats,
        registrationMethodStats: await this.getRegistrationMethodStats(),
      };

      const now = new Date();
      const isCurrentYear = year === now.getFullYear();
      const ttl = isCurrentYear ? 3600 : 86400; // 1 hour : 1 day

      await this.redisService.set(cacheKey, finalResult, ttl);
      return finalResult;
    }
  }

  /**
   * Lấy tổng số người đăng ký trong hệ thống
   */
  private async getTotalUsers() {
    const cacheKey = 'total_users';
    const cachedTotal = await this.redisService.get<number>(cacheKey);

    if (cachedTotal !== null) {
      return cachedTotal;
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM "NGUOIDUNG"
    `;

    const result = await this.dataSource.query(query);
    const total = parseInt(result[0].total);

    await this.redisService.set(cacheKey, total, 1800);
    return total;
  }

  /**
   * Lấy thống kê số liệu người đăng ký theo các hình thức đăng ký
   */
  private async getRegistrationMethodStats() {
    const cacheKey = 'registration_method_stats';
    const cachedStats = await this.redisService.get(cacheKey);

    if (cachedStats) {
      return cachedStats;
    }

    const [google, facebook, email] = await Promise.all([
      await this.dataSource.query(
        `
          SELECT COUNT(*) AS count
          FROM "NGUOIDUNG" nd
          WHERE nd."googleId" IS NOT NULL
        `,
      ),
      await this.dataSource.query(
        `
          SELECT COUNT(*) AS count
          FROM "NGUOIDUNG" nd
          WHERE nd."facebookId" IS NOT NULL
        `,
      ),
      await this.dataSource.query(
        `
          SELECT COUNT(*) AS count
          FROM "NGUOIDUNG" nd
          WHERE nd."googleId" IS NULL AND nd."facebookId" IS NULL
        `,
      ),
    ]);

    const stats = [
      {
        method: 'Google',
        count: parseInt(google[0].count),
      },
      {
        method: 'Facebook',
        count: parseInt(facebook[0].count),
      },
      {
        method: 'Email',
        count: parseInt(email[0].count),
      },
    ];

    await this.redisService.set(cacheKey, stats, 1800);

    return stats;
  }

  /**
   * Clear cache thống kê khi có thay đổi dữ liệu user
   */
  private async clearUserStatsCache() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const cacheKeys = [
      `user_stats:${currentYear}`,
      `user_stats:${currentYear}:${currentMonth}`,
      'total_users',
      'registration_method_stats',
    ];

    await Promise.all(cacheKeys.map((key) => this.redisService.del(key)));
  }
}
