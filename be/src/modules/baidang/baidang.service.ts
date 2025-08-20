import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BaiDang } from './entities/baidang.entity';
import { DataSource, Repository } from 'typeorm';
import { BlogStatusEnum } from '../../common/constants/blog-status.enum';
import { PhanHoiDto } from './dto/phan-hoi.dto';
import { PhanHoiBaiDang } from './entities/phanhoi_baidang.entity';
import { QueryDto } from './dto/query.dto';
import { NguoiDung } from '../nguoidung/entities/nguoidung.entity';
import { FilterBlogDto } from './dto/filter-blog.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { VaiTro } from '../../common/constants/role.enum';
import { RedisService } from 'src/services/redis/redis.service';

@Injectable()
export class BaiDangService {
  constructor(
    @InjectRepository(BaiDang)
    private readonly baiDangRepository: Repository<BaiDang>,
    @InjectRepository(PhanHoiBaiDang)
    private readonly phanHoiBaiDangRepository: Repository<PhanHoiBaiDang>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  //SERVICE LẤY DANH SÁCH BÀI VIẾT CỦA NGƯỜI DÙNG
  async getAllBlogOfUserById(maNguoiDung: string) {
    const blogs = await this.baiDangRepository.find({
      where: { nguoiDung: { id: maNguoiDung } },
      relations: ['nguoiDung'],
      order: { createdAt: 'DESC' },
    });

    return blogs;
  }

  // lấy chi tiết bài đăng theo id bao gồm các phản hồi-bình luận
  async getBlogById(id: string) {
    const baiDang = await this.dataSource.query(
      `
        SELECT *
        FROM "BAIDANG" bd
        WHERE bd.id = $1
      `,
      [id],
    );

    const nguoiDung = await this.dataSource.query(
      `
        SELECT nd."hoTen", nd."hinhAnh"
        FROM "BAIDANG" bd
        JOIN "NGUOIDUNG" nd ON bd."maNguoiDung" = nd.id
        WHERE nd.id = $1
      `,
      [baiDang[0]?.maNguoiDung],
    );

    const phanHoiBaiDang = await this.dataSource.query(
      `
        SELECT phbd."noiDung", phbd."dinhKem", phbd."createdAt", nd."hoTen", nd."hinhAnh"
        FROM "BAIDANG" bd
        JOIN "PHANHOI_BAIDANG" phbd ON bd.id = phbd."maBaiDang"
        JOIN "NGUOIDUNG" nd ON phbd."maNguoiDung" = nd.id
        WHERE phbd."maBaiDang" = $1
      `,
      [id],
    );

    return {
      ...baiDang[0],
      nguoiDung: nguoiDung[0],
      phanHoiBaiDang,
    };
  }

  async getAllBlog() {
    const blogs = await this.baiDangRepository.find({
      relations: ['nguoiDung'],
      select: {
        nguoiDung: {
          id: true,
          hoTen: true,
          hinhAnh: true,
        },
      },
    });

    return blogs;
  }

  /**
   * ADMIN
   * SERVICE LẤY DANH SÁCH BÀI VIẾT
   * OUTPUT: DANH SÁCH BÀI VIẾT + FILTER
   */
  async getAllBlogWithFilters(filterDto: FilterBlogDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      status,
      createdAtFrom,
      createdAtTo,
    } = filterDto;

    const queryBuilder = this.baiDangRepository
      .createQueryBuilder('bd')
      .withDeleted()
      .leftJoin('bd.nguoiDung', 'nd')
      .addSelect(['nd.id', 'nd.hoTen', 'nd.hinhAnh']);

    if (search) {
      queryBuilder.where('unaccent(bd."tieuDe") ILIKE unaccent(:search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('bd."trangThai" = :status', { status });
    }

    if (createdAtFrom) {
      queryBuilder.andWhere('bd."createdAt" >= :createdAtFrom', {
        createdAtFrom,
      });
    }

    if (createdAtTo) {
      queryBuilder.andWhere('bd."createdAt" <= :createdAtTo', { createdAtTo });
    }

    if (sortBy && this.isValidColumn(sortBy)) {
      queryBuilder.orderBy(`bd.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('bd."createdAt"', 'DESC');
    }

    queryBuilder.offset((page - 1) * limit).limit(limit);

    const [blogs, total] = await queryBuilder.getManyAndCount();

    return {
      blogs,
      total,
    };
  }

  private isValidColumn(column: string): boolean {
    const validColumns = [
      'tieuDe',
      'createdAt',
      'updatedAt',
      'luotThich',
      'trangThai',
    ];
    return validColumns.includes(column);
  }

  /**
   * SERVICE ĐĂNG BÀI VIẾT MỚI
   */
  async createBlog(baiDang: CreateBlogDto) {
    const { tieuDe, noiDungMarkdown, noiDungHTML, hinhAnh, maNguoiDung } =
      baiDang;

    if (!tieuDe || !noiDungMarkdown || !noiDungHTML || !maNguoiDung) {
      throw new BadRequestException('Thiếu thông tin cần thiết');
    }

    const nguoiDung = { id: maNguoiDung } as NguoiDung;

    const dto = this.baiDangRepository.create({
      tieuDe,
      noiDungMarkdown,
      noiDungHTML,
      hinhAnh,
      nguoiDung,
      trangThai: BlogStatusEnum.PUBLISHED,
    });

    try {
      await this.baiDangRepository.save(dto);
      await this.clearCacheClassifiedBlogs();
      return dto;
    } catch (error) {
      throw new BadRequestException('Lỗi lưu bài đăng', error);
    }
  }

  /**
   * SERVICE CẬP NHẬT BÀI VIẾT
   */
  async updateBlog(id: string, updateBlogDto: UpdateBlogDto) {
    const blog = await this.baiDangRepository.findOne({
      where: { id },
      relations: ['nguoiDung'],
    });

    if (!blog) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    if (blog.nguoiDung.id !== updateBlogDto.maNguoiDung) {
      throw new ForbiddenException('Bạn không có quyền cập nhật bài đăng này');
    }

    Object.assign(blog, updateBlogDto);

    try {
      const baiDangDaCapNhat = await this.baiDangRepository.save(blog);
      await this.clearCacheClassifiedBlogs();
      return baiDangDaCapNhat;
    } catch (error) {
      throw new BadRequestException('Lỗi cập nhật bài đăng', error);
    }
  }

  /**
   * SERVICE CẬP NHẬT TRẠNG THÁI BÀI VIẾT
   */
  async updateStatusBlog(id: string, status: BlogStatusEnum) {
    const blog = await this.baiDangRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    blog.trangThai = status;

    try {
      const baiDangDaCapNhat = await this.baiDangRepository.save(blog);
      await this.clearCacheClassifiedBlogs();
      return baiDangDaCapNhat;
    } catch (error) {
      throw new BadRequestException('Lỗi cập nhật trạng thái bài đăng', error);
    }
  }

  /**
   * SERVICE XÓA BÀI VIẾT (XÓA VĨNH VIỄN)
   */
  async removeBlog(id: string, maNguoiDung: string) {
    const blog = await this.baiDangRepository.findOne({
      where: { id },
      relations: ['nguoiDung'],
    });

    if (!blog) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    const user = await this.dataSource.query(
      `
        SELECT *
        FROM "NGUOIDUNG" nd
        WHERE nd."id" = $1
      `,
      [maNguoiDung],
    );

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (user[0].vaiTro !== VaiTro.ADMIN && blog.nguoiDung.id !== maNguoiDung) {
      throw new ForbiddenException('Bạn không có quyền xóa bài đăng này');
    }

    await this.baiDangRepository.remove(blog);
    await this.clearCacheClassifiedBlogs();

    return {
      success: true,
      message: 'Bài đăng đã được xóa thành công',
    };
  }

  // tạo phản hồi - bình luận
  async createCommentBlog(phanHoiBaiDang: PhanHoiDto) {
    const { noiDung, dinhKem, maBaiDang, maNguoiDung } = phanHoiBaiDang;

    if (!maBaiDang || !maNguoiDung) {
      throw new BadRequestException('Thiếu thông tin cần thiết');
    }

    if (!noiDung && !dinhKem) {
      throw new BadRequestException('Thiếu thông tin cần thiết');
    }

    const baiDang = { id: maBaiDang } as BaiDang;
    const nguoiDung = { id: maNguoiDung } as NguoiDung;

    const dto = this.phanHoiBaiDangRepository.create({
      noiDung,
      dinhKem,
      baiDang,
      nguoiDung,
    });

    try {
      await this.phanHoiBaiDangRepository.save(dto);
      return dto;
    } catch (error) {
      throw new BadRequestException('Lỗi lưu phản hồi bài đăng', error);
    }
  }

  async likeOrDislikeBlog(maBaiDang: string, maNguoiDung: string) {
    const blog = await this.baiDangRepository.findOne({
      where: { id: maBaiDang },
    });

    if (!blog) {
      throw new BadRequestException('Không tìm thấy bài đăng này');
    }

    const likedUserIds = blog.luotThich || [];

    const index = likedUserIds.indexOf(maNguoiDung);

    if (index > -1) {
      likedUserIds.splice(index, 1);
    } else {
      likedUserIds.push(maNguoiDung);
    }

    blog.luotThich = likedUserIds;

    try {
      await this.baiDangRepository.save(blog);
      return blog;
    } catch (error) {
      throw new BadRequestException('Lỗi lưu bài đăng', error);
    }
  }

  /*****************************************************
   * SERVICE THỐNG KÊ SỐ LIỆU BÀI ĐĂNG
   */
  async getBlogStats(year: number, month?: number) {
    const [totalBlogAndComment, countCreatedBlogInPeriod] = await Promise.all([
      this.getTotalBlogAndComment(),
      this.getCountCreatedBlogInPeriod(year, month),
    ]);

    return {
      totalBlogAndComment,
      countCreatedBlogInPeriod,
    };
  }

  private async getTotalBlogAndComment() {
    const [totalBlog, totalComment] = await Promise.all([
      this.dataSource.query(
        `
          SELECT COUNT(*) FROM "BAIDANG"
        `,
      ),
      this.dataSource.query(
        `
         SELECT COUNT(*) FROM "PHANHOI_BAIDANG"
        `,
      ),
    ]);

    return {
      totalBlog: totalBlog[0].count,
      totalComment: totalComment[0].count,
    };
  }

  private async getCountCreatedBlogInPeriod(year: number, month?: number) {
    let startDate: Date;
    let endDate: Date;

    if (month) {
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 1));
    } else {
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year + 1, 0, 1));
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM "BAIDANG" bd
      WHERE bd."createdAt" >= $1 AND bd."createdAt" < $2
    `;

    const result = await this.dataSource.query(query, [startDate, endDate]);

    return {
      period: month ? `tháng ${month}/${year}` : `năm ${year}`,
      total: parseInt(result[0]?.total || 0),
    };
  }

  private async clearCacheClassifiedBlogs() {
    await this.redisService.del('classified_blogs');
  }
}
