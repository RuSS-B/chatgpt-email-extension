export function extUrl(path: string) {
  try {
    if (typeof browser !== 'undefined' && browser.runtime?.getURL) {
      console.log('Polyfill working properly, getting the url');

      return browser.runtime.getURL(path);
    }
  } catch {}
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      console.log('This is a chrome runtime');

      return chrome.runtime.getURL(path);
    }
  } catch {
    console.error('Looks like the does not support chrome extension');
  }

  return path;
}
