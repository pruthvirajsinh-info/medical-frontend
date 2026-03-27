"use client";

import { Provider } from "react-redux";
import { store } from "../store";
import { useEffect } from "react";
import { loadToken } from "../store/slices/authSlice";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(loadToken());
  }, []);

  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
