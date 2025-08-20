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
import { NguoiDungService } from './nguoidung.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSocialDto } from './dto/create-social.dto';
import { Auth } from '../shared/decorators/auth.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VaiTro } from '../../common/constants/role.enum';
import { PaginatedResponseDto } from '../shared/dtos/pagination-response.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('nguoidung')
export class NguoiDungController {
  constructor(private readonly nguoiDungService: NguoiDungService) {}

  @Get()
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  async findAll(@Query() filterDto: FilterUserDto) {
    const { users, total } = await this.nguoiDungService.findAll(filterDto);
    return PaginatedResponseDto.create(
      users,
      filterDto.page,
      filterDto.limit,
      total,
    );
  }

  @Get('stats')
  async getUserStats(
    @Query('year') year: number,
    @Query('month') month?: number,
  ) {
    return await this.nguoiDungService.getUserStats(year, month);
  }

  @Get('all')
  async getAllUsers(
    @Query() dto: { admin: boolean; giangVien: boolean; hocVien: boolean },
  ) {
    return await this.nguoiDungService.getAllUsersWithPermissions(dto);
  }

  @Get(':id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  async findOne(@Param('id') id: string) {
    return await this.nguoiDungService.findUserById(id);
  }

  @Patch(':id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.nguoiDungService.updateByAdmin(id, updateUserDto);
  }

  @Delete(':id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  remove(@Param('id') id: string) {
    return this.nguoiDungService.remove(id);
  }

  @Get('search/course-and-blog')
  async searchCourseAndBlogByName(@Query('name') name: string) {
    return await this.nguoiDungService.searchCourseAndBlogByName(name);
  }

  @Post()
  async createUser(@Body() user: CreateUserDto | CreateSocialDto) {
    return await this.nguoiDungService.createUser(user);
  }

  @Post('restore/:id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  restore(@Param('id') id: string) {
    return this.nguoiDungService.restore(id);
  }

  @Post('email')
  async getInfoUserByEmail(@Body('email') email: string) {
    return await this.nguoiDungService.getInfoUserByEmail(email);
  }

  @Post('change-password')
  @Auth()
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    return await this.nguoiDungService.changePassword(
      changePasswordDto,
      req.user.sub,
    );
  }

  @Post('change-avatar')
  async changeAvatar(
    @Body() body: { imageUrl: string },
    @Query('maNguoiDung') maNguoiDung: string,
  ) {
    return await this.nguoiDungService.changeAvatar(body.imageUrl, maNguoiDung);
  }

  @Post('update-info')
  async updateInfoUser(@Body() body: UpdateUserDto) {
    return await this.nguoiDungService.updateInfoUser(body);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.nguoiDungService.resetPassword(dto);
  }
}
