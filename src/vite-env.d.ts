/// <reference types="vite/client" />

declare const chrome: {
  runtime?: {
    getURL?: (path: string) => string;
  };
};

declare const browser: {
  runtime?: {
    getURL?: (path: string) => string;
  };
};
