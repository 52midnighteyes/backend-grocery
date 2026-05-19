export const ONE_SECOND_IN_MS = 1000;
export const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60;
export const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60;
export const ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 24;
export const FOURTEEN_DAYS_IN_MS = ONE_DAY_IN_MS * 14;
export const THIRTY_DAYS_IN_MS = ONE_DAY_IN_MS * 30;

export const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  const originalDay = nextDate.getDate();

  nextDate.setDate(1);
  nextDate.setMonth(nextDate.getMonth() + months);

  const lastDayOfTargetMonth = new Date(
    nextDate.getFullYear(),
    nextDate.getMonth() + 1,
    0,
  ).getDate();

  nextDate.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return nextDate;
};
