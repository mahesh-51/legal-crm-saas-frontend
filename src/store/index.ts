import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import clientsReducer from "./slices/clients.slice";
import mattersReducer from "./slices/matters.slice";
import firmsReducer from "./slices/firms.slice";
import dailyListingsReducer from "./slices/daily-listings.slice";
import documentsReducer from "./slices/documents.slice";
import invoicesReducer from "./slices/invoices.slice";
import notificationsReducer from "./slices/notifications.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    matters: mattersReducer,
    firms: firmsReducer,
    dailyListings: dailyListingsReducer,
    documents: documentsReducer,
    invoices: invoicesReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
