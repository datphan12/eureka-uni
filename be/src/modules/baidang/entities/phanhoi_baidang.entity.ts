import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaiDang } from './baidang.entity';
import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';

@Entity('PHANHOI_BAIDANG')
export class PhanHoiBaiDang extends BaseEntity {
  @Column('text')
  noiDung: string;

  @Column('jsonb')
  dinhKem: string[];

  @ManyToOne(() => BaiDang, (baiDang) => baiDang.phanHoiBaiDang, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maBaiDang' })
  baiDang: BaiDang;

  @ManyToOne(() => NguoiDung, (nguoiDung) => nguoiDung.phanHoiBaiDang, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNguoiDung' })
  nguoiDung: NguoiDung;
}
