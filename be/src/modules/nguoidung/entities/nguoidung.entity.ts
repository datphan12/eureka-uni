import { Exclude } from 'class-transformer';
import { IsEmail, MinLength } from 'class-validator';
import { BaiDang } from 'src/modules/baidang/entities/baidang.entity';
import { PhanHoiBaiDang } from 'src/modules/baidang/entities/phanhoi_baidang.entity';
import { BinhLuanBaiGiang } from 'src/modules/baigiang/entities/binhluan-baigiang.entity';
import { GhiChu } from 'src/modules/baigiang/entities/ghichu.entity';
import { KhoaHoc } from 'src/modules/khoahoc/entities/khoahoc.entity';
import { NguoiDungKhoaHoc } from 'src/modules/khoahoc/entities/nguoidung_khoahoc.entity';
import { NhomHocTap } from 'src/modules/nhomhoctap/entities/nhomhoctap.entity';
import { ThanhVienNhom } from 'src/modules/nhomhoctap/entities/thanhviennhom.entity';
import { TinNhanNhom } from 'src/modules/nhomhoctap/entities/tinnhannhom.entity';
import { VaiTro } from 'src/common/constants/role.enum';
import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('NGUOIDUNG')
export class NguoiDung extends BaseEntity {
  @Column('varchar', { unique: true })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @Column('varchar', { nullable: true })
  @Exclude()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  matKhau: string;

  @Column('varchar')
  hoTen: string;

  @Column('varchar', { nullable: true })
  tieuSu: string;

  @Column('varchar', { nullable: true })
  hinhAnh: string;

  @Column('enum', { enum: VaiTro, default: VaiTro.HOCVIEN })
  vaiTro: VaiTro;

  @Column({ default: false })
  daKichHoat: boolean;

  @Column('varchar', { length: 255, nullable: true })
  googleId: string | null;

  @Column('varchar', { length: 255, nullable: true })
  facebookId: string | null;

  @Column('text', { nullable: true })
  maKichHoat: string | null;

  @Column('text', { nullable: true })
  maDatLaiMatKhau: string | null;

  @OneToMany(() => NhomHocTap, (nhomHocTap) => nhomHocTap.nguoiDung)
  nhomHocTap: NhomHocTap[];

  @OneToMany(() => TinNhanNhom, (tinNhanNhom) => tinNhanNhom.nguoiDung)
  tinNhanNhom: TinNhanNhom[];

  @OneToMany(() => ThanhVienNhom, (thanhVienNhom) => thanhVienNhom.nguoiDung)
  thanhVienNhom: ThanhVienNhom[];

  @OneToMany(() => KhoaHoc, (kh) => kh.nguoiDung)
  khoaHoc: KhoaHoc[];

  @OneToMany(() => NguoiDungKhoaHoc, (nd) => nd.nguoiDung)
  khoaHocDangKy: NguoiDungKhoaHoc[];

  @OneToMany(() => BaiDang, (baiDang) => baiDang.nguoiDung)
  baiDang: BaiDang[];

  @OneToMany(() => PhanHoiBaiDang, (phanHoiBaiDang) => phanHoiBaiDang.nguoiDung)
  phanHoiBaiDang: PhanHoiBaiDang[];

  @OneToMany(() => GhiChu, (ghiChu) => ghiChu.nguoiDung)
  ghiChu: GhiChu[];

  @OneToMany(
    () => BinhLuanBaiGiang,
    (binhLuanBaiGiang) => binhLuanBaiGiang.nguoiDung,
  )
  binhLuanBaiGiang: BinhLuanBaiGiang[];
}
