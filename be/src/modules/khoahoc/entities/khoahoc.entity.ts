import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { NguoiDungKhoaHoc } from './nguoidung_khoahoc.entity';
import { BaiGiang } from 'src/modules/baigiang/entities/baigiang.entity';

@Entity({ name: 'KHOAHOC' })
export class KhoaHoc extends BaseEntity {
  @ManyToOne(() => NguoiDung, (nd) => nd.khoaHoc, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'maNguoiTao' })
  nguoiDung: NguoiDung;

  @Column('varchar', { length: 255 })
  tenKhoaHoc: string;

  @Column('text')
  moTa: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  giaBan: number;

  @Column('varchar', { length: 255, nullable: true })
  hinhAnh: string;

  @OneToMany(() => NguoiDungKhoaHoc, (nd) => nd.khoaHoc)
  nguoiDangKy: NguoiDungKhoaHoc[];

  @OneToMany(() => BaiGiang, (bg) => bg.khoaHoc)
  baiGiangs: BaiGiang[];
}
