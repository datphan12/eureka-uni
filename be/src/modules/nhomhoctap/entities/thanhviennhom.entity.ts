import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NhomHocTap } from './nhomhoctap.entity';
import { NguoiDung } from 'src/modules/nguoidung/entities/nguoidung.entity';
import { RoleGroup } from 'src/common/constants/role-group.enum';

@Entity('THANHVIENNHOM')
export class ThanhVienNhom extends BaseEntity {
  @ManyToOne(() => NhomHocTap, (NhomHocTap) => NhomHocTap.thanhVienNhom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNhom' })
  nhomHocTap: NhomHocTap;

  @ManyToOne(() => NguoiDung, (nguoiDung) => nguoiDung.thanhVienNhom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maNguoiDung' })
  nguoiDung: NguoiDung;

  @Column('enum', { enum: RoleGroup, default: RoleGroup.MEMBER })
  vaiTro: string;
}
