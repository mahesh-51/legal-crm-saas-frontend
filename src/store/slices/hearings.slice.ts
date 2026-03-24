import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  hearingsService,
  type CreateHearingDto,
  type UpdateHearingDto,
} from "@/lib/api/services/hearings.service";
import { toApiError } from "@/lib/api/error-handler";
import type { Hearing } from "@/types";

export const fetchHearingsByMatter = createAsyncThunk(
  "hearings/fetchByMatter",
  async (matterId: string, { rejectWithValue }) => {
    try {
      const { data } = await hearingsService.listByMatter(matterId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const fetchHearingById = createAsyncThunk(
  "hearings/fetchById",
  async (hearingId: string, { rejectWithValue }) => {
    try {
      const { data } = await hearingsService.getById(hearingId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const createHearing = createAsyncThunk(
  "hearings/create",
  async (payload: CreateHearingDto, { rejectWithValue }) => {
    try {
      const { data } = await hearingsService.create(payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const updateHearing = createAsyncThunk(
  "hearings/update",
  async (
    { hearingId, payload }: { hearingId: string; payload: UpdateHearingDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await hearingsService.update(hearingId, payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const deleteHearing = createAsyncThunk(
  "hearings/delete",
  async (hearingId: string, { rejectWithValue }) => {
    try {
      await hearingsService.delete(hearingId);
      return hearingId;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface HearingsState {
  byMatter: Record<string, Hearing[]>;
  selected: Hearing | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: HearingsState = {
  byMatter: {},
  selected: null,
  isLoading: false,
  error: null,
};

const hearingsSlice = createSlice({
  name: "hearings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleRejected = (
      state: HearingsState,
      action: { payload?: unknown }
    ) => {
      state.error = (action.payload as { message?: string })?.message ?? "Request failed";
    };

    builder
      .addCase(fetchHearingsByMatter.fulfilled, (state, { meta, payload }) => {
        state.byMatter[meta.arg] = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchHearingsByMatter.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHearingsByMatter.rejected, (state, action) => {
        state.isLoading = false;
        handleRejected(state, action);
      })
      .addCase(fetchHearingById.fulfilled, (state, { payload }) => {
        state.selected = payload;
        state.error = null;
      })
      .addCase(fetchHearingById.rejected, handleRejected)
      .addCase(createHearing.fulfilled, (state, { payload }) => {
        const arr = state.byMatter[payload.matterId] ?? [];
        state.byMatter[payload.matterId] = [...arr, payload];
        state.error = null;
      })
      .addCase(createHearing.rejected, handleRejected)
      .addCase(updateHearing.fulfilled, (state, { payload }) => {
        const arr = state.byMatter[payload.matterId] ?? [];
        const idx = arr.findIndex((h) => h.id === payload.id);
        if (idx >= 0) {
          arr[idx] = payload;
          state.byMatter[payload.matterId] = [...arr];
        }
        if (state.selected?.id === payload.id) state.selected = payload;
        state.error = null;
      })
      .addCase(updateHearing.rejected, handleRejected)
      .addCase(deleteHearing.fulfilled, (state, { payload }) => {
        for (const key of Object.keys(state.byMatter)) {
          state.byMatter[key] = state.byMatter[key].filter((h) => h.id !== payload);
        }
        if (state.selected?.id === payload) state.selected = null;
        state.error = null;
      })
      .addCase(deleteHearing.rejected, handleRejected);
  },
});

export const { clearError } = hearingsSlice.actions;
export default hearingsSlice.reducer;
