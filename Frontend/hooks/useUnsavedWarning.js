"use client";

import { useEffect } from "react";

const state = {
  hasUnsavedResults: false,
  onRequestSave: null,
};

export function useUnsavedWarning(hasUnsavedResults, onRequestSave) {
  useEffect(() => {
    state.hasUnsavedResults = hasUnsavedResults;
    state.onRequestSave = onRequestSave;

    return () => {
      state.hasUnsavedResults = false;
      state.onRequestSave = null;
    };
  }, [hasUnsavedResults, onRequestSave]);
}

export function getUnsavedWarningState() {
  return state;
}
