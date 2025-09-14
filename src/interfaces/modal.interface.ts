import { Issue } from './issue.interface';

export type Modal = (issues: Issue[], continueCallback?: () => void) => void;
