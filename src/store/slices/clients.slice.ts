import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  clientsService,
  type CreateClientDto,
  type UpdateClientDto,
} from "@/lib/api/services/clients.service";
import { toApiError } from "@/lib/api/error-handler";
import type { Client } from "@/types";

export const fetchClients = createAsyncThunk(
  "clients/fetchAll",
  async (firmId: string, { rejectWithValue }) => {
    try {
      const { data } = await clientsService.list(firmId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const fetchClientById = createAsyncThunk(
  "clients/fetchById",
  async (clientId: string, { rejectWithValue }) => {
    try {
      const { data } = await clientsService.getById(clientId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const createClient = createAsyncThunk(
  "clients/create",
  async (
    { firmId, payload }: { firmId: string; payload: CreateClientDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await clientsService.create(firmId, payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const updateClient = createAsyncThunk(
  "clients/update",
  async (
    { clientId, payload }: { clientId: string; payload: UpdateClientDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await clientsService.update(clientId, payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const deleteClient = createAsyncThunk(
  "clients/delete",
  async (clientId: string, { rejectWithValue }) => {
    try {
      await clientsService.delete(clientId);
      return clientId;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface ClientsState {
  list: Client[];
  selected: Client | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleRejected = (
      state: ClientsState,
      action: { payload?: unknown }
    ) => {
      state.error = (action.payload as { message?: string })?.message ?? "Request failed";
    };

    builder
      .addCase(fetchClients.fulfilled, (state, { payload }) => {
        state.list = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        handleRejected(state, action);
      })
      .addCase(fetchClientById.fulfilled, (state, { payload }) => {
        state.selected = payload;
        state.error = null;
      })
      .addCase(fetchClientById.rejected, handleRejected)
      .addCase(createClient.fulfilled, (state, { payload }) => {
        state.list.push(payload);
        state.error = null;
      })
      .addCase(createClient.rejected, handleRejected)
      .addCase(updateClient.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex((c) => c.id === payload.id);
        if (idx >= 0) state.list[idx] = payload;
        if (state.selected?.id === payload.id) state.selected = payload;
        state.error = null;
      })
      .addCase(updateClient.rejected, handleRejected)
      .addCase(deleteClient.fulfilled, (state, { payload }) => {
        state.list = state.list.filter((c) => c.id !== payload);
        if (state.selected?.id === payload) state.selected = null;
        state.error = null;
      })
      .addCase(deleteClient.rejected, handleRejected);
  },
});

export const { clearError } = clientsSlice.actions;
export default clientsSlice.reducer;
