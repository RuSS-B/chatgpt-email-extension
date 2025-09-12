import { Issue } from './interfaces';

declare const browser: typeof globalThis & { storage: any };

const MAX_CHARS = 300;

export class IssueStorage {
  async show(): Promise<Issue[]> {
    return (await browser.storage.local.get('issues')).issues || [];
  }

  async setWhitelisted(emails: string[]) {
    console.log('Setting whitelisted', emails);
    const now = Date.now();
    const expiration = now + (24 * 60 * 60 * 1000); // 24 hours from now
    
    const whitelist = await this.getWhitelist();
    
    // Add new emails to whitelist with expiration
    emails.forEach(email => {
      whitelist[email] = expiration;
    });
    
    await browser.storage.local.set({ whitelist });
  }

  async getWhitelist(): Promise<Record<string, number>> {
    const result = await browser.storage.local.get('whitelist');
    return result.whitelist || {};
  }

  async isWhitelisted(email: string): Promise<boolean> {
    const whitelist = await this.getWhitelist();
    const expiration = whitelist[email];
    
    if (!expiration) {
      return false;
    }
    
    // Check if whitelist entry has expired
    if (Date.now() > expiration) {
      // Remove expired entry
      delete whitelist[email];
      await browser.storage.local.set({ whitelist });
      return false;
    }
    
    return true;
  }

  async filterNonWhitelistedEmails(emails: string[]): Promise<string[]> {
    const nonWhitelisted: string[] = [];
    
    for (const email of emails) {
      if (!(await this.isWhitelisted(email))) {
        nonWhitelisted.push(email);
      }
    }
    
    return nonWhitelisted;
  }

  async add(emails: string[], fullText: string): Promise<Issue[]> {
    const now = new Date().toISOString();

    const issues = emails.map((email) => ({
      email,
      text: fullText.slice(0, MAX_CHARS),
      ts: now,
    }));

    const history = await this.show();
    await browser.storage.local.set({ issues: [...history, ...issues] });

    return issues;
  }

  async clear(): Promise<void> {
    await browser.storage.local.set({ issues: [] });
  }
}
