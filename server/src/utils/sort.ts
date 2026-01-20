const ALLOWED_SORT_FIELDS = new Set(["dueDate", "amountCents"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);

export function parseSortParams(query: Record<string, unknown>): {
  sort: "dueDate" | "amountCents";
  order: "asc" | "desc";
} {
  const sortRaw = String(query.sort ?? "dueDate");
  const orderRaw = String(query.order ?? "asc");

  const sort = (ALLOWED_SORT_FIELDS.has(sortRaw) ? sortRaw : "dueDate") as
    | "dueDate"
    | "amountCents";
  const order = (ALLOWED_ORDER.has(orderRaw) ? orderRaw : "asc") as
    | "asc"
    | "desc";

  return { sort, order };
}
