import type { StatusFilter } from "../types/invoice";

type Props = {
  status: StatusFilter;
  onChangeStatus: (next: StatusFilter) => void;

  overdueOnly: boolean;
  onChangeOverdueOnly: (next: boolean) => void;

  minAmount: number | null;
  onChangeMinAmount: (next: number | null) => void;

  clientInput: string;
  onChangeClientInput: (next: string) => void;

  activeFilterCount: number;
  onReset: () => void;
};

export default function InvoiceFiltersBar({
  status,
  onChangeStatus,
  overdueOnly,
  onChangeOverdueOnly,
  minAmount,
  onChangeMinAmount,
  clientInput,
  onChangeClientInput,
  activeFilterCount,
  onReset,
}: Props) {
  return (
    <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
          <p className="text-xs text-slate-500">
            Narrow results; KPIs and table update automatically
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            Active: {activeFilterCount}
          </span>
          <button
            type="button"
            onClick={onReset}
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
            id="status"
            className="rounded-lg border px-3 py-2 text-sm"
            value={status ?? "all"}
            onChange={(e) => {
              const v = e.target.value;
              onChangeStatus(
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
            className="h-4 w-4"
            checked={overdueOnly}
            onChange={(e) => onChangeOverdueOnly(e.target.checked)}
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
            Min amount
          </label>
          <input
            id="minAmount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. 30.50"
            value={minAmount ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return onChangeMinAmount(null);

              const n = Number(raw);
              if (!Number.isFinite(n) || n < 0) return onChangeMinAmount(null);

              onChangeMinAmount(n);
            }}
          />
          <p className="text-[11px] text-slate-500">Leave blank to disable.</p>
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
            type="text"
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Search by client name"
            value={clientInput}
            onChange={(e) => onChangeClientInput(e.target.value)}
          />
          <p className="text-[11px] text-slate-500">
            Debounced search (350ms).
          </p>
        </div>
      </div>
    </section>
  );
}
