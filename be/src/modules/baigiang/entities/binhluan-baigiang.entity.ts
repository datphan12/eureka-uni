import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaiGiang } from './baigiang.entity';

@Entity('BINHLUAN_BAIGIANG')
export class BinhLuanBaiGiang extends BaseEntity {
  @ManyToOne(() => NguoiDung, (nguoiDung) => nguoiDung.binhLuanBaiGiang, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNguoiDung' })
  nguoiDung: NguoiDung;

  @ManyToOne(() => BaiGiang, (baiGiang) => baiGiang.binhLuan, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maBaiGiang' })
  baiGiang: BaiGiang;

  @Column('text', { nullable: true })
  noiDung: string;

  @Column('jsonb', { nullable: true })
  dinhKem: string[];
}
