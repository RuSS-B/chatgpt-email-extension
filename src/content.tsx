import React from 'react';
import { createRoot } from 'react-dom/client';
import ModalRoot from './ui/ModalRoot';
import { Monitor } from './monitor';
import { extUrl } from './utils/ext-url';
import { Issue } from './interfaces';
import { getGlobalModalBridge } from './contexts/ModalContext';

function ensureMount(): void {
  const id = '__ceg_mount__';

  if (document.getElementById(id)) {
    return;
  }

  const host = document.createElement('div');
  host.id = id;
  document.documentElement.appendChild(host);

  const app = document.createElement('div');
  app.id = 'app';

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = extUrl('content.css');

  const shadow = host.attachShadow({ mode: 'open' });
  shadow.appendChild(link);
  shadow.appendChild(app);

  createRoot(app).render(<ModalRoot />);
}

ensureMount();

const showModal = (issues: Issue[], continueCallback?: () => void) => {
  console.log('Opening modal');
  const modalBridge = getGlobalModalBridge();

  if (modalBridge) {
    modalBridge.showIssues(issues, continueCallback);
  } else {
    console.warn('Modal bridge not ready yet, retrying...');
    setTimeout(() => showModal(issues, continueCallback), 100);
  }
};

const monitor = new Monitor(showModal);
monitor.observe();
