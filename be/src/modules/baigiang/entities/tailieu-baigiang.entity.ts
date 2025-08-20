import { BaseEntity } from 'src/modules/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaiGiang } from './baigiang.entity';

@Entity('TAILIEU_BAIGIANG')
export class TailieuBaiGiang extends BaseEntity {
  @ManyToOne(() => BaiGiang, (baiGiang) => baiGiang.taiLieu, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'maBaiGiang' })
  baiGiang: BaiGiang;

  @Column('jsonb')
  urlTaiLieu: {
    name: string;
    url: string;
  }[];
}
