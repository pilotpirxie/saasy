import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { sessionReducer } from "./auth/data/sessionSlice.ts";
import { usersService } from "./dashboard/data/usersService.ts";
import { authService } from "./auth/data/authService.ts";
import { dashboardReducer } from "./dashboard/data/dashboardSlice.ts";
import { teamsService } from "./dashboard/data/teamsService.ts";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    dashboard: dashboardReducer,
    [usersService.reducerPath]: usersService.reducer,
    [authService.reducerPath]: authService.reducer,
    [teamsService.reducerPath]: teamsService.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(usersService.middleware, authService.middleware, teamsService.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;