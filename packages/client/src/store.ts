import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { sessionReducer } from "./auth/data/sessionSlice.ts";
import { userService } from "./dashboard/data/userService.ts";
import { authService } from "./auth/data/authService.ts";
import { dashboardReducer } from "./dashboard/data/dashboardSlice.ts";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    dashboard: dashboardReducer,
    [userService.reducerPath]: userService.reducer,
    [authService.reducerPath]: authService.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userService.middleware, authService.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;