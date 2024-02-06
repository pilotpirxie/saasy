import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authReducer } from "./auth/data/slice.ts";
import { userService } from "./dashboard/data/userService.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userService.reducerPath]: userService.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userService.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;