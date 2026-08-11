'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { Activity, Download, Calendar, BarChart3, Clock, CheckCircle } from 'lucide-react';

export const ActivityLogCard: React.FC = () => {
  const { activityLogs, exportLogs } = useDrishti();
  const [activeTimeframe, setActiveTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();

  const filteredLogs = activityLogs.filter((log) => {
    if (activeTimeframe === 'daily') return log.dateStr === todayStr;

    const logDate = new Date(log.timestamp);
    const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    if (activeTimeframe === 'weekly') return diffDays <= 7;
    if (activeTimeframe === 'monthly') return diffDays <= 30;
    return true;
  });

  const handleExport = (tf: 'daily' | 'weekly' | 'monthly') => {
    exportLogs(tf);
    setExportedNotice(`Exported ${tf} activity log!`);
    setTimeout(() => setExportedNotice(null), 3000);
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
            <h3 className="card-title">Study & Click Activity Tracker</h3>
            <p className="card-sub">Automatic daily, weekly & monthly session tracking</p>
          </div>
        </div>

        {/* Timeframe selector tabs */}
        <div className="timeframe-pills">
          {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`filter-pill mini-tf-pill ${activeTimeframe === tf ? 'active' : ''}`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Export Toolbar */}
      <div className="export-toolbar-row">
        <div className="log-count-info">
          <Clock size={13} />
          <span>
            <strong>{filteredLogs.length}</strong> actions recorded ({activeTimeframe})
          </span>
        </div>

        <button
          onClick={() => handleExport(activeTimeframe)}
          className="btn-primary mini-export-btn"
          title={`Download ${activeTimeframe} CSV log`}
        >
          <Download size={13} />
          <span>Export {activeTimeframe.toUpperCase()} CSV</span>
        </button>
      </div>

      {exportedNotice && (
        <div className="export-success-banner">
          <CheckCircle size={13} color="#10b981" />
          <span>{exportedNotice}</span>
        </div>
      )}

      {/* Recent Logs Snippet List */}
      <div className="logs-stream-list">
        {filteredLogs.slice(0, 8).map((log) => (
          <div key={log.id} className="log-stream-row">
            <div className="log-badge-time">
              <span className={`log-type-tag type-${log.type}`}>{log.type.replace('_', ' ')}</span>
              <span className="log-time">{log.timeStr || log.dateStr}</span>
            </div>
            <span className="log-title-text">{log.title}</span>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="empty-logs">
            <Calendar size={20} className="empty-icon" />
            <span>No activity recorded for this timeframe yet.</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .activity-log-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          height: 100%;
        }

        .activity-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
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

        .timeframe-pills {
          display: flex;
          gap: 0.3rem;
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
        }

        .log-count-info {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.76rem;
          color: var(--text-secondary);
        }

        .mini-export-btn {
          padding: 0.3rem 0.7rem;
          font-size: 0.74rem;
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
        }

        .logs-stream-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          overflow-y: auto;
          max-height: 240px;
        }

        .log-stream-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.65rem;
          background: var(--bg-surface-elevated);
          border-radius: 6px;
          font-size: 0.78rem;
          gap: 0.5rem;
        }

        .log-badge-time {
          display: flex;
          align-items: center;
          gap: 0.45rem;
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

        .log-title-text {
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
          font-size: 0.78rem;
        }

        .empty-logs {
          padding: 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-size: 0.76rem;
        }

        .empty-icon {
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
};
