import PageShell from "../components/layout/PageShell";
import KPICard from "../components/KPICard";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceChart from "../components/InvoiceChart";
import InvoiceFiltersBar from "../components/InvoiceFiltersBar";
import { useInvoiceQueryState } from "../hooks/useInvoiceQueryState";
import { useDashboardData } from "../hooks/useDashboardData";

export default function Dashboard() {
  const queryState = useInvoiceQueryState();
  const { invoices, kpis, charts, error, loading } = useDashboardData(
    queryState.sort,
    queryState.order,
    queryState.filters,
  );

  return (
    <PageShell
      title="Invoice Dashboard Overview"
      subtitle="Quickly see what needs attention"
    >
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Error: {error}
        </div>
      )}

      <InvoiceFiltersBar
        status={queryState.status}
        onChangeStatus={queryState.setStatus}
        overdueOnly={queryState.overdueOnly}
        onChangeOverdueOnly={queryState.setOverdueOnly}
        minAmount={queryState.minAmount}
        onChangeMinAmount={queryState.setMinAmount}
        clientInput={queryState.clientInput}
        onChangeClientInput={queryState.setClientInput}
        activeFilterCount={queryState.activeFilterCount}
        onReset={queryState.resetFilters}
      />

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
            sort={queryState.sort}
            order={queryState.order}
            onChangeSort={(nextSort) => {
              if (nextSort === queryState.sort) {
                queryState.setOrder(
                  queryState.order === "asc" ? "desc" : "asc",
                );
              } else {
                queryState.setSort(nextSort);
                queryState.setOrder("asc");
              }
            }}
          />
        </div>
      </section>
    </PageShell>
  );
}
