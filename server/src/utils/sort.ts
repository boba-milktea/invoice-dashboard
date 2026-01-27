export type SortField = "dueDate" | "amountCents";
export type SortOrder = "asc" | "desc";

const ALLOWED_SORT_FIELDS: readonly SortField[] = ["dueDate", "amountCents"];

const ALLOWED_ORDER: readonly SortOrder[] = ["asc", "desc"];

export function parseSortParams(query: Record<string, unknown>): {
  sort: SortField;
  order: SortOrder;
} {
  const sortRaw = typeof query.sort === "string" ? query.sort : "dueDate";
  const orderRaw = typeof query.order === "string" ? query.order : "asc";

  const sort = ALLOWED_SORT_FIELDS.includes(sortRaw as SortField)
    ? (sortRaw as SortField)
    : "dueDate";

  const order = ALLOWED_ORDER.includes(orderRaw as SortOrder)
    ? (orderRaw as SortOrder)
    : "asc";

  return { sort, order };
}
