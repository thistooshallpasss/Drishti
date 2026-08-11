'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { Terminal, Copy, Check, Trash2, Save, FileCode } from 'lucide-react';

export const ScratchpadCard: React.FC = () => {
  const {
    scratchpadContent,
    setScratchpadContent,
    scratchpadLanguage,
    setScratchpadLanguage,
  } = useDrishti();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(scratchpadContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Clear scratchpad content?')) {
      setScratchpadContent('');
    }
  };

  return (
    <div className="bento-card scratchpad-container">
      {/* Header */}
      <div className="scratchpad-header">
        <div className="title-group">
          <div className="icon-box">
            <Terminal size={17} />
          </div>
          <div>
            <h3 className="card-title">Code & Logic Scratchpad</h3>
            <p className="card-sub">Instant zero-latency note & snippet buffer</p>
          </div>
        </div>

        <div className="actions-group">
          <select
            value={scratchpadLanguage}
            onChange={(e) => setScratchpadLanguage(e.target.value)}
            className="lang-select"
          >
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="sql">SQL</option>
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
          </select>

          <button onClick={handleCopy} className="btn-icon" title="Copy to Clipboard">
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          </button>

          <button onClick={handleClear} className="btn-icon" title="Clear Scratchpad">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="editor-wrap">
        <textarea
          value={scratchpadContent}
          onChange={(e) => setScratchpadContent(e.target.value)}
          placeholder="// Paste temporary algorithms, notes, or logic here..."
          className="code-textarea"
          spellCheck={false}
        />
      </div>

      {/* Footer */}
      <div className="scratchpad-footer">
        <div className="status-saved">
          <Save size={12} className="save-icon" />
          <span>Auto-saved to local memory</span>
        </div>
        <span className="char-count">
          {scratchpadContent.length} chars • {scratchpadContent.split('\n').length} lines
        </span>
      </div>

      <style jsx>{`
        .scratchpad-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          height: 100%;
        }

        .scratchpad-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-sub {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .actions-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .lang-select {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-primary);
          padding: 0.25rem 0.6rem;
          border-radius: 7px;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          outline: none;
        }

        .editor-wrap {
          flex: 1;
          background: #090d13;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.6rem;
          display: flex;
          min-height: 220px;
        }

        .code-textarea {
          width: 100%;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #e2e8f0;
          font-family: var(--font-mono);
          font-size: 0.84rem;
          line-height: 1.5;
          resize: none;
        }

        .scratchpad-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-muted);
          padding-top: 0.35rem;
        }

        .status-saved {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #10b981;
        }

        .char-count {
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
};
