import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BaiGiang } from './entities/baigiang.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateBaiGiangDto } from './dto/create-baigiang.dto';
import { KhoaHocService } from '../khoahoc/khoahoc.service';
import { GhiChuDto } from './dto/ghichu.dto';
import { GhiChu } from './entities/ghichu.entity';
import { BinhLuanDto } from './dto/binhluan.dto';
import { BinhLuanBaiGiang } from './entities/binhluan-baigiang.entity';
import { NguoiDung } from '../nguoidung/entities/nguoidung.entity';
import { UpdateBaiGiangDto } from './dto/update-baigiang.dto';
import { CreateDocDto } from './dto/create-doc.dto';
import { TailieuBaiGiang } from './entities/tailieu-baigiang.entity';

@Injectable()
export class BaiGiangService {
  constructor(
    @InjectRepository(BaiGiang)
    private readonly baiGiangRepository: Repository<BaiGiang>,
    @InjectRepository(GhiChu)
    private readonly ghiChuRepository: Repository<GhiChu>,
    @InjectRepository(BinhLuanBaiGiang)
    private readonly binhLuanRepository: Repository<BinhLuanBaiGiang>,
    @InjectRepository(TailieuBaiGiang)
    private readonly tailieuBaiGiangRepository: Repository<TailieuBaiGiang>,
    @Inject()
    private readonly khoaHocService: KhoaHocService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  //tạo bài giảng mới
  async taoBaiGiangMoi(baiGiangs: CreateBaiGiangDto[]) {
    for (const baiGiang of baiGiangs) {
      const { maKhoaHoc, tieuDe, moTa, videoUrl, thuTu } = baiGiang;

      //kiểm tra khóa học có tồn tại
      const khoaHoc = await this.khoaHocService.findCourseById(maKhoaHoc);

      if (!khoaHoc) {
        throw new BadRequestException('Khóa học không tồn tại');
      }

      const savedBaiGiang = this.baiGiangRepository.create({
        tieuDe,
        moTa,
        videoUrl,
        thuTu,
        khoaHoc: khoaHoc,
      });

      await this.baiGiangRepository.save(savedBaiGiang);
    }

    return 'Thêm bài giảng thành công';
  }

  //SERVICE LẤY DANH SÁCH BÀI GIẢNG CỦA KHÓA HỌC
  async getAllLectureByCourseId(courseId: string) {
    const result = await this.dataSource.query(
      `
        SELECT 
          bg.*, 
          tlbg."urlTaiLieu"
        FROM "BAIGIANG" bg
        LEFT JOIN "TAILIEU_BAIGIANG" tlbg ON tlbg."maBaiGiang" = bg.id
        WHERE bg."maKhoaHoc" = $1
        ORDER BY bg."thuTu" DESC
      `,
      [courseId],
    );

    return result;
  }

  // SERVICE THÊM BÀI GIẢNG
  async addNewLecture(dto: CreateBaiGiangDto) {
    const { maKhoaHoc, tieuDe, moTa, videoUrl, thuTu } = dto;

    const khoaHoc = await this.khoaHocService.findCourseById(maKhoaHoc);
    if (!khoaHoc) {
      throw new BadRequestException('Khóa học không tồn tại');
    }

    const savedBaiGiang = this.baiGiangRepository.create({
      tieuDe,
      moTa,
      videoUrl,
      thuTu,
      khoaHoc: khoaHoc,
    });

    await this.baiGiangRepository.save(savedBaiGiang);
  }

  //SERVICE CẬP NHẬT BÀI GIẢNG
  async updateLecture(updateBaiGiangDto: UpdateBaiGiangDto) {
    const { maBaiGiang, tieuDe, moTa, videoUrl, thuTu } = updateBaiGiangDto;

    const baiGiang = await this.baiGiangRepository.findOne({
      where: { id: maBaiGiang },
    });

    if (!baiGiang) {
      throw new BadRequestException('Bài giảng không tồn tại');
    }

    if (tieuDe) {
      baiGiang.tieuDe = tieuDe;
    }

    if (moTa) {
      baiGiang.moTa = moTa;
    }

    if (videoUrl) {
      baiGiang.videoUrl = videoUrl;
    }

    if (thuTu) {
      baiGiang.thuTu = thuTu;
    }

    await this.baiGiangRepository.save(baiGiang);
  }

  //SERVICE XÓA BÀI GIẢNG
  async deleteLecture(maBaiGiang: string) {
    const baiGiang = await this.baiGiangRepository.findOne({
      where: { id: maBaiGiang },
    });

    if (!baiGiang) {
      throw new BadRequestException('Bài giảng không tồn tại');
    }

    await this.baiGiangRepository.delete(maBaiGiang);
  }

  //SERVICE TẠO GHI CHÚ MỚI
  async createNote(ghiChu: GhiChuDto) {
    const { maNguoiDung, maBaiGiang, noiDung } = ghiChu;

    if (!maNguoiDung || !maBaiGiang || !noiDung) {
      throw new BadRequestException('Vui lòng nhập tất cả các trường');
    }

    const ghiChuEntity = this.ghiChuRepository.create({
      noiDung,
      nguoiDung: { id: maNguoiDung } as NguoiDung,
      baiGiang: { id: maBaiGiang } as BaiGiang,
    });

    await this.ghiChuRepository.save(ghiChuEntity);

    return {
      success: true,
      message: 'Thêm ghi chú thành công',
    };
  }

  // SERVICE XÓA GHI CHÚ
  async deleteNote(id: string) {
    const result = await this.ghiChuRepository.delete(id);
    return result;
  }

  // SERVICE LẤY DANH SÁCH GHI CHÚ CỦA NGƯỜI Ở BÀI GIẢNG
  async getAllNoteOfUser({ maNguoiDung, maBaiGiang }) {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM "GHICHU" gh
        WHERE gh."maNguoiDung" = $1
              AND gh."maBaiGiang" = $2
        ORDER BY gh."createdAt" DESC
      `,
      [maNguoiDung, maBaiGiang],
    );

    return result;
  }

  //SERVICE TẠO BÌNH LUẬN BÀI GIẢNG MỚI
  async createComment(binhLuan: BinhLuanDto, maNguoiDung: string) {
    const { maBaiGiang, noiDung, dinhKem } = binhLuan;

    if (!maBaiGiang || !maNguoiDung) {
      throw new BadRequestException('Thiếu thông tin người dùng và bài giảng');
    }

    if (!noiDung && !dinhKem) {
      throw new BadRequestException('Cần nhập nội dung hoặc đính kèm');
    }

    const binhLuanEntity = this.binhLuanRepository.create({
      noiDung,
      dinhKem,
      baiGiang: { id: maBaiGiang } as BaiGiang,
      nguoiDung: { id: maNguoiDung } as NguoiDung,
    });

    await this.binhLuanRepository.save(binhLuanEntity);

    return {
      success: true,
      message: 'Thêm bình luận thành công',
    };
  }

  //SERVICE LẤY DANH SÁCH BÌNH LUẬN CỦA BÀI GIẢNG
  async getAllCommentOfBaiGiang({ maBaiGiang }) {
    const result = await this.dataSource.query(
      `
        SELECT bl.*, nd."hoTen", nd."hinhAnh"
        FROM "BINHLUAN_BAIGIANG" bl
        JOIN "NGUOIDUNG" nd ON bl."maNguoiDung" = nd.id
        WHERE bl."maBaiGiang" = $1
        ORDER BY bl."createdAt" ASC
      `,
      [maBaiGiang],
    );

    return result;
  }

  // SERVICE XÓA BÌNH LUẬN BÀI GIẢNG
  async deleteComment(maBinhLuan: string, maNguoiDung: string) {
    const comment = await this.binhLuanRepository.findOne({
      where: {
        id: maBinhLuan,
      },
      relations: ['nguoiDung'],
    });
    if (!comment) {
      throw new BadRequestException('Bình luận không tồn tại');
    }
    if (comment.nguoiDung.id !== maNguoiDung) {
      throw new BadRequestException('Không có quyền xóa bình luận');
    }
    const result = await this.binhLuanRepository.delete(maBinhLuan);
    return result;
  }

  /**
   * SERVICE LẤY DANH SÁCH TÀI LIỆU BÀI GIẢNG
   */
  async getAllDocByLectureId(maBaiGiang: string) {
    const result = await this.dataSource.query(
      `
        SELECT tlbg.*
        FROM "TAILIEU_BAIGIANG" tlbg
        WHERE tlbg."maBaiGiang" = $1
      `,
      [maBaiGiang],
    );

    return result[0];
  }

  /**
   * SERVICE TẠO TÀI LIỆU MỚI
   */
  async createDoc(doc: CreateDocDto) {
    const { maBaiGiang, url, name } = doc;

    const baiGiang = await this.baiGiangRepository.findOne({
      where: { id: maBaiGiang },
    });

    if (!baiGiang) {
      throw new BadRequestException('Bài giảng không tồn tại');
    }

    let existingDoc = await this.tailieuBaiGiangRepository.findOne({
      where: { baiGiang: { id: maBaiGiang } },
    });

    const newDocument = { name, url };

    if (existingDoc) {
      existingDoc.urlTaiLieu.push(newDocument);
      await this.tailieuBaiGiangRepository.save(existingDoc);

      return {
        success: true,
        message: 'Thêm file tài liệu thành công',
      };
    } else {
      const taiLieuEntity = this.tailieuBaiGiangRepository.create({
        baiGiang: baiGiang,
        urlTaiLieu: [newDocument],
      });

      await this.tailieuBaiGiangRepository.save(taiLieuEntity);

      return {
        success: true,
        message: 'Tạo tài liệu và thêm file thành công',
      };
    }
  }

  /**
   * SERVICE XÓA TÀI LIỆU
   */
  async deleteFileFromDocument(maBaiGiang: string, urlToDelete: string) {
    if (!maBaiGiang || !urlToDelete) {
      throw new BadRequestException('Vui lòng nhập đầy đủ thông tin');
    }

    const taiLieu = await this.tailieuBaiGiangRepository.findOne({
      where: { baiGiang: { id: maBaiGiang } },
    });

    if (!taiLieu) {
      throw new BadRequestException('Tài liệu không tồn tại');
    }

    taiLieu.urlTaiLieu = taiLieu.urlTaiLieu.filter(
      (doc) => doc.url !== urlToDelete,
    );

    console.log(urlToDelete);
    console.log(taiLieu.urlTaiLieu);

    if (taiLieu.urlTaiLieu.length === 0) {
      await this.tailieuBaiGiangRepository.delete(taiLieu.id);
      return {
        success: true,
        message: 'Xóa tài liệu thành công',
      };
    }

    await this.tailieuBaiGiangRepository.save(taiLieu);

    return {
      success: true,
      message: 'Xóa file thành công',
    };
  }
}
