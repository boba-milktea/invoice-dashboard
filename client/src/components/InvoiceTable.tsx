import { Card, CardContent, CardHeader } from "./ui/Card";
import { Button } from "./ui/Button";
import StatusBadge from "./StatusBadge";
import type { Invoice } from "../types/invoice";

type Props = {
  invoices: Invoice[];
  sort: "dueDate" | "amount";
  order: "asc" | "desc";
  onChangeSort: (sort: "dueDate" | "amount") => void;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("be-BE", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(isoDateString: string) {
  const date = new Date(isoDateString);
  return date.toLocaleDateString();
}

function SortButton({
  label,
  active,
  order,
  onClick,
}: {
  label: string;
  active: boolean;
  order: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" onClick={onClick} className="gap-2">
      {label}{" "}
      {active && (
        <span className="text-xs text-slate-500">{order.toUpperCase()}</span>
      )}
    </Button>
  );
}

export default function InvoiceTable({
  invoices,
  sort,
  order,
  onChangeSort,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Invoices</div>
          <div className="text-xs text-slate-500">Sorted server-side</div>
        </div>

        <div className="flex items-center gap-2">
          <SortButton
            label="Due Date"
            active={sort === "dueDate"}
            order={order}
            onClick={() => onChangeSort("dueDate")}
          />
          <SortButton
            label="Amount"
            active={sort === "amount"}
            order={order}
            onClick={() => onChangeSort("amount")}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-seperate border-spacing-0">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500">
                {["Invoice ID", "Client", "Amount", "Due date", "Status"].map(
                  (header) => (
                    <th key={header} className="p-4 text-left">
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="text-sm">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="border-b border-slate-100 px-5 py-3 font-medium text-slate-900">
                    {invoice.id}
                  </td>
                  <td className="border-b border-slate-100 px-5 py-3 text-slate-700">
                    {invoice.clientName}
                  </td>
                  <td className="border-b border-slate-100 px-5 py-3 text-slate-700">
                    {formatMoney(invoice.amount, invoice.currency)}
                  </td>
                  <td className="border-b border-slate-100 px-5 py-3 text-slate-700">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="border-b border-slate-100 px-5 py-3">
                    <StatusBadge status={invoice.computedStatus} />
                  </td>
                </tr>
              ))}

              {invoices.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-6 text-center text-slate-500"
                  >
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
