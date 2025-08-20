import { decode } from 'html-entities';
import { DataSource } from 'typeorm';

export async function filterInputForCohere(
  dataSource: DataSource,
  values: any[],
  maNguoiDung: string,
  type: string,
) {
  switch (type) {
    case 'khoahoc': {
      return filterCoursesForUser(dataSource, values, maNguoiDung);
    }

    case 'nhomhoctap':
      return filterGroupsForUser(dataSource, values, maNguoiDung);

    default:
      return [];
  }
}

async function filterCoursesForUser(
  dataSource: DataSource,
  khoaHocs: any[],
  maNguoiDung: string,
) {
  const khoaHocIds = await dataSource.query(
    `SELECT "maKhoaHoc" FROM "NGUOIDUNG_KHOAHOC" WHERE "maNguoiDung" = $1`,
    [maNguoiDung],
  );

  const khoaHocIdSet = new Set(khoaHocIds.map((k) => k.maKhoaHoc));
  return khoaHocs.filter((kh) => !khoaHocIdSet.has(kh.id));
}

async function filterGroupsForUser(
  dataSource: DataSource,
  nhomHocTaps: any[],
  maNguoiDung: string,
) {
  const nhomIds = await dataSource.query(
    `SELECT "maNhom" FROM "THANHVIENNHOM" WHERE "maNguoiDung" = $1`,
    [maNguoiDung],
  );

  const nhomIdSet = new Set(nhomIds.map((n) => n.maNhom));
  return nhomHocTaps.filter((nh) => !nhomIdSet.has(nh.id));
}

export function filterBlogTextForClassification(blog: any): string {
  const title = blog.tieuDe || '';
  const content = blog.noiDungHTML || '';

  const weightedTitle = `${title}.${title}.${title}.`;

  const rawText = `${weightedTitle}-${prepareTextForClassification(content)}`;

  return rawText.slice(0, 2000);
}

// Chuyển đổi HTML thành text đơn giản để tăng hiệu quả phân loại
export function prepareTextForClassification(html: string): string {
  const textWithoutTags = html.replace(/<[^>]*>/g, ' ');

  const decodedText = decode(textWithoutTags);

  return decodedText.replace(/\s+/g, ' ').trim();
}
