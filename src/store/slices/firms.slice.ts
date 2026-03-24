import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  firmsService,
  type CreateFirmDto,
  type UpdateFirmDto,
} from "@/lib/api/services/firms.service";
import { toApiError } from "@/lib/api/error-handler";
import type { Firm } from "@/types";

export const fetchFirms = createAsyncThunk(
  "firms/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await firmsService.list();
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const fetchFirmById = createAsyncThunk(
  "firms/fetchById",
  async (firmId: string, { rejectWithValue }) => {
    try {
      const { data } = await firmsService.getById(firmId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const createFirm = createAsyncThunk(
  "firms/create",
  async (payload: CreateFirmDto, { rejectWithValue }) => {
    try {
      const { data } = await firmsService.create(payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const updateFirm = createAsyncThunk(
  "firms/update",
  async (
    { firmId, payload }: { firmId: string; payload: UpdateFirmDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await firmsService.update(firmId, payload);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const uploadFirmLogo = createAsyncThunk(
  "firms/uploadLogo",
  async (
    { firmId, file }: { firmId: string; file: File },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await firmsService.uploadLogo(firmId, file);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface FirmsState {
  list: Firm[];
  selected: Firm | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FirmsState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

const firmsSlice = createSlice({
  name: "firms",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleRejected = (
      state: FirmsState,
      action: { payload?: unknown }
    ) => {
      state.error = (action.payload as { message?: string })?.message ?? "Request failed";
    };

    builder
      .addCase(fetchFirms.fulfilled, (state, { payload }) => {
        state.list = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchFirms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFirms.rejected, (state, action) => {
        state.isLoading = false;
        handleRejected(state, action);
      })
      .addCase(fetchFirmById.fulfilled, (state, { payload }) => {
        state.selected = payload;
        state.error = null;
      })
      .addCase(fetchFirmById.rejected, handleRejected)
      .addCase(createFirm.fulfilled, (state, { payload }) => {
        state.list.push(payload);
        state.error = null;
      })
      .addCase(createFirm.rejected, handleRejected)
      .addCase(updateFirm.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex((f) => f.id === payload.id);
        if (idx >= 0) state.list[idx] = payload;
        if (state.selected?.id === payload.id) state.selected = payload;
        state.error = null;
      })
      .addCase(updateFirm.rejected, handleRejected)
      .addCase(uploadFirmLogo.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex((f) => f.id === payload.id);
        if (idx >= 0) state.list[idx] = payload;
        if (state.selected?.id === payload.id) state.selected = payload;
        state.error = null;
      })
      .addCase(uploadFirmLogo.rejected, handleRejected);
  },
});

export const { clearError } = firmsSlice.actions;
export default firmsSlice.reducer;
