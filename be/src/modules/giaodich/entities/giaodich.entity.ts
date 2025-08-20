import { NguoiDungKhoaHoc } from 'src/modules/khoahoc/entities/nguoidung_khoahoc.entity';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('GIAODICH')
export class GiaoDich extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  soTien: number;

  @Column('varchar', { length: 255, nullable: true })
  phuonThucThanhToan: string | null;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  ngayGiaoDich: Date;

  @Column('varchar', { length: 255, nullable: true })
  trangThai: string;

  @ManyToOne(
    () => NguoiDungKhoaHoc,
    (nguoiDungKhoaHoc) => nguoiDungKhoaHoc.giaoDich,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'maDangKy' })
  nguoiDungKhoaHoc: NguoiDungKhoaHoc;
}
