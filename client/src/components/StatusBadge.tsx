import { Badge } from "./ui/Badge";
import type { InvoiceComputedStatus } from "../types/invoice";

const styles: Record<InvoiceComputedStatus, string> = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  unpaid: "border-amber-200 bg-amber-50 text-amber-700",
  overdue: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function StatusBadge({
  status,
}: {
  status: InvoiceComputedStatus;
}) {
  return <Badge className={styles[status]}>{status.toUpperCase()}</Badge>;
}
