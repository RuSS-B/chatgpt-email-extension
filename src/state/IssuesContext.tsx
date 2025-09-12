import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Issue } from '../interfaces';
import { IssueStorage } from '../issue-storage';

type Tab = 'issues' | 'history';

type IssuesContextValue = {
  current: Issue[]; // last-detected batch
  history: Issue[]; // all-time from storage
  modalOpen: boolean;
  activeTab: Tab;
  // actions
  showIssues: (batch: Issue[], continueCallback?: () => void) => void;
  showHistory: () => void;
  closeModal: () => void;
  setActiveTab: (t: Tab) => void;
  clearHistory: () => Promise<void>;
  continueAnyway?: () => void;
};

const IssuesContext = createContext<IssuesContextValue | null>(null);

export function IssuesProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<Issue[]>([]);
  const [history, setHistory] = useState<Issue[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('issues');
  const [continueCallback, setContinueCallback] = useState<(() => void) | null>(
    null,
  );

  const issueStorage = new IssueStorage();

  // Load and live-sync storage
  useEffect(() => {
    issueStorage.show().then(setHistory);
  }, []);

  // Refresh history function
  const refreshHistory = useCallback(async () => {
    const updatedHistory = await issueStorage.show();
    setHistory(updatedHistory);
  }, [issueStorage]);

  const api = useMemo<IssuesContextValue>(
    () => ({
      current,
      history,
      modalOpen,
      activeTab,
      showIssues: (batch, continueCallback) => {
        setCurrent(batch);
        setActiveTab('issues');
        setModalOpen(true);
        setContinueCallback(() => continueCallback || null);
        // Refresh history to include the newly added issues
        refreshHistory();
      },
      showHistory: () => {
        setActiveTab('history');
        setModalOpen(true);
      },
      closeModal: () => setModalOpen(false),
      setActiveTab,
      clearHistory: async () => {
        await issueStorage.clear();
        setHistory([]);
      },
      continueAnyway: continueCallback
        ? () => {
            setModalOpen(false);
            setContinueCallback(null);
            if (continueCallback) {
              continueCallback();
            }
          }
        : undefined,
    }),
    [current, history, modalOpen, activeTab, continueCallback, issueStorage, refreshHistory],
  );

  return (
    <IssuesContext.Provider value={api}>{children}</IssuesContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error('useIssues must be used within IssuesProvider');
  return ctx;
}
