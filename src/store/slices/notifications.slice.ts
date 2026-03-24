import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsService } from "@/lib/api/services/notifications.service";
import { toApiError } from "@/lib/api/error-handler";
import type { Notification } from "@/types";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await notificationsService.list();
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const { data } = await notificationsService.markRead(notificationId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationsService.markAllRead();
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface NotificationsState {
  list: Notification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  list: [],
  isLoading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.list = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = (payload as { message: string })?.message ?? "Request failed";
      })
      .addCase(markNotificationRead.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex((n) => n.id === payload.id);
        if (idx >= 0) state.list[idx] = payload;
        state.error = null;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({ ...n, read: true }));
        state.error = null;
      });
  },
});

export const { clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
