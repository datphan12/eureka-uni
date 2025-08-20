import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';
import { TypeGroup } from 'src/common/constants/type-group.enum';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TinNhanNhom } from './tinnhannhom.entity';
import { ThanhVienNhom } from './thanhviennhom.entity';

@Entity('NHOMHOCTAP')
export class NhomHocTap extends BaseEntity {
  @Column('varchar', { nullable: false })
  tenNhom: string;

  @Column('varchar', { nullable: true })
  maMoi: string;

  @Column('int', { default: 5 })
  gioiHanThanhVien: number;

  @Column('enum', {
    enum: TypeGroup,
    default: TypeGroup.PERSONAL,
    nullable: false,
  })
  loaiNhom: string;

  @Column('text', { nullable: true })
  yeuCauThamGia: string;

  @ManyToOne(() => NguoiDung, (nguoiDung) => nguoiDung.nhomHocTap, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNguoiDung' })
  nguoiDung: NguoiDung;

  @OneToMany(() => TinNhanNhom, (tinNhanNhom) => tinNhanNhom.nhomHocTap)
  tinNhanNhom: TinNhanNhom[];

  @OneToMany(() => ThanhVienNhom, (thanhVienNhom) => thanhVienNhom.nhomHocTap)
  thanhVienNhom: ThanhVienNhom[];
}
