import { useEffect, useMemo, useState } from "react";
import {
  fetchInvoices,
  fetchKpis,
  fetchPaidUnpaidChart,
} from "../api/invoiceApi";
import type { Invoice, Kpis, PaidUnPaidChart } from "../types/invoice";
import type { InvoiceApiFilters, SortField, SortOrder } from "../types/invoice";

export function useDashboardData(
  sort: SortField,
  order: SortOrder,
  filters: InvoiceApiFilters,
) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [charts, setCharts] = useState<PaidUnPaidChart | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);

        const [kpisData, chartData, invoicesData] = await Promise.all([
          fetchKpis(filters),
          fetchPaidUnpaidChart(),
          fetchInvoices(sort, order, filters),
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
  }, [sort, order, filters]);

  const loading = useMemo(() => !kpis || !charts, [kpis, charts]);

  return { invoices, kpis, charts, error, loading };
}
