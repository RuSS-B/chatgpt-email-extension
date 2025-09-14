import { EmailExtractor } from './email-extractor';
import { IssueStorage } from './issue-storage';
import { Modal } from './interfaces';

export class Monitor {
  constructor(
    private readonly issueStorage: IssueStorage,
    private readonly modal: Modal,
  ) {}

  observe() {
    this.addOnSubmitHandler();
    this.addOnEnterHandler();
    this.addOnClickHandler();

    console.log('ChatGPT Email Guard: Enhanced monitoring started');
  }

  private addOnSubmitHandler() {
    document.addEventListener(
      'submit',
      (event) => {
        this.interceptSubmit(event);
      },
      true,
    );
  }

  private addOnEnterHandler() {
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const target = event.target as HTMLElement;

          if (
            target.id === 'prompt-textarea' ||
            target.classList.contains('ProseMirror') ||
            target.matches(
              '[contenteditable="true"][data-virtualkeyboard="true"]',
            )
          ) {
            this.interceptSubmit(event);
          }
        }
      },
      true,
    );
  }

  private addOnClickHandler() {
    const maxElementDepth = 5;

    document.addEventListener(
      'click',
      (event) => {
        const target: EventTarget | null = event.target;

        if (!target) {
          return;
        }

        let element = target as HTMLElement;

        //max 5 elements deep
        for (let i = 0; i < maxElementDepth; i++) {
          if (
            element &&
            element.tagName === 'BUTTON' &&
            element.closest('form')
          ) {
            const buttonText = element.textContent?.toLowerCase() || '';
            const ariaLabel =
              element.getAttribute('aria-label')?.toLowerCase() || '';

            // Check for send/submit indicators
            if (
              buttonText.includes('send') ||
              ariaLabel.includes('send') ||
              element.querySelector('svg') ||
              element.matches('[data-testid*="send"]') ||
              element.matches('[data-testid*="submit"]')
            ) {
              this.interceptSubmit(event);
              break;
            }
          }
          element = element.parentElement as HTMLElement;
        }
      },
      true,
    );
  }

  private getPromptText(): string {
    const possibleSelectors = [
      '#prompt-textarea',
      '[data-testid="prompt-textarea"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="Ask anything"]',
      '[contenteditable="true"][data-virtualkeyboard="true"]',
      '.ProseMirror',
    ];

    for (const selector of possibleSelectors) {
      const element: HTMLElement | HTMLTextAreaElement | null =
        document.querySelector(selector);

      if (!element) {
        console.log('No element here!');
        continue;
      }

      if (element instanceof HTMLTextAreaElement) {
        return element.value.trim();
      } else if (element.textContent) {
        return element.textContent.trim();
      }
    }

    return '';
  }

  private interceptSubmit(event: Event) {
    const text = this.getPromptText();

    if (!text) {
      return;
    }

    const emails = EmailExtractor.extract(text);
    if (!emails.length) {
      return;
    }

    if (this.issueStorage.isAllWhitelisted(emails)) {
      console.log('The email(s) is white listed');

      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.issueStorage.validate(emails, text).then((issues) => {
      if (issues.length) {
        this.modal(
          issues,
          this.getContinueCallback(
            event,
            issues.map(({ email }) => email),
          ),
        );
      } else {
        console.log('Lets go!');
        return true;
      }
    });

    return false;
  }

  private getContinueCallback(event: Event, emails?: string[]) {
    return async () => {
      console.log(
        'Continue anyway - whitelisting emails and re-dispatching event',
      );

      if (emails) {
        await this.issueStorage.setWhitelisted(emails);
        console.log('Emails whitelisted for 24 hours:', emails);
      }

      const submitButton = document.querySelector(
        '#composer-submit-button',
      ) as HTMLElement;
      submitButton?.click();

      // const target = event.target as HTMLElement;
      // if (event.type === 'submit') {
      //   const form = target as HTMLFormElement;
      //   form.submit();
      // } else if (event.type === 'click') {
      //   console.log(target);
      //   target.click();
      // } else if (event.type === 'keydown') {
      //   const form = target.closest('form') as HTMLFormElement;
      //   if (form) {
      //     form.submit();
      //   }
      // }
    };
  }
}
