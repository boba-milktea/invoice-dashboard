export type MockInvoiceStatus = "paid" | "unpaid";

export type MockInvoiceRecord = {
  id: string;
  clientName: string;
  amountCents: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  status: MockInvoiceStatus;
};

const CLIENTS = [
  "Acme BV",
  "Bluebird Consulting",
  "Northwind Traders",
  "Brussels Office Supplies",
  "EuroParts Distribution",
  "Lambda Design Studio",
] as const;

/** Fixed layout: 16 paid, 9 unpaid (4 overdue, 5 current unpaid). */
const LAYOUT: Array<{
  clientIndex: number;
  amountCents: number;
  status: MockInvoiceStatus;
  issueDaysAgo: number;
  dueDaysFromIssue: number;
}> = [
  { clientIndex: 0, amountCents: 125_000, status: "paid", issueDaysAgo: 90, dueDaysFromIssue: 30 },
  { clientIndex: 1, amountCents: 89_500, status: "paid", issueDaysAgo: 75, dueDaysFromIssue: 14 },
  { clientIndex: 2, amountCents: 210_000, status: "paid", issueDaysAgo: 60, dueDaysFromIssue: 21 },
  { clientIndex: 3, amountCents: 45_000, status: "paid", issueDaysAgo: 55, dueDaysFromIssue: 30 },
  { clientIndex: 4, amountCents: 320_000, status: "paid", issueDaysAgo: 50, dueDaysFromIssue: 14 },
  { clientIndex: 5, amountCents: 67_800, status: "paid", issueDaysAgo: 45, dueDaysFromIssue: 21 },
  { clientIndex: 0, amountCents: 156_000, status: "paid", issueDaysAgo: 40, dueDaysFromIssue: 30 },
  { clientIndex: 1, amountCents: 98_250, status: "paid", issueDaysAgo: 35, dueDaysFromIssue: 14 },
  { clientIndex: 2, amountCents: 275_000, status: "paid", issueDaysAgo: 30, dueDaysFromIssue: 21 },
  { clientIndex: 3, amountCents: 52_400, status: "paid", issueDaysAgo: 28, dueDaysFromIssue: 30 },
  { clientIndex: 4, amountCents: 189_000, status: "paid", issueDaysAgo: 25, dueDaysFromIssue: 14 },
  { clientIndex: 5, amountCents: 73_500, status: "paid", issueDaysAgo: 22, dueDaysFromIssue: 21 },
  { clientIndex: 0, amountCents: 142_000, status: "paid", issueDaysAgo: 20, dueDaysFromIssue: 30 },
  { clientIndex: 1, amountCents: 110_000, status: "paid", issueDaysAgo: 18, dueDaysFromIssue: 14 },
  { clientIndex: 2, amountCents: 245_000, status: "paid", issueDaysAgo: 15, dueDaysFromIssue: 21 },
  { clientIndex: 3, amountCents: 88_000, status: "paid", issueDaysAgo: 12, dueDaysFromIssue: 30 },
  { clientIndex: 4, amountCents: 195_000, status: "unpaid", issueDaysAgo: 45, dueDaysFromIssue: 14 },
  { clientIndex: 5, amountCents: 62_300, status: "unpaid", issueDaysAgo: 40, dueDaysFromIssue: 21 },
  { clientIndex: 0, amountCents: 310_000, status: "unpaid", issueDaysAgo: 35, dueDaysFromIssue: 10 },
  { clientIndex: 1, amountCents: 48_900, status: "unpaid", issueDaysAgo: 30, dueDaysFromIssue: 14 },
  { clientIndex: 2, amountCents: 175_000, status: "unpaid", issueDaysAgo: 25, dueDaysFromIssue: 21 },
  { clientIndex: 3, amountCents: 92_600, status: "unpaid", issueDaysAgo: 20, dueDaysFromIssue: 30 },
  { clientIndex: 4, amountCents: 220_000, status: "unpaid", issueDaysAgo: 15, dueDaysFromIssue: 14 },
  { clientIndex: 5, amountCents: 55_750, status: "unpaid", issueDaysAgo: 10, dueDaysFromIssue: 21 },
  { clientIndex: 0, amountCents: 138_400, status: "unpaid", issueDaysAgo: 8, dueDaysFromIssue: 30 },
];

function daysAgo(days: number, now = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d;
}

function buildRecord(
  index: number,
  layout: (typeof LAYOUT)[number],
  now = new Date(),
): MockInvoiceRecord {
  const issueDate = daysAgo(layout.issueDaysAgo, now);
  let dueDate = daysAgo(layout.issueDaysAgo - layout.dueDaysFromIssue, now);

  if (layout.status === "unpaid") {
    const unpaidIndex = index - 16;
    if (unpaidIndex < 4) {
      dueDate = daysAgo(unpaidIndex + 3, now);
    } else {
      dueDate = daysAgo(-(unpaidIndex - 2), now);
    }
  }

  return {
    id: `INV-${10000 + index}`,
    clientName: CLIENTS[layout.clientIndex],
    amountCents: layout.amountCents,
    currency: "EUR",
    issueDate,
    dueDate,
    status: layout.status,
  };
}

export function buildMockInvoices(now = new Date()): MockInvoiceRecord[] {
  return LAYOUT.map((layout, index) => buildRecord(index, layout, now));
}

export const MOCK_INVOICES: MockInvoiceRecord[] = buildMockInvoices();
