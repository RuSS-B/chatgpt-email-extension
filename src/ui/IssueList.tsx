import type { Issue } from '../interfaces';
import React from 'react';

export function IssuesList({
  issues,
  title,
}: {
  issues: Issue[];
  title: string;
}) {
  if (issues.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📧</div>
        <div className="empty-text">No email addresses detected</div>
      </div>
    );
  }

  return (
    <div className="issues-list">
      <div className="issues-header">{title}</div>
      {issues.map((issue, idx) => (
        <div key={idx} className="issue-item">
          <div className="issue-email">
            <span className="email-icon">✉️</span>
            <span className="email-address">{issue.email}</span>
          </div>
          <div className="issue-snippet">
            <strong>Context:</strong> "{issue.text}"
          </div>
          <div className="issue-meta">
            <span className="issue-time">
              {new Date(issue.ts).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
