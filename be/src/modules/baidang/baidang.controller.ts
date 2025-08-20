import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { PhanHoiDto } from './dto/phan-hoi.dto';
import { Auth } from '../shared/decorators/auth.decorator';
import { BaiDangService } from './baidang.service';
import { FilterBlogDto } from './dto/filter-blog.dto';
import { PaginatedResponseDto } from '../shared/dtos/pagination-response.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogStatusEnum } from '../../common/constants/blog-status.enum';
import { VaiTro } from '../../common/constants/role.enum';

@Controller('bai-dang')
export class BaiDangController {
  constructor(private readonly baiDangService: BaiDangService) {}

  @Post()
  async createBlog(@Body() baiDang: CreateBlogDto) {
    return await this.baiDangService.createBlog(baiDang);
  }

  @Post('phan-hoi')
  async createCommentBlog(@Body() phanHoiBaiDang: PhanHoiDto) {
    return await this.baiDangService.createCommentBlog(phanHoiBaiDang);
  }

  @Post('like-or-dislike')
  @Auth()
  async likeOrdisLikeBlog(@Query('maBaiDang') maBaiDang: string, @Req() req) {
    return await this.baiDangService.likeOrDislikeBlog(maBaiDang, req.user.sub);
  }

  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return await this.baiDangService.updateBlog(id, updateBlogDto);
  }

  @Put(':id/status')
  @Auth({ vaiTro: [VaiTro.ADMIN] })
  async updateStatusBlog(
    @Param('id') id: string,
    @Query('status') status: BlogStatusEnum,
  ) {
    return await this.baiDangService.updateStatusBlog(id, status);
  }

  @Delete(':id')
  @Auth()
  async removeBlog(@Param('id') id: string, @Req() req) {
    return await this.baiDangService.removeBlog(id, req.user.sub);
  }

  @Get()
  async getAllBlog(@Query() query: FilterBlogDto) {
    const { blogs, total } =
      await this.baiDangService.getAllBlogWithFilters(query);
    return PaginatedResponseDto.create(blogs, query.page, query.limit, total);
  }

  @Get('stats')
  async getBlogStats(
    @Query('year') year: number,
    @Query('month') month?: number,
  ) {
    return await this.baiDangService.getBlogStats(year, month);
  }

  @Get('nguoi-dung')
  @Auth()
  async getAllBlogOfUser(@Req() req) {
    return await this.baiDangService.getAllBlogOfUserById(req.user.sub);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.baiDangService.getBlogById(id);
  }
}
