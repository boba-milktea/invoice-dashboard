import { Card, CardHeader, CardContent } from "./ui/Card";
import type { PaidUnPaidChart } from "../types/invoice";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

export default function InvoiceChart({
  data,
  loading,
}: {
  data: PaidUnPaidChart | null;
  loading: boolean;
}) {
  const charData = data
    ? [
        { name: "Paid", value: data.paid },
        { name: "Unpaid", value: data.unpaid },
      ]
    : [];
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-semibold">Paid vs Unpaid Invoices</div>
        <div className="text-xs text-slate-500">
          Snapshot count from current dataset{" "}
        </div>
      </CardHeader>
      <CardContent className="h-64">
        {loading || !data ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-slate-500">Loading chart...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
        ;
      </CardContent>
    </Card>
  );
}
