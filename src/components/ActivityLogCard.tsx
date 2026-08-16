'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { ActivityLogItem, DailyVoiceEntry } from '@/types';
import {
  Activity,
  Download,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  FileText,
  Mic,
  Globe,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ActivityLogCard: React.FC = () => {
  const {
    activityLogs,
    exportLogs,
    dailyVoiceNotes,
    downloadVoiceNoteFile,
    exportAllVoiceNotes,
    deleteDailyVoiceNote,
  } = useDrishti();

  const [activeTab, setActiveTab] = useState<'web' | 'notes'>('web');
  const [activeTimeframe, setActiveTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();

  // Filter web activity logs
  const filteredWebLogs = activityLogs.filter((log) => {
    if (activeTimeframe === 'all') return true;
    if (activeTimeframe === 'daily') return log.dateStr === todayStr;

    const logDate = new Date(log.timestamp);
    const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    if (activeTimeframe === 'weekly') return diffDays <= 7;
    if (activeTimeframe === 'monthly') return diffDays <= 30;
    return true;
  });

  const handleExportCsv = (tf: 'daily' | 'weekly' | 'monthly' | 'all') => {
    exportLogs(tf);
    setExportedNotice(`Exported ${tf.toUpperCase()} CSV activity log!`);
    setTimeout(() => setExportedNotice(null), 3000);
  };

  // 1-Click single web activity download as .txt file
  const downloadSingleActivityTxt = (log: ActivityLogItem) => {
    const fileBody = `=======================================================
DRISHTI (दृष्टि) - ACTIVITY RECORD
Title: ${log.title}
Category: ${log.category}
Type: ${log.type.toUpperCase()}
URL: ${log.url}
Date: ${log.dateStr}
Time: ${log.timeStr}
Timestamp: ${log.timestamp}
=======================================================

Activity Summary:
- Item: ${log.title}
- Destination: ${log.url}
- Logged At: ${new Date(log.timestamp).toLocaleString()}
`;

    const blob = new Blob([fileBody], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = log.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    a.download = `Activity_${log.dateStr}_${cleanTitle}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setExportedNotice(`Downloaded text file for "${log.title}"`);
    setTimeout(() => setExportedNotice(null), 3000);
  };

  const handleCopyNote = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bento-card activity-log-container">
      {/* Header */}
      <div className="activity-header">
        <div className="title-group">
          <div className="icon-box">
            <BarChart3 size={17} />
          </div>
          <div>
            <h3 className="card-title">Activity Tracker & Download Center</h3>
            <p className="card-sub">
              Dual log for web browsing activity & daily voice notes with 1-click text file export
            </p>
          </div>
        </div>

        {/* Dual Tab Switcher: Web Activity vs Voice Notes */}
        <div className="tracker-tab-switcher">
          <button
            onClick={() => setActiveTab('web')}
            className={`tab-switch-btn ${activeTab === 'web' ? 'active' : ''}`}
          >
            <Globe size={13} />
            <span>Web Activity ({activityLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`tab-switch-btn ${activeTab === 'notes' ? 'active' : ''}`}
          >
            <Mic size={13} />
            <span>Voice Notes ({dailyVoiceNotes.length} days)</span>
          </button>
        </div>
      </div>

      {exportedNotice && (
        <div className="export-success-banner">
          <CheckCircle size={14} color="#10b981" />
          <span>{exportedNotice}</span>
        </div>
      )}

      {/* ================= VIEW 1: WEB & LINK ACTIVITY LOGS ================= */}
      {activeTab === 'web' && (
        <div className="tab-pane-content">
          {/* Controls Bar */}
          <div className="export-toolbar-row">
            <div className="timeframe-pills">
              {(['daily', 'weekly', 'monthly', 'all'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`filter-pill mini-tf-pill ${activeTimeframe === tf ? 'active' : ''}`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="toolbar-right-actions">
              <span className="log-count-text">
                <Clock size={12} />
                <strong>{filteredWebLogs.length}</strong> events
              </span>

              <button
                onClick={() => handleExportCsv(activeTimeframe)}
                className="btn-primary mini-export-btn"
                title={`Download ${activeTimeframe} CSV log`}
              >
                <Download size={12} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Web Logs Stream */}
          <div className="logs-stream-list">
            {filteredWebLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="log-stream-row">
                <div className="log-left-meta">
                  <span className={`log-type-tag type-${log.type}`}>
                    {log.type.replace('_', ' ')}
                  </span>
                  <span className="log-time">{log.timeStr || log.dateStr}</span>
                </div>

                <div className="log-center-title" title={log.url}>
                  <span className="log-title-text">{log.title}</span>
                  <span className="log-url-snippet">{log.url}</span>
                </div>

                <div className="log-row-actions">
                  <button
                    onClick={() => downloadSingleActivityTxt(log)}
                    className="btn-row-download"
                    title={`Download text file record for "${log.title}"`}
                  >
                    <Download size={12} />
                    <span>.txt</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredWebLogs.length === 0 && (
              <div className="empty-logs">
                <Calendar size={22} className="empty-icon" />
                <span>No web activity recorded for this timeframe yet.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: RECORDED VOICE NOTES & TRANSCRIPTS ================= */}
      {activeTab === 'notes' && (
        <div className="tab-pane-content">
          {/* Notes Toolbar */}
          <div className="export-toolbar-row">
            <div className="log-count-info">
              <Mic size={13} color="#a855f7" />
              <span>
                <strong>{dailyVoiceNotes.length}</strong> Days in 14-day rolling archive
              </span>
            </div>

            {dailyVoiceNotes.length > 0 && (
              <button
                onClick={exportAllVoiceNotes}
                className="btn-primary mini-export-btn"
                title="Download combined archive of all 14 days notes"
              >
                <Download size={12} />
                <span>Download All 14 Days (.txt)</span>
              </button>
            )}
          </div>

          {/* Notes Stream */}
          <div className="notes-stream-list">
            {dailyVoiceNotes.map((note) => {
              const isExpanded = expandedNoteId === note.id;
              const preview = note.content.replace(/^#.*\n+/, '').slice(0, 120);

              return (
                <div key={note.id} className="note-card-row">
                  <div
                    className="note-row-main"
                    onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                  >
                    <div className="note-date-badge">
                      <Calendar size={13} color="#38bdf8" />
                      <span className="note-date-text">{note.fullDateHeading}</span>
                      <span className="note-sessions-tag">
                        {note.sessionsCount} {note.sessionsCount === 1 ? 'session' : 'sessions'}
                      </span>
                    </div>

                    <div className="note-preview-text">
                      {preview}...
                    </div>

                    <div className="note-actions-wrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => downloadVoiceNoteFile(note.dateKey)}
                        className="btn-row-download primary"
                        title={`Download text file for ${note.fullDateHeading}`}
                      >
                        <Download size={12} />
                        <span>Download .txt</span>
                      </button>

                      <button
                        onClick={() => handleCopyNote(note.id, note.content)}
                        className="btn-row-download"
                        title="Copy note content"
                      >
                        {copiedId === note.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete notes for ${note.fullDateHeading}?`)) {
                            deleteDailyVoiceNote(note.id);
                          }
                        }}
                        className="btn-row-download danger"
                        title="Delete Day Note"
                      >
                        <Trash2 size={12} />
                      </button>

                      <button
                        onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                        className="btn-row-download toggle"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="note-expanded-body">
                      <pre className="note-full-text">{note.content}</pre>
                    </div>
                  )}
                </div>
              );
            })}

            {dailyVoiceNotes.length === 0 && (
              <div className="empty-logs">
                <Mic size={22} className="empty-icon" />
                <span>No voice notes recorded yet. Use the Daily Voice Journal above to record!</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .activity-log-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }

        .activity-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
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

        .tracker-tab-switcher {
          display: flex;
          background: var(--bg-surface-elevated);
          padding: 0.2rem;
          border-radius: 8px;
          border: 1px solid var(--border-card);
          gap: 0.25rem;
        }

        .tab-switch-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-switch-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-card);
        }

        .tab-pane-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .timeframe-pills {
          display: flex;
          gap: 0.3rem;
          flex-wrap: wrap;
        }

        .mini-tf-pill {
          font-size: 0.68rem;
          padding: 0.2rem 0.55rem;
        }

        .export-toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.55rem 0.8rem;
          border-radius: 8px;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .toolbar-right-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .log-count-text,
        .log-count-info {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          color: var(--text-secondary);
        }

        .mini-export-btn {
          padding: 0.28rem 0.65rem;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .export-success-banner {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          font-size: 0.75rem;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logs-stream-list,
        .notes-stream-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          overflow-y: auto;
          max-height: 280px;
        }

        .log-stream-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          border-radius: 8px;
          font-size: 0.78rem;
          gap: 0.75rem;
        }

        .log-left-meta {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-shrink: 0;
        }

        .log-type-tag {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .type-link {
          background: rgba(56, 189, 248, 0.15);
          color: var(--accent-primary);
        }

        .type-doc_tree {
          background: rgba(96, 165, 250, 0.15);
          color: #60a5fa;
        }

        .type-flashcard {
          background: rgba(192, 132, 252, 0.15);
          color: #c084fc;
        }

        .log-time {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .log-category-pill {
          font-size: 0.64rem;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.05rem 0.35rem;
          border-radius: 4px;
          color: var(--text-muted);
        }

        .log-center-title {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .log-title-text {
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .log-url-snippet {
          color: var(--text-muted);
          font-size: 0.68rem;
          font-family: var(--font-mono);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .log-row-actions {
          flex-shrink: 0;
        }

        .btn-row-download {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 0.22rem 0.5rem;
          border-radius: 5px;
          font-size: 0.7rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-row-download:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.12);
        }

        .btn-row-download.primary {
          background: rgba(56, 189, 248, 0.12);
          border-color: rgba(56, 189, 248, 0.3);
          color: #38bdf8;
        }

        .btn-row-download.primary:hover {
          background: #38bdf8;
          color: #030712;
        }

        .btn-row-download.danger:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
          color: #ef4444;
        }

        .btn-row-download.toggle {
          padding: 0.22rem 0.35rem;
        }

        /* Note card rows */
        .note-card-row {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          border-radius: 8px;
          overflow: hidden;
        }

        .note-row-main {
          padding: 0.6rem 0.8rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .note-row-main:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .note-date-badge {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-shrink: 0;
        }

        .note-date-text {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .note-sessions-tag {
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          font-size: 0.66rem;
          font-weight: 600;
          padding: 0.08rem 0.35rem;
          border-radius: 4px;
        }

        .note-preview-text {
          flex: 1;
          font-size: 0.74rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .note-actions-wrap {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-shrink: 0;
        }

        .note-expanded-body {
          padding: 0.75rem 0.9rem;
          background: #080c12;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .note-full-text {
          margin: 0;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          line-height: 1.6;
          color: #cbd5e1;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .empty-logs {
          padding: 2rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-size: 0.78rem;
        }

        .empty-icon {
          opacity: 0.4;
        }

        @media (max-width: 768px) {
          .activity-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .log-stream-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .note-row-main {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
