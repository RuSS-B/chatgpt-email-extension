import { Issue } from './interfaces';

declare const browser: typeof globalThis & { storage: any };

const MAX_CHARS = 300;

export class IssueStorage {
  private whitelist: Map<string, number> | undefined;

  async loadWhitelist() {
    this.whitelist = new Map(Object.entries(await IssueStorage.getWhitelist()));

    console.log('White list loaded', Array.from(this.whitelist.entries()));
  }

  async show(): Promise<Issue[]> {
    return (await browser.storage.local.get('issues')).issues || [];
  }

  async validate(emails: string[], text: string): Promise<Issue[]> {
    const issues: Issue[] = [];
    for (const email of emails) {
      if (await this.isWhitelisted(email)) {
        continue;
      }

      const issue = await this.add(email, text);
      issues.push(issue);
    }

    return issues;
  }

  async setWhitelisted(emails: string[]) {
    console.log('Setting whitelisted', emails);
    const now = Date.now();
    const expiration = now + 24 * 60 * 60 * 1000; // 24 hours from now

    const whitelist = await IssueStorage.getWhitelist();

    //Cleanup expired
    Object.keys(whitelist).forEach((email) => {
      const expiration = whitelist[email];

      if (now > expiration) {
        delete whitelist[email];
      }
    });

    emails.forEach((email) => {
      whitelist[email] = expiration;
    });

    await browser.storage.local.set({ whitelist });
    await this.loadWhitelist();
  }

  static async getWhitelist(): Promise<Record<string, number>> {
    const result = await browser.storage.local.get('whitelist');
    return result.whitelist || {};
  }

  isAllWhitelisted(emails: string[]): boolean {
    console.log('Checking emails in the whitelist', emails);

    return emails.every((email) => this.isWhitelisted(email));
  }

  isWhitelisted(email: string): boolean {
    if (!this.whitelist) {
      throw new Error('Whitelist is not defined!');
    }

    const expiration = this.whitelist.get(email);

    if (!expiration) {
      return false;
    }

    // Check if whitelist entry has expired
    if (Date.now() > expiration) {
      this.whitelist.delete(email);

      return false;
    }

    return true;
  }

  async add(email: string, text: string): Promise<Issue> {
    const issue = this.toIssue(email, text);

    const history = await this.show();
    await browser.storage.local.set({ issues: [...history, issue] });

    return issue;
  }

  async clear(): Promise<void> {
    await browser.storage.local.set({ issues: [] });
  }

  private toIssue(email: string, text: string): Issue {
    const now = new Date().toISOString();

    return {
      email,
      text: text.slice(0, MAX_CHARS),
      ts: now,
    };
  }
}
