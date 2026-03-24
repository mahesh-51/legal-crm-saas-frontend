# Legal CRM API Integration

## Overview

All Legal CRM API endpoints are integrated via:

- **Services** – Pure API functions in `services/`
- **Redux slices** – State + `createAsyncThunk` for sync, loading, errors
- **Error handling** – Centralized in `error-handler.ts`

## Usage

### Redux (thunks)

```tsx
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchClients, createClient } from "@/store/slices/clients.slice";

function MyComponent() {
  const dispatch = useAppDispatch();
  const { list: clients, isLoading, error } = useAppSelector((s) => s.clients);

  useEffect(() => {
    dispatch(fetchClients(firmId));
  }, [dispatch, firmId]);

  const handleCreate = () => {
    dispatch(createClient({ firmId, payload: { name, email } }));
  };
}
```

### Direct service calls

```tsx
import { clientsService } from "@/lib/api/services";

const { data } = await clientsService.list(firmId);
```

### Error handling

```tsx
import { getErrorMessage } from "@/lib/api";

try {
  await dispatch(someThunk()).unwrap();
} catch (err) {
  toast.error(getErrorMessage(err));
}
```

## Structure

| Path | Purpose |
|------|---------|
| `services/*.service.ts` | API calls (axios) |
| `error-handler.ts` | `getErrorMessage`, `toApiError`, token helpers |
| `axios.ts` | Configured client + interceptors |

## Environment

Set `NEXT_PUBLIC_API_URL` in `.env` (e.g. `http://localhost:3000`).
