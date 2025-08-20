import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function sortObject(obj: any) {
  const sortedObj = Object.entries(obj)
    .filter(
      ([key, value]) => value !== '' && value !== undefined && value !== null,
    )
    .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return sortedObj;
}

export const getWeekDateRange = (
  weekNumber: number,
  startDate: Date,
  daysInMonth: number,
  month: number,
) => {
  const firstDayOfWeek = startDate.getUTCDay();
  const weekStartDay = (weekNumber - 1) * 7 - firstDayOfWeek + 1;
  const weekEndDay = Math.min(weekStartDay + 6, daysInMonth);

  const actualStartDay = Math.max(1, weekStartDay);

  return `${actualStartDay}-${weekEndDay}/tháng ${month}`;
};
