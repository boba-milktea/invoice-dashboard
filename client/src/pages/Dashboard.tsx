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
import { useSearchParams } from "react-router-dom";

type StatusFilters = "paid" | "unpaid" | null;

function parseUrlStatus(value: string | null): StatusFilters {
  return value === "paid" || value === "unpaid" ? value : null;
}

function parseUrlOverdue(value: string | null): boolean {
  return value === "true";
}

function parseUrlMinAmount(value: string | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseUrlClient(value: string | null): string | null {
  if (value === null) return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- URL -> initial values ---
  const urlSort = searchParams.get("sort") === "amount" ? "amount" : "dueDate";
  const urlOrder = searchParams.get("order") === "desc" ? "desc" : "asc";
  const urlStatus = parseUrlStatus(searchParams.get("status"));
  const urlOverdueOnly = parseUrlOverdue(searchParams.get("overdue"));
  const urlMinAmount = parseUrlMinAmount(searchParams.get("minAmount"));
  const urlClient = parseUrlClient(searchParams.get("client"));

  // --- Data state ---
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [charts, setCharts] = useState<PaidUnPaidChart | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- UI state
  const [sort, setSort] = useState<"dueDate" | "amount">(urlSort);
  const [order, setOrder] = useState<"asc" | "desc">(urlOrder);

  const [status, setStatus] = useState<"paid" | "unpaid" | null>(urlStatus);
  const [overdueOnly, setOverdueOnly] = useState<boolean>(urlOverdueOnly);
  const [minAmountState, setMinAmountState] = useState<number | null>(
    urlMinAmount,
  );
  const [clientInput, setClientInput] = useState<string>(urlClient ?? "");
  const [client, setClient] = useState<string | null>(urlClient);

  // -- Debounce client input ---
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = clientInput.trim();
      setClient(trimmed.length > 0 ? trimmed : null);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [clientInput]);

  // --- Build filters object used for API calls ---
  const filters = useMemo(() => {
    const obj: {
      status?: "paid" | "unpaid";
      overdue?: true;
      minAmount?: number;
      client?: string;
    } = {};

    if (status !== null) obj.status = status;
    if (overdueOnly) obj.overdue = true;
    if (minAmountState !== null) obj.minAmount = minAmountState;
    if (client !== null) obj.client = client;

    return obj;
  }, [status, overdueOnly, minAmountState, client]);

  // --- State -> URL ---
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("sort", sort);
    nextParams.set("order", order);

    if (status === null) nextParams.delete("status");
    else nextParams.set("status", status);

    if (overdueOnly) nextParams.set("overdue", "true");
    else nextParams.delete("overdue");

    if (minAmountState === null) nextParams.delete("minAmount");
    else nextParams.set("minAmount", String(minAmountState));

    const trimmedClient = client?.trim() ?? "";
    if (trimmedClient.length === 0) nextParams.delete("client");
    else nextParams.set("client", trimmedClient);

    setSearchParams(nextParams, { replace: true });
  }, [
    searchParams,
    setSearchParams,
    sort,
    order,
    status,
    overdueOnly,
    minAmountState,
    client,
  ]);

  // --- Fetch when sort/ order / filters changed ---

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
        console.log(invoicesData);

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

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (status !== null) n += 1;
    if (overdueOnly) n += 1;
    if (minAmountState !== null) n += 1;
    if (client !== null) n += 1;
    return n;
  }, [status, overdueOnly, minAmountState, client]);

  function resetFilters() {
    setStatus(null);
    setOverdueOnly(false);
    setMinAmountState(null);
    setClientInput("");
    setClient(null);
  }

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

      {/* Filters */}
      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
            <p className="text-xs text-slate-500">
              Narrow Results; KPIs and table update automatically
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl text-slate-500">
              Actuve: {activeFilterCount}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="status"
              className="text-xs font-medium text-slate-700"
            >
              Status
            </label>
            <select
              name="status"
              id="status"
              className="rounded-lg border px-3 py-2 text-sm"
              value={status ?? "all"}
              onChange={(e) => {
                const v = e.target.value;
                setStatus(
                  v === "paid" ? "paid" : v === "unpaid" ? "unpaid" : null,
                );
              }}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Overdue */}
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="overdue"
              name="overdue"
              className="h-4 w-4"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
            />
            <label htmlFor="overdue" className="text-sm text-slate-700">
              Overdue only
            </label>
          </div>

          {/* Min Amount */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="minAmount"
              className="text-xs font-medium text-slate-700"
            >
              Min amount (cents)
            </label>
            <input
              id="minAmount"
              name="minAmount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. 30.50"
              value={minAmountState ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setMinAmountState(null);
                  return;
                }
                const n = Number(raw);
                if (!Number.isFinite(n) || n < 0) {
                  setMinAmountState(null);
                  return;
                }
                setMinAmountState(n);
              }}
            />
            <p className="text-[11px] text-slate-500">
              Leave blank to disable.
            </p>
          </div>

          {/* Client */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="client"
              className="text-xs font-medium text-slate-700"
            >
              Client
            </label>
            <input
              id="client"
              name="client"
              type="text"
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Search by client name"
              value={clientInput ?? ""}
              onChange={(e) => setClientInput(e.target.value)}
            />
            <p className="text-[11px] text-slate-500">
              Debounced search (350ms).
            </p>
          </div>
        </div>
      </section>

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
