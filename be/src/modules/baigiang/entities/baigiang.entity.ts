import { KhoaHoc } from 'src/modules/khoahoc/entities/khoahoc.entity';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { GhiChu } from './ghichu.entity';
import { TailieuBaiGiang } from './tailieu-baigiang.entity';
import { BinhLuanBaiGiang } from './binhluan-baigiang.entity';

@Entity('BAIGIANG')
export class BaiGiang extends BaseEntity {
  @Column('varchar', { length: 255, nullable: false })
  tieuDe: string;

  @Column('text', { nullable: true })
  moTa: string;

  @Column('varchar', { length: 255, nullable: true })
  videoUrl: string;

  @Column('int')
  thuTu: number;

  @ManyToOne(() => KhoaHoc, (kh) => kh.baiGiangs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maKhoaHoc' })
  khoaHoc: KhoaHoc;

  @OneToMany(() => GhiChu, (ghiChu) => ghiChu.baiGiang)
  ghiChu: GhiChu[];

  @OneToMany(
    () => TailieuBaiGiang,
    (tailieuBaiGiang) => tailieuBaiGiang.baiGiang,
  )
  taiLieu: TailieuBaiGiang[];

  @OneToMany(
    () => BinhLuanBaiGiang,
    (binhLuanBaiGiang) => binhLuanBaiGiang.baiGiang,
  )
  binhLuan: BinhLuanBaiGiang[];
}
