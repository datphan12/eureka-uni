import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { KhoaHocService } from './khoahoc.service';
import { CreateKhoaHocDto } from './dto/create-khoahoc.dto';
import { FilterCourseDto } from './dto/filter-course.dto';
import { Auth } from '../shared/decorators/auth.decorator';
import { VaiTro } from '../../common/constants/role.enum';
import { PaginatedResponseDto } from '../shared/dtos/pagination-response.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('khoa-hoc')
export class KhoaHocController {
  constructor(private readonly khoaHocService: KhoaHocService) {}

  //lấy danh sách khóa học
  @Get()
  @Auth()
  async findAll(@Query() filterDto: FilterCourseDto, @Req() req) {
    const { courses, total } = await this.khoaHocService.findAll(filterDto);
    return PaginatedResponseDto.create(
      courses,
      filterDto.page,
      filterDto.limit,
      total,
    );
  }

  @Get('stats')
  async getCourseStats(
    @Query('year') year: number,
    @Query('month') month?: number,
  ) {
    return await this.khoaHocService.getCourseStats(year, month);
  }

  @Get('nguoi-dung')
  @Auth()
  async getCoursesByUserId(@Req() req) {
    return await this.khoaHocService.getCoursesByUserId(req.user.sub);
  }

  @Get(':id')
  async findCourseById(@Param('id') id: string) {
    return await this.khoaHocService.findCourseById(id);
  }

  @Post('restore/:id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  async restore(@Param('id') id: string) {
    return await this.khoaHocService.storeCourse(id);
  }

  @Patch(':id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN, VaiTro.GIANGVIEN] })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req,
  ) {
    return this.khoaHocService.updateCourse(id, updateCourseDto, req.user.sub);
  }

  @Delete(':id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN, VaiTro.GIANGVIEN] })
  remove(@Param('id') id: string, @Req() req) {
    return this.khoaHocService.remove(id, req.user.sub);
  }

  // tạo khóa học mới
  @Post()
  async createNewCourse(@Body() khoaHoc: CreateKhoaHocDto) {
    return await this.khoaHocService.createNewCourse(khoaHoc);
  }
}
