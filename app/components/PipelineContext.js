"use client";

import { createContext, useContext, useState } from "react";

// Global National / Cafe Lines / Both selector. Every view reads this so the
// pipeline filter is a single client-side toggle over one dataset.
// Default is National because Cafe Lines revenue distorts the aggregate view.
const PipelineCtx = createContext(null);

export function PipelineProvider({ children }) {
  const [mode, setMode] = useState("National");
  return (
    <PipelineCtx.Provider value={{ mode, setMode }}>
      {children}
    </PipelineCtx.Provider>
  );
}

export function usePipeline() {
  const ctx = useContext(PipelineCtx);
  if (!ctx) throw new Error("usePipeline must be used within PipelineProvider");
  return ctx;
}
