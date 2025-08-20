import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { KhoaHoc } from './khoahoc.entity';
import { GiaoDich } from 'src/modules/giaodich/entities/giaodich.entity';

@Entity('NGUOIDUNG_KHOAHOC')
export class NguoiDungKhoaHoc extends BaseEntity {
  @ManyToOne(() => NguoiDung, (nd) => nd.khoaHocDangKy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNguoiDung' })
  nguoiDung: NguoiDung;

  @ManyToOne(() => KhoaHoc, (kh) => kh.nguoiDangKy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maKhoaHoc' })
  khoaHoc: KhoaHoc;

  @OneToMany(() => GiaoDich, (giaoDich) => giaoDich.nguoiDungKhoaHoc)
  giaoDich: GiaoDich[];
}
