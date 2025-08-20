import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaiGiang } from './baigiang.entity';

@Entity('GHICHU')
export class GhiChu extends BaseEntity {
  @ManyToOne(() => NguoiDung, (nguoiDung) => nguoiDung.ghiChu, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNguoiDung' })
  nguoiDung: NguoiDung;

  @ManyToOne(() => BaiGiang, (baiGiang) => baiGiang.ghiChu, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maBaiGiang' })
  baiGiang: BaiGiang;

  @Column('text', { nullable: false })
  noiDung: string;
}
