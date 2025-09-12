import React, { useEffect } from 'react';
import { IssuesProvider, useIssues } from '../state/IssuesContext';
import {
  ModalProvider,
  useModal,
  setGlobalModalBridge,
} from '../contexts/ModalContext';
import cssText from './styles.css?raw';
import { IssuesList } from './IssueList';

function ModalBridge() {
  const modal = useModal();

  // Register modal bridge globally so Monitor can use it
  useEffect(() => {
    setGlobalModalBridge(modal);
  }, [modal]);

  return null; // This component just sets up the bridge
}

function Modal() {
  const {
    modalOpen,
    closeModal,
    activeTab,
    setActiveTab,
    current,
    history,
    clearHistory,
    continueAnyway,
  } = useIssues();

  // Apply modal-open class to shadow DOM host
  useEffect(() => {
    const mountElement = document.getElementById('__ceg_mount__');

    const shadowRoot = mountElement?.shadowRoot;
    if (shadowRoot && !shadowRoot.querySelector('[data-ceg-styles]')) {
      const style = document.createElement('style');
      style.setAttribute('data-ceg-styles', 'true');
      style.textContent = cssText;
      shadowRoot.appendChild(style);
    }

    if (mountElement) {
      if (modalOpen) {
        mountElement.classList.add('modal-open');
      } else {
        mountElement.classList.remove('modal-open');
      }
    }
  }, [modalOpen]);

  return (
    <div
      className={`ceg-overlay ${modalOpen ? 'visible' : ''}`}
      onClick={closeModal}
    >
      <div className="ceg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="header">
          <div className="title">
            <span className="title-icon">🛡️</span>
            ChatGPT Email Guard
          </div>
          <button className="close" onClick={closeModal}>
            ✕
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <span className="tab-icon">⚠️</span>
            Issues Found
            {current.length > 0 && (
              <span className="badge">{current.length}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="tab-icon">📊</span>
            History
            {history.length > 0 && (
              <span className="badge">{history.length}</span>
            )}
          </button>
        </div>

        <div className="content">
          {activeTab === 'issues' ? (
            <IssuesList
              issues={current}
              title={`${current.length} email${current.length !== 1 ? 's' : ''} detected in your current prompt`}
            />
          ) : (
            <>
              <div className="history-header">
                <h3>All Detected Emails</h3>
                {history.length > 0 && (
                  <button className="clear-button" onClick={clearHistory}>
                    Clear All
                  </button>
                )}
              </div>
              <IssuesList issues={history} title="" />
            </>
          )}
        </div>

        {activeTab === 'issues' && current.length > 0 && (
          <div className="footer">
            <div className="warning">
              ⚠️ Email addresses were detected in your prompt. Consider removing
              them to protect privacy.
            </div>
            <div className="footer-actions">
              <button className="cancel-button" onClick={closeModal}>
                Cancel
              </button>
              {continueAnyway && (
                <button className="continue-button" onClick={continueAnyway}>
                  Continue Anyway
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModalRoot() {
  return (
    <IssuesProvider>
      <ModalProvider>
        <ModalBridge />
        <Modal />
      </ModalProvider>
    </IssuesProvider>
  );
}
