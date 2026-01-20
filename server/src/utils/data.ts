export function isOverdueUnPaid(
  invoice: {
    status: "paid" | "unpaid";
    dueDate: Date;
  },
  now = new Date(),
): boolean {
  if (invoice.status !== "unpaid") return false;
  return new Date(invoice.dueDate).getTime() < now.getTime();
}
