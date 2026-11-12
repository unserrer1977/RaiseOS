import { describe, expect, it } from "vitest";
import { formatMoney, parseMoney } from "@/lib/money";

describe("parseMoney", () => {
  it("reads UK-style units and keeps the currency", () => {
    expect(parseMoney("£10bn")).toMatchObject({ amount: 10e9, currency: "£" });
    expect(parseMoney("£1.7bn")).toMatchObject({ amount: 1.7e9, currency: "£" });
    expect(parseMoney("£18m")).toMatchObject({ amount: 18e6, currency: "£" });
    expect(parseMoney("£13.5k typical contract")).toMatchObject({ amount: 13500, currency: "£" });
    expect(parseMoney("€2 million")).toMatchObject({ amount: 2e6, currency: "€" });
  });

  it("does not treat an ordinary word as a unit", () => {
    expect(parseMoney("£15 per student per year")).toMatchObject({ amount: 15, monthly: false });
    expect(parseMoney("$50/month")).toMatchObject({ amount: 50, monthly: true, currency: "$" });
    expect(parseMoney("12000 MRR")?.amount).toBe(12000);
    expect(parseMoney("$1.5M")?.amount).toBe(1.5e6);
  });
});

describe("formatMoney", () => {
  it("writes the amount back in the deck's currency", () => {
    expect(formatMoney(10e9, "£")).toBe("£10B");
    expect(formatMoney(100e6, "$")).toBe("$100M");
    // Pounds when nothing says otherwise.
    expect(formatMoney(100e6)).toBe("£100M");
    expect(parseMoney("4000")?.currency).toBe("£");
  });
});
