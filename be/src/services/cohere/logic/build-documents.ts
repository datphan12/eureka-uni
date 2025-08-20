import { filterBlogTextForClassification } from './filter-input';

export function buildCohereDocuments(values: any[], type: string) {
  switch (type) {
    case 'khoahoc':
      return values.map((kh) => ({
        text: `${kh.tenKhoaHoc} - ${kh.moTa}`,
        type: 'khoahoc',
        meta: kh,
      }));

    case 'nhomhoctap':
      return values.map((nh) => ({
        text: nh.tenNhom,
        type: 'nhomhoctap',
        meta: nh,
      }));

    case 'baidang':
      return values.map((bd) => ({
        text: filterBlogTextForClassification(bd),
        type: 'baidang',
        meta: bd,
      }));

    default:
      return [];
  }
}
