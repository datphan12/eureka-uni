import * as crypto from 'crypto';
import * as moment from 'moment';
import { BadRequestException, Injectable } from '@nestjs/common';
import { KhoaHocService } from 'src/modules/khoahoc/khoahoc.service';
import { GiaoDichService } from 'src/modules/giaodich/giaodich.service';
import { vnpayConfig } from './vnpay.config';
import { sortObject } from 'src/common/utils';

@Injectable()
export class VnpayService {
  constructor(
    private readonly khoaHocService: KhoaHocService,
    private readonly giaoDichService: GiaoDichService,
  ) {}

  async createPaymentUrl(
    maNguoiDung: string,
    maKhoaHoc: string,
    amount: number,
  ) {
    const khoaHocDangKy = await this.khoaHocService.createCourseRegistration(
      maKhoaHoc,
      maNguoiDung,
    );

    const giaoDich = await this.giaoDichService.taoGiaoDichMoi({
      soTien: amount,
      phuonThucThanhToan: null,
      trangThai: 'CHO_THANH_TOAN',
      maDangKy: khoaHocDangKy.id,
    });

    if (!giaoDich) {
      throw new BadRequestException('Lỗi khi tạo giao dịch mới');
    }

    // VNPay Config
    const date = moment();
    const createDate = date.format('YYYYMMDDHHmmss');
    const expireDate = date.add(30, 'minutes').format('YYYYMMDDHHmmss');

    const ipAddr = '127.0.0.1';
    const orderId = giaoDich.id;

    const params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán don hang ${giaoDich.id}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sortedParams = sortObject(params);

    const urlParams = new URLSearchParams();
    for (let [key, value] of Object.entries(sortedParams)) {
      urlParams.append(key, value as string);
    }

    const querystring = urlParams.toString();

    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(querystring).digest('hex');

    urlParams.append('vnp_SecureHash', signed);

    const paymentUrl = `${vnpayConfig.vnp_Url}?${urlParams.toString()}`;

    return { paymentUrl };
  }

  async handleReturn(query) {
    const { vnp_PayDate, vnp_ResponseCode, vnp_TxnRef, vnp_CardType } = query;

    try {
      if (!vnp_ResponseCode || !vnp_TxnRef) {
        throw new BadRequestException('Thiếu thông tin nhận về từ VNPay');
      }

      const giaoDich = await this.giaoDichService.findById(vnp_TxnRef);
      if (!giaoDich) {
        throw new BadRequestException('Không tìm thấy giao dịch');
      }

      if (vnp_ResponseCode !== '00') {
        await this.giaoDichService.findByIdAndDelete(vnp_TxnRef);
        return {
          redirectUrl: '',
          message: 'Giao dịch thất bại',
          status: 'failed',
        };
      } else {
        giaoDich.trangThai = 'THANH_CONG';
        giaoDich.phuonThucThanhToan = vnp_CardType;
        giaoDich.ngayGiaoDich = vnp_PayDate;

        const giaoDichUpdate =
          await this.giaoDichService.updateGiaoDich(giaoDich);

        const maKhoaHoc = await this.giaoDichService.layMaKhoaHoc(
          giaoDichUpdate.nguoiDungKhoaHoc.id,
        );
        return {
          redirectUrl: `khoa-hoc/${maKhoaHoc}/bai-giang`,
          message: 'Giao dịch thành công',
          status: 'success',
          maKhoaHoc,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }
}
