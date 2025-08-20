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
import { NhomHocTapService } from './nhomhoctap.service';
import { Auth } from '../shared/decorators/auth.decorator';
import { FilterGroupDto } from './dto/filter-group.dto';
import { PaginatedResponseDto } from '../shared/dtos/pagination-response.dto';
import { VaiTro } from '../../common/constants/role.enum';
import { UpdateNhomHocTapDto } from './dto/update-nhomhoctap.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinRequestDto } from './dto/join-request.dto';
import { ApproveJoinRequestDto } from './dto/approve-join-request.dto';

@Controller('nhom-hoc-tap')
export class NhomsHocTapController {
  constructor(private readonly nhomHocTapService: NhomHocTapService) {}

  //Lấy tất cả các nhóm
  @Get()
  async findAll(@Query() filterDto: FilterGroupDto) {
    const { groups, total } = await this.nhomHocTapService.findAll(filterDto);
    return PaginatedResponseDto.create(
      groups,
      filterDto.page,
      filterDto.limit,
      total,
    );
  }

  @Get('stats')
  async getGroupStats(
    @Query('year') year: number,
    @Query('month') month?: number,
  ) {
    return await this.nhomHocTapService.getGroupStats(year, month);
  }

  // tìm kiếm nhóm theo tên
  @Get('search')
  @Auth()
  async getGroupByGroupName(@Query('tenNhom') tenNhom: string, @Req() req) {
    return await this.nhomHocTapService.getGroupByGroupName(
      tenNhom,
      req.user.sub,
    );
  }

  @Auth()
  @Get('yeu-cau-tham-gia')
  async getJoinRequests(@Query('maNhom') maNhom: string, @Req() req) {
    return await this.nhomHocTapService.getJoinRequests(maNhom, req.user.sub);
  }

  // Lấy các nhóm học tập của người dùng
  @Get('me')
  @Auth()
  async getAllGroupByUserId(@Req() req) {
    return await this.nhomHocTapService.getAllGroupByUserId(req.user.sub);
  }

  // Lấy thông tin chi tiết thành viên của nhóm
  @Get('thanh-vien')
  async getChiTietNhom(@Query('maNhom') maNhom: string) {
    return await this.nhomHocTapService.getMembersByGroupId(maNhom);
  }

  // Lấy tin nhắn trong nhóm
  @Get('tin-nhan-nhom')
  async getAllTinNhanNhom(@Query('maNhom') maNhom: string) {
    return await this.nhomHocTapService.getMessages(maNhom);
  }

  // lấy nhóm theo id
  @Get(':id')
  async findGroupById(@Param('id') id: string) {
    return await this.nhomHocTapService.findGroupById(id);
  }

  //cập nhật nhóm
  @Patch(':id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  async update(
    @Param('id') id: string,
    @Body() updateNhomHocTapDto: UpdateNhomHocTapDto,
  ) {
    return await this.nhomHocTapService.updateGroup(id, updateNhomHocTapDto);
  }

  // API xóa người dùng khỏi nhóm
  @Delete('thanh-vien')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  async deleteUserFromGroup(
    @Query('maNhom') maNhom: string,
    @Query('maNguoiDung') maNguoiDung: string,
  ) {
    return await this.nhomHocTapService.deleteUserFromGroup(
      maNhom,
      maNguoiDung,
    );
  }

  // xóa nhóm
  @Delete(':id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  async remove(@Param('id') id: string) {
    return await this.nhomHocTapService.deleteGroup(id);
  }

  // API tạo nhóm học tập mới
  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return await this.nhomHocTapService.createGroup(createGroupDto);
  }

  // API tham gia nhóm học tập
  @Auth()
  @Post('me')
  async joinGroup(@Body() body: { maNhom: string }, @Req() req) {
    return await this.nhomHocTapService.joinGroup({
      maNhom: body.maNhom,
      maNguoiDung: req.user.sub,
    });
  }

  // API tạo yêu cầu tham gia nhóm
  @Auth()
  @Post('yeu-cau-tham-gia')
  async createJoinRequest(@Body() body: JoinRequestDto, @Req() req) {
    return await this.nhomHocTapService.createJoinRequest(
      body.maNhom,
      req.user.sub,
    );
  }

  // API chấp nhận/từ chối yêu cầu tham gia nhóm
  @Auth()
  @Post('xu-ly-yeu-cau-tham-gia')
  async approveJoinRequest(@Body() body: ApproveJoinRequestDto, @Req() req) {
    return await this.nhomHocTapService.approveJoinRequest(
      body.maNhom,
      body.maNguoiDung,
      body.approve,
      req.user.sub,
    );
  }

  //API rời khỏi nhóm
  @Auth()
  @Post('me/leave')
  async leaveGroup(@Body() body: { maNhom: string }, @Req() req) {
    return await this.nhomHocTapService.leaveGroup(body.maNhom, req.user.sub);
  }
}
