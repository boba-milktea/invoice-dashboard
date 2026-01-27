import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  StatusFilter,
  SortField,
  SortOrder,
  InvoiceApiFilters,
} from "../types/invoice";

function parseUrlStatus(value: string | null): StatusFilter {
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

export function useInvoiceQueryState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL -> initial values
  const urlSort: SortField =
    searchParams.get("sort") === "amount" ? "amount" : "dueDate";
  const urlOrder: SortOrder =
    searchParams.get("order") === "desc" ? "desc" : "asc";

  const urlStatus = parseUrlStatus(searchParams.get("status"));
  const urlOverdueOnly = parseUrlOverdue(searchParams.get("overdue"));
  const urlMinAmount = parseUrlMinAmount(searchParams.get("minAmount"));
  const urlClient = parseUrlClient(searchParams.get("client"));

  // State (initialized once)
  const [sort, setSort] = useState<SortField>(urlSort);
  const [order, setOrder] = useState<SortOrder>(urlOrder);

  const [status, setStatus] = useState<StatusFilter>(urlStatus);
  const [overdueOnly, setOverdueOnly] = useState<boolean>(urlOverdueOnly);
  const [minAmount, setMinAmount] = useState<number | null>(urlMinAmount);

  const [clientInput, setClientInput] = useState<string>(urlClient ?? "");
  const [client, setClient] = useState<string | null>(urlClient);

  // Debounce client input -> effective client filter
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = clientInput.trim();
      setClient(trimmed.length > 0 ? trimmed : null);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [clientInput]);

  // Filters for API
  const filters: InvoiceApiFilters = useMemo(() => {
    const filterObj: InvoiceApiFilters = {};
    if (status !== null) filterObj.status = status;
    if (overdueOnly) filterObj.overdue = true;
    if (minAmount !== null) filterObj.minAmount = minAmount;
    if (client !== null) filterObj.client = client;
    return filterObj;
  }, [status, overdueOnly, minAmount, client]);

  // State -> URL sync
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.set("sort", sort);
    nextParams.set("order", order);

    if (status === null) nextParams.delete("status");
    else nextParams.set("status", status);

    if (overdueOnly) nextParams.set("overdue", "true");
    else nextParams.delete("overdue");

    if (minAmount === null) nextParams.delete("minAmount");
    else nextParams.set("minAmount", String(minAmount));

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
    minAmount,
    client,
  ]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (status !== null) n += 1;
    if (overdueOnly) n += 1;
    if (minAmount !== null) n += 1;
    if (client !== null) n += 1;
    return n;
  }, [status, overdueOnly, minAmount, client]);

  function resetFilters() {
    setStatus(null);
    setOverdueOnly(false);
    setMinAmount(null);
    setClientInput("");
    setClient(null);
  }

  return {
    // sorting
    sort,
    order,
    setSort,
    setOrder,

    // filters (UI state)
    status,
    setStatus,
    overdueOnly,
    setOverdueOnly,
    minAmount,
    setMinAmount,
    clientInput,
    setClientInput,

    filters,
    activeFilterCount,
    resetFilters,
  };
}
