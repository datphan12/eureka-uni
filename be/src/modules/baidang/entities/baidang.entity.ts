import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';
import { BlogStatusEnum } from 'src/common/constants/blog-status.enum';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PhanHoiBaiDang } from './phanhoi_baidang.entity';

@Entity('BAIDANG')
export class BaiDang extends BaseEntity {
  @Column('varchar', { length: 255, nullable: false })
  tieuDe: string;

  @Column('text')
  noiDungMarkdown: string;

  @Column('text')
  noiDungHTML: string;

  @Column('text', { array: true, default: '{}' })
  luotThich: string[];

  @Column('jsonb')
  hinhAnh: string[];

  @Column('enum', { enum: BlogStatusEnum })
  trangThai: BlogStatusEnum;

  @ManyToOne(() => NguoiDung, (nguoiDung) => nguoiDung.baiDang, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNguoiDung' })
  nguoiDung: NguoiDung;

  @OneToMany(() => PhanHoiBaiDang, (phanHoiBaiDang) => phanHoiBaiDang.baiDang)
  phanHoiBaiDang: PhanHoiBaiDang[];
}
