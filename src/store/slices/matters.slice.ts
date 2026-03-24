import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  mattersService,
  type CreateMatterDto,
  type UpdateMatterDto,
  type ListMattersParams,
} from "@/lib/api/services/matters.service";
import { toApiError } from "@/lib/api/error-handler";
import type { Matter } from "@/types";
import { normalizeMatter } from "@/lib/api/normalize-matter";

export const fetchMatters = createAsyncThunk(
  "matters/fetchAll",
  async (params: ListMattersParams, { rejectWithValue }) => {
    try {
      const { data } = await mattersService.list(params);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const fetchMatterById = createAsyncThunk(
  "matters/fetchById",
  async (matterId: string, { rejectWithValue }) => {
    try {
      const { data } = await mattersService.getById(matterId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const createMatter = createAsyncThunk(
  "matters/create",
  async (
    { firmId, payload }: { firmId: string; payload: CreateMatterDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await mattersService.create(firmId, payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const updateMatter = createAsyncThunk(
  "matters/update",
  async (
    { matterId, payload }: { matterId: string; payload: UpdateMatterDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await mattersService.update(matterId, payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const deleteMatter = createAsyncThunk(
  "matters/delete",
  async (matterId: string, { rejectWithValue }) => {
    try {
      await mattersService.delete(matterId);
      return matterId;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface MattersState {
  list: Matter[];
  selected: Matter | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MattersState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

const mattersSlice = createSlice({
  name: "matters",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleRejected = (
      state: MattersState,
      action: { payload?: unknown }
    ) => {
      state.error = (action.payload as { message?: string })?.message ?? "Request failed";
    };

    builder
      .addCase(fetchMatters.fulfilled, (state, { payload }) => {
        state.list = payload.map(normalizeMatter);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchMatters.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMatters.rejected, (state, action) => {
        state.isLoading = false;
        handleRejected(state, action);
      })
      .addCase(fetchMatterById.fulfilled, (state, { payload }) => {
        state.selected = normalizeMatter(payload);
        state.error = null;
      })
      .addCase(fetchMatterById.rejected, handleRejected)
      .addCase(createMatter.fulfilled, (state, { payload }) => {
        state.list.push(normalizeMatter(payload));
        state.error = null;
      })
      .addCase(createMatter.rejected, handleRejected)
      .addCase(updateMatter.fulfilled, (state, { payload }) => {
        const normalized = normalizeMatter(payload);
        const idx = state.list.findIndex((m) => m.id === normalized.id);
        if (idx >= 0) state.list[idx] = normalized;
        if (state.selected?.id === normalized.id) state.selected = normalized;
        state.error = null;
      })
      .addCase(updateMatter.rejected, handleRejected)
      .addCase(deleteMatter.fulfilled, (state, { payload }) => {
        state.list = state.list.filter((m) => m.id !== payload);
        if (state.selected?.id === payload) state.selected = null;
        state.error = null;
      })
      .addCase(deleteMatter.rejected, handleRejected);
  },
});

export const { clearError } = mattersSlice.actions;
export default mattersSlice.reducer;
