import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NhomHocTap } from './nhomhoctap.entity';

@Entity('TINNHANNHOM')
export class TinNhanNhom extends BaseEntity {
  @ManyToOne(() => NhomHocTap, (nhomHocTap) => nhomHocTap.tinNhanNhom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNhom' })
  nhomHocTap: NhomHocTap;

  @ManyToOne(() => NguoiDung, (nguoiDung) => nguoiDung.tinNhanNhom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNguoiDung' })
  nguoiDung: NguoiDung;

  @Column('text')
  noiDung: string;

  @Column('jsonb')
  dinhKem: object;
}
