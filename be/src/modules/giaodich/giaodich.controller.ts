import { Controller, Get, Param, Query } from '@nestjs/common';
import { GiaoDichService } from './giaodich.service';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { Auth } from '../shared/decorators/auth.decorator';
import { VaiTro } from '../../common/constants/role.enum';
import { PaginatedResponseDto } from '../shared/dtos/pagination-response.dto';

@Controller('giao-dich')
export class GiaoDichController {
  constructor(private readonly giaoDichService: GiaoDichService) {}

  @Get()
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  async findAllWithFilter(@Query() filterDto: FilterTransactionDto) {
    const { transactions, total } =
      await this.giaoDichService.findAllWithFilter(filterDto);

    return PaginatedResponseDto.create(
      transactions,
      filterDto.page,
      filterDto.limit,
      total,
    );
  }

  @Get('stats')
  async getTransactionStats(
    @Query('year') year: number,
    @Query('month') month?: number,
  ) {
    return await this.giaoDichService.getTransactionStats(year, month);
  }

  @Get(':id')
  @Auth({ isPublic: false, vaiTro: [VaiTro.ADMIN] })
  async getTransactionById(@Param('id') id: string) {
    return await this.giaoDichService.findTransactionById(id);
  }
}
