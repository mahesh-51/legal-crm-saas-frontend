import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  invoicesService,
  type CreateInvoiceDto,
  type UpdateInvoiceDto,
} from "@/lib/api/services/invoices.service";
import { toApiError } from "@/lib/api/error-handler";
import type { Invoice } from "@/types";

export const fetchInvoicesByMatter = createAsyncThunk(
  "invoices/fetchByMatter",
  async (matterId: string, { rejectWithValue }) => {
    try {
      const { data } = await invoicesService.listByMatter(matterId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  "invoices/fetchById",
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const { data } = await invoicesService.getById(invoiceId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const createInvoice = createAsyncThunk(
  "invoices/create",
  async (payload: CreateInvoiceDto, { rejectWithValue }) => {
    try {
      const { data } = await invoicesService.create(payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const updateInvoice = createAsyncThunk(
  "invoices/update",
  async (
    { invoiceId, payload }: { invoiceId: string; payload: UpdateInvoiceDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await invoicesService.update(invoiceId, payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  "invoices/delete",
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      await invoicesService.delete(invoiceId);
      return invoiceId;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface InvoicesState {
  byMatter: Record<string, Invoice[]>;
  selected: Invoice | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  byMatter: {},
  selected: null,
  isLoading: false,
  error: null,
};

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleRejected = (
      state: InvoicesState,
      action: { payload?: unknown }
    ) => {
      state.error = (action.payload as { message?: string })?.message ?? "Request failed";
    };

    builder
      .addCase(fetchInvoicesByMatter.fulfilled, (state, { meta, payload }) => {
        state.byMatter[meta.arg] = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchInvoicesByMatter.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvoicesByMatter.rejected, (state, action) => {
        state.isLoading = false;
        handleRejected(state, action);
      })
      .addCase(fetchInvoiceById.fulfilled, (state, { payload }) => {
        state.selected = payload;
        state.error = null;
      })
      .addCase(fetchInvoiceById.rejected, handleRejected)
      .addCase(createInvoice.fulfilled, (state, { payload }) => {
        const arr = state.byMatter[payload.matterId] ?? [];
        state.byMatter[payload.matterId] = [...arr, payload];
        state.error = null;
      })
      .addCase(createInvoice.rejected, handleRejected)
      .addCase(updateInvoice.fulfilled, (state, { payload }) => {
        const arr = state.byMatter[payload.matterId] ?? [];
        const idx = arr.findIndex((i) => i.id === payload.id);
        if (idx >= 0) {
          arr[idx] = payload;
          state.byMatter[payload.matterId] = [...arr];
        }
        if (state.selected?.id === payload.id) state.selected = payload;
        state.error = null;
      })
      .addCase(updateInvoice.rejected, handleRejected)
      .addCase(deleteInvoice.fulfilled, (state, { payload }) => {
        for (const key of Object.keys(state.byMatter)) {
          state.byMatter[key] = state.byMatter[key].filter((i) => i.id !== payload);
        }
        if (state.selected?.id === payload) state.selected = null;
        state.error = null;
      })
      .addCase(deleteInvoice.rejected, handleRejected);
  },
});

export const { clearError } = invoicesSlice.actions;
export default invoicesSlice.reducer;
