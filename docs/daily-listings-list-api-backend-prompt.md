# Backend prompt: `GET /daily-listings` (firm-wide list + filters + pagination)

Use this spec to implement or extend the **list** endpoint so it matches the Legal CRM frontend.

## Goal

Expose a single endpoint that returns **daily listings across all matters** the caller can access (firm-scoped, same auth as today), with **server-side search**, **date filtering on `currentDate` only**, and **pagination**.

**Important:** Rows are filtered by the listing’s **`currentDate`** field (court diary / “current listing” date). Do **not** use `nextDate` for this list filter unless you add a separate explicit query param.

---

## Endpoint

| Method | Path | Who may call |
|--------|------|----------------|
| `GET` | `/daily-listings` | Same as other daily-listing routes (e.g. firm admin, lawyer, individual, client read-only where applicable) |

**Auth:** `Authorization: Bearer <access_token>` (unchanged).

---

## Query parameters (all optional)

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Server-side search across relevant text fields (e.g. `caseNo`, `caseType`, `complainants`, `defendants`, synopsis, orders, client names). Empty or omitted = no search filter. |
| `dateFrom` | ISO date `YYYY-MM-DD` | **Inclusive** lower bound on **`currentDate`**. Omitted = no lower bound. |
| `dateTo` | ISO date `YYYY-MM-DD` | **Inclusive** upper bound on **`currentDate`**. Omitted = no upper bound. |
| `page` | integer | **1-based** page index. Default `1`. |
| `limit` | integer | Page size (e.g. `10`, `20`, `50`). Default `20` if omitted. |

### Date semantics (required)

- Apply **`dateFrom` / `dateTo` only to `currentDate`**.
- Only rows whose **`currentDate`** falls in `[dateFrom, dateTo]` (inclusive) are returned when those params are present.
- **`nextDate` must not** participate in this default filter.

If both `dateFrom` and `dateTo` are omitted, return all listings the user may see (subject to firm/matter ACL), optionally still honoring `search` and pagination.

---

## Response (JSON object — not a bare array)

```json
{
  "items": [ /* DailyListing[] — same fields as detail, including matterTitle */ ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

| Field | Description |
|-------|-------------|
| `items` | Page of daily listing rows for this request. |
| `total` | Total number of rows matching **filters + search** (before pagination). |
| `page` | Current page (echo requested `page`, clamped if out of range). |
| `limit` | Page size (echo requested `limit`). |
| `totalPages` | `ceil(total / limit)` when `limit > 0`; use `0` when `total === 0` if you prefer. |

Each item in `items` should include: `id`, `matterId`, **`matterTitle`** (required for the list UI), `clients[]`, `caseType`, `caseNo`, `complainants`, `defendants`, `status`, `currentDate`, `nextDate`, `synopsis`, `orders`, `createdAt`, `updatedAt`.

**Sort:** Prefer **`currentDate` descending**, then `createdAt` descending.

---

## Existing routes (unchanged)

- `POST /daily-listings`
- `GET /daily-listings/matter/:matterId`
- `GET /daily-listings/:id`
- `PATCH /daily-listings/:id`
- `DELETE /daily-listings/:id`

---

## Errors

- `400` — invalid date format, `dateFrom > dateTo`, or invalid `page` / `limit`.
- `403` / `401` — auth / firm access as usual.

---

## Frontend alignment

The UI defaults **`dateFrom` and `dateTo` to “today”** and sends **`page` / `limit`** on every list request. Users can clear dates to drop bounds or change the range.
