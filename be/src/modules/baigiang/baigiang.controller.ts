import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { BaiGiangService } from './baigiang.service';
import { GhiChuDto } from './dto/ghichu.dto';
import { Auth } from '../shared/decorators/auth.decorator';
import { BinhLuanDto } from './dto/binhluan.dto';
import { CreateBaiGiangDto } from './dto/create-baigiang.dto';
import { UpdateBaiGiangDto } from './dto/update-baigiang.dto';
import { CreateDocDto } from './dto/create-doc.dto';
import { VaiTro } from '../../common/constants/role.enum';

@Controller('bai-giang')
export class BaiGiangController {
  constructor(private readonly baiGiangService: BaiGiangService) {}

  @Get()
  async getAllLectureByCourseId(@Query() query: { maKhoaHoc: string }) {
    return await this.baiGiangService.getAllLectureByCourseId(query.maKhoaHoc);
  }

  @Get('ghi-chu')
  @Auth()
  async getAllNoteOfUser(@Query() query: { maBaiGiang: string }, @Req() req) {
    return await this.baiGiangService.getAllNoteOfUser({
      maNguoiDung: req.user.sub,
      maBaiGiang: query.maBaiGiang,
    });
  }

  @Get('binh-luan')
  async getAllCommentOfBaiGiang(@Query() query: { maBaiGiang: string }) {
    return await this.baiGiangService.getAllCommentOfBaiGiang({
      maBaiGiang: query.maBaiGiang,
    });
  }

  @Get('doc')
  async getAllDocByLectureId(@Query() query: { maBaiGiang: string }) {
    return await this.baiGiangService.getAllDocByLectureId(query.maBaiGiang);
  }

  @Post()
  async createLecture(@Body() body: CreateBaiGiangDto) {
    return await this.baiGiangService.addNewLecture(body);
  }

  @Post('ghi-chu')
  async createNote(@Query() ghiChu: GhiChuDto) {
    return await this.baiGiangService.createNote(ghiChu);
  }

  @Post('binh-luan')
  @Auth()
  async createComment(@Body() binhLuan: BinhLuanDto, @Req() req) {
    return await this.baiGiangService.createComment(binhLuan, req.user.sub);
  }

  @Post('update-lecture')
  async updateLecture(@Body() body: UpdateBaiGiangDto) {
    return await this.baiGiangService.updateLecture(body);
  }

  @Post('doc')
  async createDoc(@Body() doc: CreateDocDto) {
    return await this.baiGiangService.createDoc(doc);
  }

  @Delete('ghi-chu/:id')
  async deleteNote(@Param('id') id: string) {
    return await this.baiGiangService.deleteNote(id);
  }

  @Delete('binh-luan/:id')
  @Auth()
  async deleteComment(@Param('id') id: string, @Req() req) {
    return await this.baiGiangService.deleteComment(id, req.user.sub);
  }

  @Delete('doc/:id')
  @Auth({ vaiTro: [VaiTro.ADMIN] })
  async deleteFileFromDocument(
    @Param('id') id: string,
    @Body() data: { url: string },
  ) {
    return await this.baiGiangService.deleteFileFromDocument(id, data.url);
  }

  @Delete(':id')
  async deleteLecture(@Param('id') id: string) {
    return await this.baiGiangService.deleteLecture(id);
  }
}
