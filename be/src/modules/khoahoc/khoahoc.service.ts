import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KhoaHoc } from './entities/khoahoc.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateKhoaHocDto } from './dto/create-khoahoc.dto';
import { NguoiDungKhoaHoc } from './entities/nguoidung_khoahoc.entity';
import { FilterCourseDto } from './dto/filter-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { NguoiDung } from '../nguoidung/entities/nguoidung.entity';
import { getWeekDateRange } from '../../common/utils/index';
import { NguoiDungService } from '../nguoidung/nguoidung.service';
import { VaiTro } from 'src/common/constants/role.enum';
import { RedisService } from 'src/services/redis/redis.service';

@Injectable()
export class KhoaHocService {
  constructor(
    @InjectRepository(KhoaHoc)
    private readonly khoaHocRepository: Repository<KhoaHoc>,
    @InjectRepository(NguoiDungKhoaHoc)
    private readonly nguoiDungKhoaHocRepo: Repository<NguoiDungKhoaHoc>,
    private readonly nguoiDungService: NguoiDungService,
    private readonly redisService: RedisService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /**
   * SERVICE LẤY THÔNG TIN KHÓA HỌC THEO ID
   * OUTPUT: KHÓA HỌC + DANH SÁCH BÀI GIẢNG
   */
  async findCourseById(maKhoaHoc: string) {
    const cacheKey = `course:${maKhoaHoc}`;
    const cachedCourse = await this.redisService.get(cacheKey);

    if (cachedCourse) {
      return cachedCourse;
    }

    const khoaHoc = await this.dataSource.query(
      `
        SELECT *
        FROM "KHOAHOC" kh
        WHERE kh."id" = $1
      `,
      [maKhoaHoc],
    );

    if (!khoaHoc) {
      throw new BadRequestException('Khóa học không tồn tại');
    }

    const baiGiangs = await this.dataSource.query(
      `
        SELECT * 
        FROM "BAIGIANG" bg
        WHERE bg."maKhoaHoc" = $1
      `,
      [maKhoaHoc],
    );

    const result = {
      ...khoaHoc[0],
      baiGiangs,
    };

    await this.redisService.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * SERVICE TẠO KHÓA HỌC MỚI
   * INPUT: CreateKhoaHocDto: thông tin khóa học + danh sách bài giảng
   */
  async createNewCourse(khoaHoc: CreateKhoaHocDto) {
    const { tenKhoaHoc, moTa, giaBan, hinhAnh, maNguoiTao } = khoaHoc;

    const kh = await this.khoaHocRepository.findOne({
      where: { tenKhoaHoc },
    });

    if (kh) {
      throw new ConflictException('Tên khóa học đã được sử dụng.');
    }

    const nguoiDung = { id: maNguoiTao } as NguoiDung;
    const dto = this.khoaHocRepository.create({
      tenKhoaHoc,
      moTa,
      giaBan: Number(giaBan),
      hinhAnh,
      nguoiDung,
    });

    const savedKhoaHoc = await this.khoaHocRepository.save(dto);

    await this.clearCourseStatsCache();
    await this.clearUserCoursesCache(maNguoiTao);

    return {
      message: 'Thêm khóa học thành công',
      data: savedKhoaHoc,
    };
  }

  // SERVICE LẤY DANH SÁCH KHÓA HỌC
  // ADMIN
  async findAll(filterDto: FilterCourseDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      priceMin,
      priceMax,
      createdAtFrom,
      createdAtTo,
      deletedAt,
    } = filterDto;

    const queryBuilder = this.khoaHocRepository
      .createQueryBuilder('kh')
      .withDeleted();

    if (search) {
      queryBuilder.andWhere(
        '(unaccent(kh."tenKhoaHoc") ILIKE unaccent(:search))',
        { search: `%${search}%` },
      );
    }

    if (priceMin) {
      queryBuilder.andWhere('kh."giaBan" >= :priceMin', {
        priceMin: Number(priceMin),
      });
    }

    if (priceMax) {
      queryBuilder.andWhere('kh."giaBan" <= :priceMax', {
        priceMax: Number(priceMax),
      });
    }

    if (createdAtFrom) {
      queryBuilder.andWhere('kh."createdAt" >= :createdAtFrom', {
        createdAtFrom: new Date(createdAtFrom),
      });
    }

    if (createdAtTo) {
      queryBuilder.andWhere('kh."createdAt" <= :createdAtTo', {
        createdAtTo: new Date(createdAtTo),
      });
    }

    if (deletedAt) {
      if (deletedAt === 'true') {
        queryBuilder.andWhere('kh."deletedAt" IS NOT NULL');
      } else {
        queryBuilder.andWhere('kh."deletedAt" IS NULL');
      }
    }

    if (sortBy && this.isValidColumn(sortBy)) {
      queryBuilder.orderBy(`kh.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('kh.createdAt', 'DESC');
    }

    queryBuilder.offset((page - 1) * limit).limit(limit);

    const [courses, total] = await queryBuilder.getManyAndCount();

    return {
      courses,
      total,
    };
  }

  private isValidColumn(column: string): boolean {
    const validColumns = [
      'tenKhoaHoc',
      'moTa',
      'giaBan',
      'tieuDe',
      'createdAt',
      'updatedAt',
    ];
    return validColumns.includes(column);
  }

  //SERVICE Cập nhật khóa học
  async updateCourse(
    id: string,
    updateCourseDto: UpdateCourseDto,
    userId: string,
  ) {
    const { tenKhoaHoc, moTa, giaBan, hinhAnh, maNguoiTao } = updateCourseDto;

    const khoaHoc = await this.khoaHocRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['nguoiDung'],
    });

    if (!khoaHoc) {
      throw new NotFoundException(`Khóa học không tồn tại`);
    }

    const user = await this.nguoiDungService.findUserById(userId);

    if (user?.vaiTro !== VaiTro.ADMIN || user?.id !== khoaHoc.nguoiDung?.id) {
      throw new ConflictException('Khóa học không thể cập nhật');
    }

    if (tenKhoaHoc) {
      khoaHoc.tenKhoaHoc = tenKhoaHoc;
    }

    if (moTa) {
      khoaHoc.moTa = moTa;
    }

    if (giaBan) {
      khoaHoc.giaBan = Number(giaBan);
    }

    if (hinhAnh) {
      khoaHoc.hinhAnh = hinhAnh;
    }

    if (maNguoiTao) {
      const nguoiDung = { id: maNguoiTao } as NguoiDung;
      khoaHoc.nguoiDung = nguoiDung;
    }

    await this.khoaHocRepository.save(khoaHoc);

    await this.redisService.del(`course:${id}`);
    await this.clearUserCoursesCache(khoaHoc.nguoiDung?.id);

    return {
      success: true,
      message: 'Khóa học đã được cập nhật thành công',
    };
  }

  //SERVICE Xóa khóa học soft remove + hard remove khóa học
  async remove(id: string, userId: string) {
    const khoaHoc = await this.khoaHocRepository.findOne({
      where: { id },
      relations: ['nguoiDung'],
      withDeleted: true,
    });

    if (!khoaHoc) {
      throw new NotFoundException(`Khóa học không tồn tại`);
    }

    const user = await this.nguoiDungService.findUserById(userId);

    if (user?.vaiTro !== VaiTro.ADMIN || user?.id !== khoaHoc.nguoiDung?.id) {
      throw new ConflictException('Khóa học không thể xóa');
    }

    if (khoaHoc.deletedAt) {
      await this.khoaHocRepository.remove(khoaHoc);
    } else {
      await this.khoaHocRepository.softRemove(khoaHoc);
    }

    await this.redisService.del(`course:${id}`);
    await this.clearUserCoursesCache(khoaHoc.nguoiDung?.id);
    await this.clearCourseStatsCache();

    return {
      success: true,
      message: khoaHoc.deletedAt
        ? 'Khóa học đã bị xóa vĩnh viễn'
        : 'Khóa học đã được xóa thành công',
    };
  }

  // SERVICE KHÔI PHỤC KHÓA HỌC
  async storeCourse(id: string) {
    const khoaHoc = await this.khoaHocRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['nguoiDung'],
    });

    if (!khoaHoc) {
      throw new NotFoundException(`Khóa học không tồn tại`);
    }

    if (khoaHoc.deletedAt) {
      await this.khoaHocRepository.restore(khoaHoc.id);

      await this.clearUserCoursesCache(khoaHoc.nguoiDung?.id);
      await this.clearCourseStatsCache();

      return {
        success: true,
        message: 'Khóa học đã được khôi phục',
      };
    }
  }

  // SERVICE NGƯỜI DÙNG ĐĂNG KÝ KHÓA HỌC
  async createCourseRegistration(maKhoaHoc: string, maNguoiDung: string) {
    const khDangKy = await this.nguoiDungKhoaHocRepo.findOne({
      where: {
        khoaHoc: { id: maKhoaHoc },
        nguoiDung: { id: maNguoiDung },
      },
    });

    if (khDangKy) {
      return khDangKy;
    }

    const nguoiDung = { id: maNguoiDung } as NguoiDung;
    const khoaHoc = { id: maKhoaHoc } as KhoaHoc;
    const dto = this.nguoiDungKhoaHocRepo.create({
      nguoiDung,
      khoaHoc,
    });

    const saved = await this.nguoiDungKhoaHocRepo.save(dto);

    await this.clearUserCoursesCache(maNguoiDung);
    await this.clearCourseStatsCache();

    return saved;
  }

  // SERVICE LẤY DANH SÁCH KHÓA HỌC THEO MÃ NGƯỜI DÙNG
  async getCoursesByUserId(maNguoiDung: string) {
    const cacheKey = `user_courses:${maNguoiDung}`;
    const cachedCourses = await this.redisService.get(cacheKey);

    if (cachedCourses) {
      return cachedCourses;
    }

    const courses = await this.khoaHocRepository.find({
      where: { nguoiDung: { id: maNguoiDung } },
      order: { createdAt: 'DESC' },
    });

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, courses, 1800);

    return courses;
  }

  /**************************************************
   * SERVICE THỐNG KÊ KHÓA HỌC
   */
  async getCourseStats(year: number, month?: number) {
    const cacheKey = month
      ? `course_stats:${year}:${month}`
      : `course_stats:${year}`;

    const cachedStats = await this.redisService.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    const [total, registrationCourseStats, top3PopolarCourses] =
      await Promise.all([
        await this.getTotalCoursesAndLectures(),
        await this.getRegistrationCourseStats(year, month),
        await this.getTop3PopularCourses(year, month),
      ]);

    const result = {
      total,
      registrationCourseStats,
      top3PopolarCourses,
    };

    const now = new Date();
    const isCurrentPeriod = month
      ? year === now.getFullYear() && month === now.getMonth() + 1
      : year === now.getFullYear();

    const ttl = isCurrentPeriod ? 3600 : 86400; // 1 hour : 1 day
    await this.redisService.set(cacheKey, result, ttl);

    return result;
  }

  private async getTotalCoursesAndLectures() {
    const cacheKey = 'total_courses_lectures';
    const cachedTotal = await this.redisService.get(cacheKey);

    if (cachedTotal) {
      return cachedTotal;
    }

    const [courses_count, lectures_count, users_count] = await Promise.all([
      await this.khoaHocRepository.count(),
      await this.dataSource.query(`
        SELECT COUNT(*) FROM "BAIGIANG" bg
      `),
      await this.dataSource.query(`
        SELECT COUNT(*) FROM "NGUOIDUNG_KHOAHOC"
      `),
    ]);

    const result = {
      courses: courses_count,
      lectures: lectures_count[0].count,
      users: users_count[0].count,
    };

    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }

  private async getRegistrationCourseStats(year: number, month?: number) {
    if (month) {
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 1));

      const daysInMonth =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const maxWeeks = Math.ceil((daysInMonth + startDate.getUTCDay()) / 7);

      const query = `
        SELECT
          FLOOR((
            EXTRACT(DAY FROM (ndkh."createdAt" - $1::timestamp)) +
            EXTRACT(DOW FROM $1::timestamp)
          ) / 7) + 1 AS week,
          COUNT(*) AS count
        FROM "NGUOIDUNG_KHOAHOC" ndkh
        WHERE ndkh."createdAt" >= $1 AND ndkh."createdAt" < $2
        GROUP BY week
        ORDER BY week ASC
      `;

      const result = await this.dataSource.query(query, [startDate, endDate]);

      const stats = Array.from({ length: maxWeeks }, (_, index) => {
        const week = index + 1;
        const record = result.find((r) => parseInt(r.week) === week);
        return {
          period: getWeekDateRange(week, startDate, daysInMonth, month),
          count: parseInt(record?.count) || 0,
        };
      });

      return stats;
    } else {
      const startDate = `${year}-01-01`;
      const endDate = `${year + 1}-01-01`;

      const query = `
        SELECT
          EXTRACT(MONTH FROM ndkh."createdAt") AS month,
          COUNT(*) AS count
        FROM "NGUOIDUNG_KHOAHOC" ndkh
        WHERE ndkh."createdAt" >= $1 AND ndkh."createdAt" < $2
        GROUP BY month
        ORDER BY month ASC
      `;

      const result = await this.dataSource.query(query, [startDate, endDate]);

      const stats = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const record = result.find((r) => parseInt(r.month) === month);
        return {
          period: `Tháng ${month}`,
          count: parseInt(record?.count) || 0,
        };
      });

      return stats;
    }
  }

  private async getTop3PopularCourses(year: number, month?: number) {
    const cacheKey = month
      ? `top3_courses:${year}:${month}`
      : `top3_courses:${year}`;

    const cachedTop3 = await this.redisService.get(cacheKey);
    if (cachedTop3) {
      return cachedTop3;
    }

    let startDate: Date;
    let endDate: Date;
    if (month) {
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 1));
    } else {
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year + 1, 0, 1));
    }

    const result = await this.dataSource.query(
      `
        SELECT kh."tenKhoaHoc", COUNT(ndkh.*) AS count
        FROM "KHOAHOC" kh
        INNER JOIN "NGUOIDUNG_KHOAHOC" ndkh ON ndkh."maKhoaHoc" = kh.id
                  AND ndkh."createdAt" >= $1 AND ndkh."createdAt" < $2
        GROUP BY kh."tenKhoaHoc"
        ORDER BY count DESC
        LIMIT 3
      `,
      [startDate, endDate],
    );

    const stats = result.map((r, index) => {
      return {
        top: index + 1,
        name: r.tenKhoaHoc,
      };
    });

    await this.redisService.set(cacheKey, stats, 3600);

    return stats;
  }

  private async clearUserCoursesCache(userId?: string) {
    if (userId) {
      await this.redisService.del(`user_courses:${userId}`);
    }
  }

  private async clearCourseStatsCache() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const cacheKeys = [
      `course_stats:${currentYear}`,
      `course_stats:${currentYear}:${currentMonth}`,
      `top3_courses:${currentYear}`,
      `top3_courses:${currentYear}:${currentMonth}`,
      'total_courses_lectures',
    ];

    await Promise.all(cacheKeys.map((key) => this.redisService.del(key)));
  }
}
