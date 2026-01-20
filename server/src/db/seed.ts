import { prisma } from "./client.js";

const CLIENTS = [
  "Acme BV",
  "Bluebird Consulting",
  "Northwind Traders",
  "Brussels Office Supplies",
  "EuroParts Distribution",
  "Lambda Design Studio",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmountCents(): number {
  return randomInt(50_00, 5_000_00); // €50 – €5000
}

function randomIssueAndDueDates() {
  const issueDate = new Date();
  issueDate.setDate(issueDate.getDate() - randomInt(1, 120));

  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + randomInt(7, 45));

  return { issueDate, dueDate };
}

async function main() {
  const COUNT = 25;

  await prisma.invoice.deleteMany();

  const data = Array.from({ length: COUNT }, (_, i) => {
    const { issueDate, dueDate } = randomIssueAndDueDates();
    const status = Math.random() < 0.65 ? "paid" : "unpaid";

    let adjustedDueDate = dueDate;

    // ~35% of unpaid invoices become overdue
    if (status === "unpaid" && Math.random() < 0.35) {
      adjustedDueDate = new Date();
      adjustedDueDate.setDate(adjustedDueDate.getDate() - randomInt(1, 30));
    }

    return {
      id: `INV-${10000 + i}`,
      clientName: CLIENTS[randomInt(0, CLIENTS.length - 1)],
      amountCents: randomAmountCents(),
      currency: "EUR",
      issueDate,
      dueDate: adjustedDueDate,
      status,
    };
  });

  await prisma.invoice.createMany({ data });

  const total = await prisma.invoice.count();
  const unpaid = await prisma.invoice.count({ where: { status: "unpaid" } });

  console.log(`Seeded ${total} invoices. Unpaid: ${unpaid}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
