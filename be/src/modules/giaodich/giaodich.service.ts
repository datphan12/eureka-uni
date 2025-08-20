import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { GiaoDich } from './entities/giaodich.entity';
import { DataSource, Repository } from 'typeorm';
import { NguoiDungKhoaHoc } from '../khoahoc/entities/nguoidung_khoahoc.entity';
import { FilterTransactionDto } from './dto/filter-transaction.dto';

@Injectable()
export class GiaoDichService {
  constructor(
    @InjectRepository(GiaoDich)
    private readonly giaoDichRepo: Repository<GiaoDich>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async taoGiaoDichMoi({ soTien, phuonThucThanhToan, trangThai, maDangKy }) {
    const giaoDich = await this.giaoDichRepo.findOne({
      where: { nguoiDungKhoaHoc: { id: maDangKy } },
    });

    if (giaoDich) {
      return giaoDich;
    }

    const nguoiDungKhoaHoc = { id: maDangKy } as NguoiDungKhoaHoc;

    const dto = this.giaoDichRepo.create({
      soTien,
      phuonThucThanhToan,
      trangThai,
      nguoiDungKhoaHoc,
    });

    await this.giaoDichRepo.save(dto);

    return dto;
  }

  async findByIdAndDelete(maGiaoDich: string) {
    const giaoDich = await this.giaoDichRepo.findOne({
      where: { id: maGiaoDich },
    });

    if (!giaoDich) {
      throw new BadRequestException('Giao dịch không tồn tại');
    }

    await this.giaoDichRepo.delete(giaoDich.id);
    return true;
  }

  async findById(maGiaoDich: string) {
    const giaoDich = await this.giaoDichRepo.findOne({
      where: { id: maGiaoDich },
      relations: ['nguoiDungKhoaHoc'],
    });

    if (!giaoDich) {
      throw new BadRequestException('Giao dịch không tồn tại');
    }

    return giaoDich;
  }

  async updateGiaoDich(giaoDich: GiaoDich) {
    return await this.giaoDichRepo.save(giaoDich);
  }

  async layMaKhoaHoc(maDangKy: string) {
    const result = await this.dataSource.query(
      `
        SELECT ndkh."maKhoaHoc"
        FROM "GIAODICH" gd
        JOIN "NGUOIDUNG_KHOAHOC" ndkh ON ndkh.id = gd."maDangKy"
        WHERE ndkh.id = $1 AND gd."trangThai" = 'THANH_CONG'
      `,
      [maDangKy],
    );

    return result[0].maKhoaHoc;
  }

  /**
   * SERVICE ADMIN: GET ALL GIAO DICH
   */
  async findAllWithFilter(filterDto: FilterTransactionDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      amountMin,
      amountMax,
      transactionDateFrom,
      transactionDateTo,
    } = filterDto;

    const queryBuilder = this.giaoDichRepo
      .createQueryBuilder('gd')
      .leftJoinAndSelect('gd.nguoiDungKhoaHoc', 'ndkh')
      .leftJoinAndSelect('ndkh.nguoiDung', 'nd')
      .leftJoinAndSelect('ndkh.khoaHoc', 'kh');

    if (search) {
      queryBuilder.andWhere(
        '(unaccent(nd."hoTen") ILIKE unaccent(:search) OR unaccent(kh."tenKhoaHoc") ILIKE unaccent(:search))',
        { search: `%${search}%` },
      );
    }

    if (amountMin) {
      queryBuilder.andWhere('gd."soTien" >= :amountMin', {
        amountMin: Number(amountMin),
      });
    }

    if (amountMax) {
      queryBuilder.andWhere('gd."soTien" <= :amountMax', {
        amountMax: Number(amountMax),
      });
    }

    if (transactionDateFrom) {
      queryBuilder.andWhere('gd."ngayGiaoDich" >= :transactionDateFrom', {
        transactionDateFrom: new Date(transactionDateFrom),
      });
    }

    if (transactionDateTo) {
      queryBuilder.andWhere('gd."ngayGiaoDich" <= :transactionDateTo', {
        transactionDateTo: new Date(transactionDateTo),
      });
    }

    if (sortBy && this.isValidColumn(sortBy)) {
      queryBuilder.orderBy(`gd.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('gd.ngayGiaoDich', 'DESC');
    }

    queryBuilder.offset((page - 1) * limit).limit(limit);

    const [transactions, total] = await queryBuilder.getManyAndCount();

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      soTien: transaction.soTien,
      phuongThucThanhToan: transaction.phuonThucThanhToan,
      ngayGiaoDich: transaction.ngayGiaoDich,
      trangThai: transaction.trangThai,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      hoTenNguoiDung: transaction.nguoiDungKhoaHoc?.nguoiDung?.hoTen || null,
      tenKhoaHoc: transaction.nguoiDungKhoaHoc?.khoaHoc?.tenKhoaHoc || null,
    }));

    return {
      transactions: formattedTransactions,
      total,
    };
  }

  private isValidColumn(column: string): boolean {
    const validColumns = [
      'id',
      'soTien',
      'ngayGiaoDich',
      'trangThai',
      'createdAt',
    ];
    return validColumns.includes(column);
  }

  /**
   * SERVICE: LẤY THÔNG TIN GIAO DỊCH THEO ID
   */
  async findTransactionById(id: string) {
    const transaction = await this.giaoDichRepo
      .createQueryBuilder('gd')
      .leftJoinAndSelect('gd.nguoiDungKhoaHoc', 'ndkh')
      .leftJoinAndSelect('ndkh.nguoiDung', 'nd')
      .leftJoinAndSelect('ndkh.khoaHoc', 'kh')
      .where('gd.id = :id', { id })
      .getOne();

    if (!transaction) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }

    const formattedTransaction = {
      id: transaction.id,
      soTien: transaction.soTien,
      phuongThucThanhToan: transaction.phuonThucThanhToan,
      ngayGiaoDich: transaction.ngayGiaoDich,
      trangThai: transaction.trangThai,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      hoTenNguoiDung: transaction.nguoiDungKhoaHoc?.nguoiDung?.hoTen || null,
      tenKhoaHoc: transaction.nguoiDungKhoaHoc?.khoaHoc?.tenKhoaHoc || null,
    };

    return formattedTransaction;
  }

  /**
   * SERVICE THỐNG KÊ GIAO DỊCH
   */

  async getTransactionStats(year: number, month?: number) {
    const revenue = await this.getRevenue(year, month);

    return {
      revenue,
    };
  }

  //thống kê doang thu theo thời gian
  private async getRevenue(year: number, month?: number) {
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
      SELECT 
        SUM(gd."soTien") AS total
      FROM "GIAODICH" gd
      WHERE gd."createdAt" >= $1 AND gd."createdAt" < $2
    `;

    const result = await this.dataSource.query(query, [startDate, endDate]);

    return {
      period: month ? `tháng ${month}/${year}` : `năm ${year}`,
      total: parseInt(result[0]?.total || 0),
    };
  }
}
