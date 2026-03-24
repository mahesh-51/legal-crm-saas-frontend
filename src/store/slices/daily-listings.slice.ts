import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  dailyListingsService,
  type CreateDailyListingDto,
  type DailyListingsQueryParams,
  type DailyListingsPageResponse,
  type UpdateDailyListingDto,
} from "@/lib/api/services/daily-listings.service";
import { toApiError } from "@/lib/api/error-handler";
import type { DailyListing } from "@/types";

function sortByCurrentDateDesc(list: DailyListing[]) {
  return [...list].sort((a, b) =>
    (b.currentDate ?? "").localeCompare(a.currentDate ?? "")
  );
}

export const fetchDailyListings = createAsyncThunk(
  "dailyListings/fetchAll",
  async (params: DailyListingsQueryParams | undefined, { rejectWithValue }) => {
    try {
      const { data } = await dailyListingsService.list(params);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const fetchDailyListingById = createAsyncThunk(
  "dailyListings/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await dailyListingsService.getById(id);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const createDailyListing = createAsyncThunk(
  "dailyListings/create",
  async (payload: CreateDailyListingDto, { rejectWithValue }) => {
    try {
      const { data } = await dailyListingsService.create(payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const updateDailyListing = createAsyncThunk(
  "dailyListings/update",
  async (
    { id, payload }: { id: string; payload: UpdateDailyListingDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await dailyListingsService.update(id, payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const deleteDailyListing = createAsyncThunk(
  "dailyListings/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await dailyListingsService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface DailyListingsState {
  /** Result of last `GET /daily-listings` (all matters, server-filtered). */
  items: DailyListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  selected: DailyListing | null;
  isLoading: boolean;
  error: string | null;
}

function mergeListMeta(
  state: DailyListingsState,
  payload: DailyListingsPageResponse
) {
  state.items = payload.items;
  state.total = payload.total;
  state.page = payload.page;
  state.limit = payload.limit;
  state.totalPages = payload.totalPages;
}

const initialState: DailyListingsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  selected: null,
  isLoading: false,
  error: null,
};

const dailyListingsSlice = createSlice({
  name: "dailyListings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleRejected = (
      state: DailyListingsState,
      action: { payload?: unknown }
    ) => {
      state.error =
        (action.payload as { message?: string })?.message ?? "Request failed";
    };

    builder
      .addCase(fetchDailyListings.fulfilled, (state, { payload }) => {
        mergeListMeta(state, payload);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchDailyListings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDailyListings.rejected, (state, action) => {
        state.isLoading = false;
        handleRejected(state, action);
      })
      .addCase(fetchDailyListingById.fulfilled, (state, { payload }) => {
        state.selected = payload;
        state.error = null;
      })
      .addCase(fetchDailyListingById.rejected, handleRejected)
      .addCase(createDailyListing.fulfilled, (state, { payload }) => {
        if (state.page === 1) {
          const withoutDup = state.items.filter((row) => row.id !== payload.id);
          state.items = sortByCurrentDateDesc([
            payload,
            ...withoutDup.slice(0, Math.max(0, state.limit - 1)),
          ]);
        }
        state.total += 1;
        state.totalPages = Math.max(1, Math.ceil(state.total / state.limit) || 1);
        state.error = null;
      })
      .addCase(createDailyListing.rejected, handleRejected)
      .addCase(updateDailyListing.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((row) => row.id === payload.id);
        if (idx >= 0) {
          const next = [...state.items];
          next[idx] = payload;
          state.items = sortByCurrentDateDesc(next);
        }
        if (state.selected?.id === payload.id) state.selected = payload;
        state.error = null;
      })
      .addCase(updateDailyListing.rejected, handleRejected)
      .addCase(deleteDailyListing.fulfilled, (state, { payload }) => {
        const had = state.items.some((row) => row.id === payload);
        state.items = state.items.filter((row) => row.id !== payload);
        if (had) state.total = Math.max(0, state.total - 1);
        state.totalPages = Math.max(1, Math.ceil(state.total / state.limit) || 1);
        if (state.selected?.id === payload) state.selected = null;
        state.error = null;
      })
      .addCase(deleteDailyListing.rejected, handleRejected);
  },
});

export const { clearError } = dailyListingsSlice.actions;
export default dailyListingsSlice.reducer;
