import {
  PaginatedResult,
  PaginationMeta,
} from '../interfaces/pagination.interface';

export class PaginationMetaDto implements PaginationMeta {
  page: number;

  limit: number;

  itemCount: number;

  pageCount: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;

  constructor(page: number, limit: number, itemCount: number) {
    this.page = page;
    this.limit = limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(itemCount / limit);
    this.hasPreviousPage = page > 1;
    this.hasNextPage = page < this.pageCount;
  }
}

export class PaginatedResponseDto<T> implements PaginatedResult<T> {
  items: T[];

  meta: PaginationMetaDto;

  constructor(items: T[], meta: PaginationMetaDto) {
    this.items = items;
    this.meta = meta;
  }

  static create<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResponseDto<T> {
    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto<T>(items, meta);
  }
}
