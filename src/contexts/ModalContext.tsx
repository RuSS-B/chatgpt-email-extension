import React, { createContext, useContext, useCallback } from 'react';
import { useIssues } from '../state/IssuesContext';
import { Issue } from '../interfaces';

interface ModalContextValue {
  showIssues: (issues: Issue[], continueCallback?: () => void) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const { showIssues: showIssuesFromState } = useIssues();

  const showIssues = useCallback((issues: Issue[], continueCallback?: () => void) => {
    showIssuesFromState(issues, continueCallback);
  }, [showIssuesFromState]);

  const value: ModalContextValue = {
    showIssues,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// Global bridge for non-React code to access modal
let globalModalBridge: ModalContextValue | null = null;

export function setGlobalModalBridge(bridge: ModalContextValue) {
  globalModalBridge = bridge;
}

export function getGlobalModalBridge(): ModalContextValue | null {
  return globalModalBridge;
}