import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService, type LoginCredentials, type SignupFirmCredentials, type SignupIndividualCredentials } from "@/lib/api/services/auth.service";
import {
  usersService,
  type UpdateMeDto,
} from "@/lib/api/services/users.service";
import { setAccessToken, clearAccessToken, toApiError } from "@/lib/api/error-handler";
import type { User } from "@/types";
import { normalizeUser } from "@/lib/user-role";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data } = await authService.login(credentials);
      const token = data.accessToken ?? data.token;
      if (token) setAccessToken(token);
      return normalizeUser(data.user);
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const signupFirm = createAsyncThunk(
  "auth/signupFirm",
  async (credentials: SignupFirmCredentials, { rejectWithValue }) => {
    try {
      const { data } = await authService.signupFirm(credentials);
      const token = data.accessToken ?? data.token;
      if (token) setAccessToken(token);
      return normalizeUser(data.user);
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const signupIndividual = createAsyncThunk(
  "auth/signupIndividual",
  async (credentials: SignupIndividualCredentials, { rejectWithValue }) => {
    try {
      const { data } = await authService.signupIndividual(credentials);
      const token = data.accessToken ?? data.token;
      if (token) setAccessToken(token);
      return normalizeUser(data.user);
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await usersService.getMe();
      return normalizeUser(data);
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const updateMe = createAsyncThunk(
  "auth/updateMe",
  async (payload: UpdateMeDto, { rejectWithValue }) => {
    try {
      const { data } = await usersService.updateMe(payload);
      return normalizeUser(data);
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload ? normalizeUser(payload) : null;
      state.isAuthenticated = !!payload;
    },
    logout: (state) => {
      clearAccessToken();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, { payload }: { payload: boolean }) => {
      state.isLoading = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.error = (payload as { message: string }).message;
      })
      .addCase(signupFirm.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupFirm.rejected, (state, { payload }) => {
        state.error = (payload as { message: string }).message;
      })
      .addCase(signupIndividual.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupIndividual.rejected, (state, { payload }) => {
        state.error = (payload as { message: string }).message;
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMe.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.error = null;
      })
      .addCase(updateMe.rejected, (state, { payload }) => {
        state.error = (payload as { message: string }).message;
      });
  },
});

export const { setUser, logout, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
