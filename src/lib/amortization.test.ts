import { describe, expect, it } from "vitest";
import { addMonths, monthlyAmortization } from "./amortization";

describe("monthlyAmortization", () => {
  it("割り切れる価格を均等に配賦する", () => {
    const item = { priceYen: 120_000, amortizationStartMonth: "2026-01", usefulLifeMonths: 12 };
    expect(monthlyAmortization(item, "2026-01")).toBe(10_000);
    expect(monthlyAmortization(item, "2026-12")).toBe(10_000);
  });
  it("端数を先頭月から1円ずつ配る", () => {
    const item = { priceYen: 100_000, amortizationStartMonth: "2026-01", usefulLifeMonths: 36 };
    const total = Array.from({ length: 36 }, (_, index) => monthlyAmortization(item, addMonths("2026-01", index))).reduce((a, b) => a + b, 0);
    expect(monthlyAmortization(item, "2026-01")).toBe(2_778);
    expect(monthlyAmortization(item, "2028-12")).toBe(2_777);
    expect(total).toBe(100_000);
  });
  it("期間外は0円", () => {
    const item = { priceYen: 12_000, amortizationStartMonth: "2026-04", usefulLifeMonths: 12 };
    expect(monthlyAmortization(item, "2026-03")).toBe(0);
    expect(monthlyAmortization(item, "2027-04")).toBe(0);
  });
  it("年をまたいで月を加算する", () => expect(addMonths("2026-11", 3)).toBe("2027-02"));
});
