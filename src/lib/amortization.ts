export type AmortizableItem = {
  priceYen: number;
  amortizationStartMonth: string;
  usefulLifeMonths: number;
};

export function monthIndex(yearMonth: string): number {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(yearMonth);
  if (!match) throw new Error("年月は YYYY-MM 形式で指定してください");
  return Number(match[1]) * 12 + Number(match[2]) - 1;
}

export function monthlyAmortization(item: AmortizableItem, targetMonth: string): number {
  if (!Number.isSafeInteger(item.priceYen) || item.priceYen < 0) throw new Error("価格が不正です");
  if (!Number.isSafeInteger(item.usefulLifeMonths) || item.usefulLifeMonths < 1) throw new Error("耐用月数が不正です");
  const offset = monthIndex(targetMonth) - monthIndex(item.amortizationStartMonth);
  if (offset < 0 || offset >= item.usefulLifeMonths) return 0;
  const base = Math.floor(item.priceYen / item.usefulLifeMonths);
  const remainder = item.priceYen % item.usefulLifeMonths;
  return base + (offset < remainder ? 1 : 0);
}

export function addMonths(yearMonth: string, months: number): string {
  const index = monthIndex(yearMonth) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}
