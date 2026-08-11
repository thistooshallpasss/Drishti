'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { Terminal, Copy, Check, Trash2, Save, CloudOff, Cloud } from 'lucide-react';

export const ScratchpadCard: React.FC = () => {
  const {
    scratchpadContent,
    setScratchpadContent,
    flushScratchpadToCloud,
    scratchpadLanguage,
    setScratchpadLanguage,
    isCloudConnected,
  } = useDrishti();

  const [copied, setCopied] = useState(false);
  // Local text drives the UI instantly — no waiting for cloud round-trip
  const [localText, setLocalText] = useState(scratchpadContent);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync local text if cloud content changes (e.g. another device edited it)
  useEffect(() => {
    setLocalText(scratchpadContent);
  }, [scratchpadContent]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalText(val);
    setScratchpadContent(val); // update local state immediately (for localStorage)

    // Debounce cloud write: only flush after 800ms of idle
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsSyncing(true);
    debounceRef.current = setTimeout(() => {
      flushScratchpadToCloud(val);
      setIsSyncing(false);
    }, 800);
  }, [setScratchpadContent, flushScratchpadToCloud]);

  const handleCopy = () => {
    navigator.clipboard.writeText(localText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Clear scratchpad content?')) {
      setLocalText('');
      flushScratchpadToCloud('');
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
          value={localText}
          onChange={handleChange}
          placeholder="// Paste temporary algorithms, notes, or logic here..."
          className="code-textarea"
          spellCheck={false}
        />
      </div>

      {/* Footer */}
      <div className="scratchpad-footer">
        <div className="status-saved">
          {isSyncing ? (
            <><Cloud size={12} className="save-icon" /><span>Syncing…</span></>
          ) : isCloudConnected ? (
            <><Cloud size={12} className="save-icon" /><span>Saved to cloud</span></>
          ) : (
            <><CloudOff size={12} className="save-icon" style={{ color: 'var(--text-muted)' }} /><span style={{ color: 'var(--text-muted)' }}>Local only</span></>
          )}
        </div>
        <span className="char-count">
          {localText.length} chars • {localText.split('\n').length} lines
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
