import { DataSource } from 'typeorm';

export async function fetchDetailedGroups(
  dataSource: DataSource,
  groups: any[],
) {
  const ids = groups.map((n) => `'${n.id}'`).join(',');
  return dataSource.query(
    `
    SELECT nh.*, 
      (
        SELECT COUNT(*)
        FROM "THANHVIENNHOM" tv
        WHERE tv."maNhom" = nh.id
      ) "soLuongThanhVien",
      (
        SELECT JSON_AGG(JSON_BUILD_OBJECT(
          'hoTen', nd."hoTen",
          'hinhAnh', nd."hinhAnh",
          'vaiTro', tv."vaiTro"
        ))
        FROM "THANHVIENNHOM" tv
        JOIN "NGUOIDUNG" nd ON nd.id = tv."maNguoiDung"
        WHERE tv."maNhom" = nh.id
      ) AS "thanhVien"
    FROM "NHOMHOCTAP" nh
    WHERE nh.id IN (${ids})
  `,
  );
}
