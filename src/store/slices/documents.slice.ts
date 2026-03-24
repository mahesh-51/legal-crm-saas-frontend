import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { documentsService } from "@/lib/api/services/documents.service";
import { toApiError } from "@/lib/api/error-handler";
import type { Document, DocumentCategory } from "@/types";

export const fetchDocumentsByMatter = createAsyncThunk(
  "documents/fetchByMatter",
  async (matterId: string, { rejectWithValue }) => {
    try {
      const { data } = await documentsService.listByMatter(matterId);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const uploadDocument = createAsyncThunk(
  "documents/upload",
  async (
    {
      matterId,
      file,
      category,
    }: { matterId: string; file: File; category?: DocumentCategory },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await documentsService.upload(matterId, file, category);
      return data;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "documents/delete",
  async (documentId: string, { rejectWithValue }) => {
    try {
      await documentsService.delete(documentId);
      return documentId;
    } catch (err) {
      return rejectWithValue(toApiError(err));
    }
  }
);

interface DocumentsState {
  byMatter: Record<string, Document[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  byMatter: {},
  isLoading: false,
  error: null,
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentsByMatter.fulfilled, (state, { meta, payload }) => {
        state.byMatter[meta.arg] = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchDocumentsByMatter.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDocumentsByMatter.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = (payload as { message?: string })?.message ?? "Request failed";
      })
      .addCase(uploadDocument.fulfilled, (state, { payload }) => {
        const arr = state.byMatter[payload.matterId] ?? [];
        state.byMatter[payload.matterId] = [...arr, payload];
        state.error = null;
      })
      .addCase(uploadDocument.rejected, (state, { payload }) => {
        state.error = (payload as { message?: string })?.message ?? "Upload failed";
      })
      .addCase(deleteDocument.fulfilled, (state, { payload }) => {
        for (const key of Object.keys(state.byMatter)) {
          state.byMatter[key] = state.byMatter[key].filter((d) => d.id !== payload);
        }
        state.error = null;
      })
      .addCase(deleteDocument.rejected, (state, { payload }) => {
        state.error = (payload as { message?: string })?.message ?? "Delete failed";
      });
  },
});

export const { clearError } = documentsSlice.actions;
export default documentsSlice.reducer;
