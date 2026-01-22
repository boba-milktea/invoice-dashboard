import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/layout/PageShell";
import KPICard from "../components/KPICard";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceChart from "../components/InvoiceChart";
import {
  fetchInvoices,
  fetchKpis,
  fetchPaidUnpaidChart,
} from "../api/invoiceApi";
import type { Invoice, Kpis, PaidUnPaidChart } from "../types/invoice";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [charts, setCharts] = useState<PaidUnPaidChart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<"dueDate" | "amountCents">("dueDate");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const [kpisData, chartData, invoicesData] = await Promise.all([
          fetchKpis(),
          fetchPaidUnpaidChart(),
          fetchInvoices(sort, order),
        ]);
        if (cancelled) return;

        setKpis(kpisData);
        setCharts(chartData);
        setInvoices(invoicesData);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [sort, order]);

  const loading = useMemo(() => !kpis || !charts, [kpis, charts]);

  return (
    <PageShell
      title="Invoice Dashboard Overview"
      subtitle="Quickly see what needs attention"
    >
      {error && (
        <div className=" mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Error: {error}
        </div>
      )}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <KPICard label="Total Invoices" value={kpis?.total ?? 0} />
        <KPICard label="Unpaid Invoices" value={kpis?.unpaid ?? 0} />
        <KPICard label="Overdue Invoices" value={kpis?.overdue ?? 0} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <InvoiceChart data={charts} loading={loading} />
        </div>

        <div className="lg:col-span-3">
          <InvoiceTable
            invoices={invoices}
            sort={sort}
            order={order}
            onChangeSort={(nextSort) => {
              if (nextSort === sort) {
                setOrder(order === "asc" ? "desc" : "asc");
              } else {
                setSort(nextSort);
                setOrder("asc");
              }
            }}
          />
        </div>
      </section>
    </PageShell>
  );
}
