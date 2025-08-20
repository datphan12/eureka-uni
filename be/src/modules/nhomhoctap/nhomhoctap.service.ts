import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NhomHocTap } from './entities/nhomhoctap.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ThanhVienNhom } from './entities/thanhviennhom.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { TypeGroup } from '../../common/constants/type-group.enum';
import { RoleGroup } from '../../common/constants/role-group.enum';
import { TinNhanNhom } from './entities/tinnhannhom.entity';
import { FilterGroupDto } from './dto/filter-group.dto';
import { UpdateNhomHocTapDto } from './dto/update-nhomhoctap.dto';
import { NguoiDung } from '../nguoidung/entities/nguoidung.entity';
import { JoinGroupDto } from './dto/join-group.dto';
import { CreateMessageDto } from './dto/create-message.dto';

const MAX_COUNT_GROUP = 5;

@Injectable()
export class NhomHocTapService {
  constructor(
    @InjectRepository(NhomHocTap)
    private nhomHocTapRepository: Repository<NhomHocTap>,
    @InjectRepository(ThanhVienNhom)
    private thanhVienNhomRepository: Repository<ThanhVienNhom>,
    @InjectRepository(TinNhanNhom)
    private tinNhanNhomRepository: Repository<TinNhanNhom>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  //SERVICE Tạo nhóm học tập mới
  async createGroup(createGroupDto: CreateGroupDto) {
    const { tenNhom, gioiHanThanhVien, loaiNhom, maNguoiDung, maMoi } =
      createGroupDto;

    const result = await this.dataSource.query(
      `
        SELECT COUNT(*)
        FROM "THANHVIENNHOM" tv
        WHERE tv."maNguoiDung" = $1
      `,
      [maNguoiDung],
    );
    if (result[0].count >= MAX_COUNT_GROUP) {
      throw new BadRequestException('Nhóm học tập đã đạt giới hạn tối đa');
    }

    const checkExist = await this.nhomHocTapRepository.findOne({
      where: { tenNhom },
    });

    if (checkExist) {
      throw new ConflictException('Tên nhóm đã được sử dụng');
    }

    const nhomHocTap = this.nhomHocTapRepository.create({
      tenNhom,
      gioiHanThanhVien:
        Number(gioiHanThanhVien) > 0 ? Number(gioiHanThanhVien) : 5,
      loaiNhom: loaiNhom || TypeGroup.PERSONAL,
      nguoiDung: { id: maNguoiDung } as NguoiDung,
      maMoi,
    });
    await this.nhomHocTapRepository.save(nhomHocTap);

    const thanhVienNhom = this.thanhVienNhomRepository.create({
      nhomHocTap: { id: nhomHocTap.id } as NhomHocTap,
      nguoiDung: { id: maNguoiDung } as NguoiDung,
      vaiTro: RoleGroup.ADMIN,
    });
    await this.thanhVienNhomRepository.save(thanhVienNhom);

    return nhomHocTap;
  }

  //SERVICE tìm nhóm theo tên
  // Input: tenNhom, maNguoiDung
  // Điều kiện nhóm không phải do người dùng tạo và nhóm người dùng đã tham gia
  async getGroupByGroupName(tenNhom: string, maNguoiDung: string) {
    const result = await this.dataSource.query(
      `
        SELECT nh.*, 
          (
            SELECT COUNT(*)
            FROM "THANHVIENNHOM" tv
            WHERE tv."maNhom" = nh.id
          ) "soLuongThanhVien",
          (
            SELECT JSON_AGG(JSON_BUILD_OBJECT(
              'hoTen', nd."hoTen",
              'hinhAnh', nd."hinhAnh",
              'vaiTro', tv."vaiTro"
            ))
            FROM "THANHVIENNHOM" tv
            JOIN "NGUOIDUNG" nd ON nd.id = tv."maNguoiDung"
            WHERE tv."maNhom" = nh.id
          ) AS "thanhVien"
        FROM "NHOMHOCTAP" nh
        WHERE unaccent(nh."tenNhom") ILIKE unaccent($1)
              AND nh."maNguoiDung" != $2
              AND nh.id NOT IN (
                SELECT tv."maNhom"
                FROM "THANHVIENNHOM" tv
                WHERE tv."maNguoiDung" = $2
              )
      `,
      [`%${tenNhom}%`, maNguoiDung],
    );

    return result;
  }

  //SERVICE Tham gia nhóm học tập
  // Input: maNhom, maNguoiDung
  async joinGroup(joinGroupDto: JoinGroupDto) {
    const { maNhom, maNguoiDung } = joinGroupDto;

    const nhomHocTap = await this.nhomHocTapRepository.findOne({
      where: { id: maNhom },
    });

    if (!nhomHocTap) {
      throw new BadRequestException('Nhóm học tập không tồn tại');
    }

    const checkExist = await this.thanhVienNhomRepository.findOne({
      where: { nhomHocTap: { id: maNhom }, nguoiDung: { id: maNguoiDung } },
    });

    if (checkExist) {
      throw new ConflictException('Người dùng đã tham gia nhóm học tập');
    }

    const result = await this.dataSource.query(
      `
        SELECT COUNT(*)
        FROM "THANHVIENNHOM" tv
        WHERE tv."maNguoiDung" = $1
      `,
      [maNguoiDung],
    );
    if (result[0].count >= MAX_COUNT_GROUP) {
      throw new BadRequestException('Nhóm học tập đã đạt giới hạn tối đa');
    }

    const thanhVienNhomCount = await this.thanhVienNhomRepository.count({
      where: { nhomHocTap: { id: maNhom } },
    });
    if (thanhVienNhomCount >= nhomHocTap.gioiHanThanhVien) {
      throw new ConflictException(
        'Nhóm học tập đã đạt giới hạn thành viên nhóm',
      );
    }

    const thanhVienNhom = this.thanhVienNhomRepository.create({
      nhomHocTap: { id: maNhom } as NhomHocTap,
      nguoiDung: { id: maNguoiDung } as NguoiDung,
      vaiTro: RoleGroup.MEMBER,
    });
    await this.thanhVienNhomRepository.save(thanhVienNhom);

    return { message: 'Tham gia nhóm thành công', thanhVienNhom };
  }

  // SERVICE Tạo yêu cầu tham gia nhóm
  async createJoinRequest(maNhom: string, maNguoiDung: string) {
    const nhomHocTap = await this.nhomHocTapRepository.findOne({
      where: { id: maNhom },
    });

    if (!nhomHocTap) {
      throw new BadRequestException('Nhóm học tập không tồn tại');
    }

    const checkExist = await this.thanhVienNhomRepository.findOne({
      where: { nhomHocTap: { id: maNhom }, nguoiDung: { id: maNguoiDung } },
    });

    if (checkExist) {
      throw new ConflictException('Người dùng đã tham gia nhóm học tập');
    }

    const result = await this.dataSource.query(
      `SELECT COUNT(*) FROM "THANHVIENNHOM" tv WHERE tv."maNguoiDung" = $1`,
      [maNguoiDung],
    );
    if (result[0].count >= MAX_COUNT_GROUP) {
      throw new BadRequestException(
        'Bạn đã đạt giới hạn tối đa số nhóm tham gia',
      );
    }

    const thanhVienNhomCount = await this.thanhVienNhomRepository.count({
      where: { nhomHocTap: { id: maNhom } },
    });
    if (thanhVienNhomCount >= nhomHocTap.gioiHanThanhVien) {
      throw new ConflictException('Nhóm học tập đã đạt giới hạn thành viên');
    }

    if (nhomHocTap.loaiNhom === TypeGroup.COMMUNITY) {
      const thanhVienNhom = this.thanhVienNhomRepository.create({
        nhomHocTap: { id: maNhom } as NhomHocTap,
        nguoiDung: { id: maNguoiDung } as NguoiDung,
        vaiTro: RoleGroup.MEMBER,
      });
      await this.thanhVienNhomRepository.save(thanhVienNhom);

      return {
        message: 'Tham gia nhóm cộng đồng thành công',
        thanhVienNhom,
      };
    }

    let yeuCauThamGia: string[] = [];
    if (nhomHocTap.yeuCauThamGia) {
      try {
        yeuCauThamGia = JSON.parse(nhomHocTap.yeuCauThamGia);
      } catch (error) {
        yeuCauThamGia = [];
      }
    }

    if (yeuCauThamGia.includes(maNguoiDung)) {
      throw new ConflictException('Bạn đã gửi yêu cầu tham gia nhóm này');
    }

    yeuCauThamGia.push(maNguoiDung);
    nhomHocTap.yeuCauThamGia = JSON.stringify(yeuCauThamGia);

    await this.nhomHocTapRepository.save(nhomHocTap);

    return {
      message: 'Đã gửi yêu cầu tham gia nhóm',
    };
  }

  // SERVICE Chấp nhận/từ chối yêu cầu tham gia nhóm
  async approveJoinRequest(
    maNhom: string,
    maNguoiDung: string,
    approve: boolean,
    adminId: string,
  ) {
    const nhomHocTap = await this.nhomHocTapRepository.findOne({
      where: { id: maNhom },
      relations: ['nguoiDung'],
    });

    if (!nhomHocTap) {
      throw new BadRequestException('Nhóm học tập không tồn tại');
    }

    const isOwner = nhomHocTap.nguoiDung?.id === adminId;
    const adminMember = await this.thanhVienNhomRepository.findOne({
      where: {
        nhomHocTap: { id: maNhom },
        nguoiDung: { id: adminId },
        vaiTro: RoleGroup.ADMIN,
      },
      relations: ['nguoiDung', 'nhomHocTap'],
    });

    if (!isOwner && !adminMember) {
      throw new BadRequestException('Bạn không có quyền xử lý yêu cầu này');
    }

    let yeuCauThamGia: string[] = [];
    if (nhomHocTap.yeuCauThamGia) {
      try {
        yeuCauThamGia = JSON.parse(nhomHocTap.yeuCauThamGia);
      } catch (error) {
        yeuCauThamGia = [];
      }
    }

    if (!yeuCauThamGia.includes(maNguoiDung)) {
      throw new BadRequestException('Yêu cầu tham gia không tồn tại');
    }

    yeuCauThamGia = yeuCauThamGia.filter((id) => id !== maNguoiDung);
    nhomHocTap.yeuCauThamGia = JSON.stringify(yeuCauThamGia);

    if (approve) {
      const thanhVienNhomCount = await this.thanhVienNhomRepository.count({
        where: { nhomHocTap: { id: maNhom } },
      });
      if (thanhVienNhomCount >= nhomHocTap.gioiHanThanhVien) {
        throw new ConflictException('Nhóm học tập đã đạt giới hạn thành viên');
      }

      const thanhVienNhom = this.thanhVienNhomRepository.create({
        nhomHocTap: { id: maNhom } as NhomHocTap,
        nguoiDung: { id: maNguoiDung } as NguoiDung,
        vaiTro: RoleGroup.MEMBER,
      });
      await this.thanhVienNhomRepository.save(thanhVienNhom);
    }

    await this.nhomHocTapRepository.save(nhomHocTap);

    return {
      message: approve
        ? 'Đã chấp nhận yêu cầu tham gia'
        : 'Đã từ chối yêu cầu tham gia',
    };
  }

  // SERVICE Lấy danh sách yêu cầu tham gia nhóm
  async getJoinRequests(maNhom: string, adminId: string) {
    const nhomHocTap = await this.nhomHocTapRepository.findOne({
      where: { id: maNhom },
      relations: ['nguoiDung'],
    });

    if (!nhomHocTap) {
      throw new BadRequestException('Nhóm học tập không tồn tại');
    }

    const isOwner = nhomHocTap.nguoiDung?.id === adminId;
    const adminMember = await this.thanhVienNhomRepository.findOne({
      where: {
        nhomHocTap: { id: maNhom },
        nguoiDung: { id: adminId },
        vaiTro: RoleGroup.ADMIN,
      },
      relations: ['nguoiDung', 'nhomHocTap'],
    });

    if (!isOwner && !adminMember) {
      return;
    }

    let yeuCauThamGia: string[] = [];
    if (nhomHocTap.yeuCauThamGia) {
      try {
        yeuCauThamGia = JSON.parse(nhomHocTap.yeuCauThamGia);
      } catch (error) {
        yeuCauThamGia = [];
      }
    }

    if (yeuCauThamGia.length === 0) {
      return [];
    }

    const result = await this.dataSource.query(
      `
        SELECT nd.id, nd."hoTen", nd."hinhAnh"
        FROM "NGUOIDUNG" nd
        WHERE nd.id = ANY($1)
      `,
      [yeuCauThamGia],
    );

    return result;
  }

  //SERVICE rời khỏi nhóm
  // điều kiện: nếu là thành viên thì chỉ rời nhóm
  // nếu là chủ phòng thì giải tán nhóm
  async leaveGroup(maNhom: string, maNguoiDung: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nhom = await queryRunner.query(
        `SELECT * FROM "NHOMHOCTAP" WHERE id = $1`,
        [maNhom],
      );

      if (!nhom.length) {
        throw new BadRequestException('Nhóm không tồn tại');
      }

      const chuPhong = nhom[0].maNguoiDung === maNguoiDung;

      if (chuPhong) {
        await queryRunner.query(
          `DELETE FROM "THANHVIENNHOM" WHERE "maNhom"=$1`,
          [maNhom],
        );

        await queryRunner.query(
          `DELETE FROM "TINNHANNHOM" WHERE "maNhom" = $1`,
          [maNhom],
        );

        await queryRunner.query(`DELETE FROM "NHOMHOCTAP" WHERE id = $1`, [
          maNhom,
        ]);
      } else {
        await queryRunner.query(
          `DELETE FROM "THANHVIENNHOM" WHERE "maNhom" = $1 AND "maNguoiDung" =$2`,
          [maNhom, maNguoiDung],
        );
      }

      await queryRunner.commitTransaction();
      return { message: chuPhong ? 'Đã giải tán nhóm' : 'Đã rời nhóm' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Rời nhóm thất bại:', error.message);
    } finally {
      queryRunner.release();
    }
  }

  //SERVICE Lấy tất cả nhóm học tập của người dùng
  async getAllGroupByUserId(maNguoiDung: string) {
    const result = await this.dataSource.query(
      `
        SELECT DISTINCT n.*
        FROM "NHOMHOCTAP" n
        LEFT JOIN "THANHVIENNHOM" tv ON tv."maNhom" = n."id"
        WHERE n."maNguoiDung" = $1 OR tv."maNguoiDung" = $1
        ORDER BY n."createdAt"
      `,
      [maNguoiDung],
    );

    return result;
  }

  //SERVICE Lấy tin nhắn trong nhóm
  async getMessages(maNhom: string) {
    const tinNhan = await this.dataSource.query(
      `
      SELECT 
        tn."id",
        tn."maNhom",
        tn."maNguoiDung",
        tn."noiDung",
        tn."dinhKem",
        tn."createdAt",
        nd."hoTen",
        nd."hinhAnh"
      FROM "TINNHANNHOM" tn
      JOIN "NGUOIDUNG" nd ON tn."maNguoiDung" = nd."id"
      WHERE tn."maNhom" = $1
      ORDER BY tn."createdAt" ASC
      `,
      [maNhom],
    );

    return tinNhan;
  }

  //SERVICE Tạo tin nhắn mới
  // Table: TINNHANHOM
  // input: CreateTinNhanDto
  async createMessage(createMessageDto: CreateMessageDto) {
    const { maNhom, maNguoiDung, noiDung, dinhKem } = createMessageDto;

    const tinNhanNhom = this.tinNhanNhomRepository.create({
      nhomHocTap: { id: maNhom } as NhomHocTap,
      nguoiDung: { id: maNguoiDung } as NguoiDung,
      noiDung,
      dinhKem,
    });
    const saved = await this.tinNhanNhomRepository.save(tinNhanNhom);

    const result = await this.dataSource.query(
      `
      SELECT 
        tn."id",
        tn."maNhom",
        tn."maNguoiDung",
        tn."noiDung",
        tn."dinhKem",
        tn."createdAt",
        nd."hoTen",
        nd."hinhAnh"
      FROM "TINNHANNHOM" tn
      JOIN "NGUOIDUNG" nd ON tn."maNguoiDung" = nd."id"
      WHERE tn."id" = $1
      `,
      [saved.id],
    );

    return result[0];
  }

  /**
   * SERVICE KIỂM TRA NGƯỜI DÙNG CÓ TRONG NHÓM?
   */
  async checkUserInGroup(maNhom: string, maNguoiDung: string) {
    const result = await this.dataSource.query(
      `
        SELECT COUNT(*)
        FROM "THANHVIENNHOM" tv
        WHERE tv."maNhom" = $1
          AND tv."maNguoiDung" = $2
      `,
      [maNhom, maNguoiDung],
    );

    return result[0].count > 0;
  }

  /**
   * Service cho trang ADMIN
   */
  async findAll(filterDto: FilterGroupDto) {
    const {
      page,
      limit,
      sortBy,
      search,
      sortOrder,
      loaiNhom,
      createdAtFrom,
      createdAtTo,
      deletedAt,
    } = filterDto;

    const queryBuilder = this.nhomHocTapRepository
      .createQueryBuilder('nh')
      .withDeleted();

    if (search) {
      queryBuilder.andWhere(
        '(unaccent(nh."tenNhom") ILIKE unaccent(:search))',
        { search: `%${search}%` },
      );
    }

    if (loaiNhom) {
      queryBuilder.andWhere('nh."loaiNhom" = :loaiNhom', {
        loaiNhom: loaiNhom,
      });
    }

    if (createdAtFrom) {
      queryBuilder.andWhere('nh."createdAt" >= :createdAtFrom', {
        createdAtFrom: new Date(createdAtFrom),
      });
    }

    if (createdAtTo) {
      queryBuilder.andWhere('nh."createdAt" <= :createdAtTo', {
        createdAtTo: new Date(createdAtTo),
      });
    }

    if (deletedAt) {
      if (deletedAt === 'true') {
        queryBuilder.andWhere('nh."deletedAt" IS NOT NULL');
      } else {
        queryBuilder.andWhere('nh."deletedAt" IS NULL');
      }
    }

    if (sortBy && this.isValidColumn(sortBy)) {
      queryBuilder.orderBy(`nh.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('nh.createdAt', 'DESC');
    }

    queryBuilder.offset((page - 1) * limit).limit(limit);

    const [groups, total] = await queryBuilder.getManyAndCount();

    return {
      groups,
      total,
    };
  }

  async findGroupById(id: string) {
    const result = await this.dataSource.query(
      `
        SELECT 
          nh.*,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', tv."id",
              'vaiTro', tv."vaiTro",
              'createdAt', tv."createdAt", 
              'updatedAt', tv."updatedAt",
              'nguoiDung', JSON_BUILD_OBJECT(
                'id', nd."id",
                'hoTen', nd."hoTen",
                'hinhAnh', nd."hinhAnh"
              )
            )
          ) AS "thanhViens"
        FROM "NHOMHOCTAP" nh
        LEFT JOIN "THANHVIENNHOM" tv ON tv."maNhom" = nh."id"  
        LEFT JOIN "NGUOIDUNG" nd ON nd."id" = tv."maNguoiDung"
        WHERE nh."id" = $1
        GROUP BY nh."id"
      `,
      [id],
    );

    return result[0];
  }

  async updateGroup(id: string, updateNhomHocTapDto: UpdateNhomHocTapDto) {
    const { tenNhom, maMoi, gioiHanThanhVien, loaiNhom, maNguoiDung } =
      updateNhomHocTapDto;

    const nhomHocTap = await this.nhomHocTapRepository.findOne({
      where: { id },
    });

    if (!nhomHocTap) {
      throw new NotFoundException(`Nhóm học tập không tồn tại`);
    }

    if (tenNhom) {
      nhomHocTap.tenNhom = tenNhom;
    }

    if (maMoi) {
      nhomHocTap.maMoi = maMoi;
    }

    if (gioiHanThanhVien) {
      nhomHocTap.gioiHanThanhVien = Number(gioiHanThanhVien);
    }

    if (loaiNhom) {
      nhomHocTap.loaiNhom = loaiNhom;
    }

    if (maNguoiDung) {
      nhomHocTap.nguoiDung = { id: maNguoiDung } as NguoiDung;
    }

    await this.nhomHocTapRepository.save(nhomHocTap);

    return {
      success: true,
      message: 'Nhóm học tập đã được cập nhật thành công',
    };
  }

  //SERVICE Xóa nhóm học tập
  async deleteGroup(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nhom = await queryRunner.query(
        `SELECT * FROM "NHOMHOCTAP" WHERE id = $1`,
        [id],
      );

      if (!nhom.length) {
        throw new BadRequestException('Nhóm không tồn tại');
      }

      await queryRunner.query(`DELETE FROM "THANHVIENNHOM" WHERE "maNhom"=$1`, [
        id,
      ]);

      await queryRunner.query(`DELETE FROM "TINNHANNHOM" WHERE "maNhom" = $1`, [
        id,
      ]);

      await queryRunner.query(`DELETE FROM "NHOMHOCTAP" WHERE id = $1`, [id]);

      await queryRunner.commitTransaction();
      return { success: true, message: 'Đã xóa nhóm thành công' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Xóa nhóm thất bại:', error.message);
    } finally {
      queryRunner.release();
    }
  }

  //SERVICE LẤY DANH SÁCH THÀNH VIÊN TRONG NHÓM
  async getMembersByGroupId(id: string) {
    const result = await this.dataSource.query(
      `
        SELECT
          tv."vaiTro",
          nd.id,
          nd."hoTen",
          nd."hinhAnh"
        FROM "THANHVIENNHOM" tv
        JOIN "NGUOIDUNG" nd ON nd.id = tv."maNguoiDung"
        WHERE tv."maNhom" = $1
      `,
      [id],
    );

    return result;
  }

  //SERVICE XÓA NGƯỜI DÙNG KHỎI NHÓM
  // PERMITION ADMIN
  async deleteUserFromGroup(maNhom: string, maNguoiDung: string) {
    try {
      await this.leaveGroup(maNhom, maNguoiDung);
      return { success: true, message: 'Xóa người dùng khỏi nhóm thành công' };
    } catch (error) {
      return { success: false, message: 'Xóa người dùng khỏi nhóm thất bại' };
    }
  }

  private isValidColumn = (column: string): boolean => {
    const validColumns = [
      'tenNhom',
      'gioiHanThanhVien',
      'loaiNhom',
      'createdAt',
    ];
    return validColumns.includes(column);
  };

  /****************************************
   * SERVICE THỐNG KÊ SỐ LIỆU NHÓM HỌC TẬP
   * @param query - bộ lọc thời gian
   */
  async getGroupStats(year: number, month?: number) {
    const [total, createdGroupInPeriod, top3ActiveGroups] = await Promise.all([
      await this.getTotalGroup(),
      await this.getCreatedGroupInPeriod(year, month),
      await this.getTop3ActiveGroups(year, month),
    ]);

    return {
      total,
      createdGroupInPeriod,
      top3ActiveGroups,
    };
  }

  private async getTotalGroup() {
    const count = await this.nhomHocTapRepository.count();

    const result = await this.dataSource.query(`
        SELECT nh."loaiNhom" AS type, COUNT(nh."loaiNhom") AS count
        FROM "NHOMHOCTAP" nh
        GROUP BY nh."loaiNhom"
      `);

    const stats = result.map((r) => {
      return {
        type: r.type,
        count: parseInt(r.count),
      };
    });

    return {
      count,
      stats,
    };
  }

  private async getCreatedGroupInPeriod(year: number, month?: number) {
    let startDate: Date;
    let endDate: Date;
    let period: string;
    if (month) {
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 1));
      period = `tháng ${month}/${year}`;
    } else {
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year + 1, 0, 1));
      period = `năm ${year}`;
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM "NHOMHOCTAP" nh
      WHERE nh."createdAt" >= $1 AND nh."createdAt" < $2
    `;

    const result = await this.dataSource.query(query, [startDate, endDate]);

    return {
      period,
      total: parseInt(result[0]?.total || 0),
    };
  }

  private async getTop3ActiveGroups(year: number, month?: number) {
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
        SELECT 
          nh."tenNhom" AS name,
          COUNT(nh."tenNhom") AS count
        FROM "NHOMHOCTAP" nh
        INNER JOIN "TINNHANNHOM" tn ON tn."maNhom" = nh.id
          AND tn."createdAt" >= $1 AND tn."createdAt" < $2
        GROUP BY nh."tenNhom"
        ORDER BY count DESC
        LIMIT 3
      `,
      [startDate, endDate],
    );

    const stats = result.map((r, index) => {
      return {
        top: index + 1,
        name: r.name,
      };
    });

    return stats;
  }
}
