"use client";

import { useEffect, ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { hydrateAuth } from "@/features/auth/states/authSlice";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
