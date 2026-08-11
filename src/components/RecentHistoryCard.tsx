'use client';

import React from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { History, ExternalLink, FileText, Globe, BookOpen, Clock } from 'lucide-react';

export const RecentHistoryCard: React.FC = () => {
  const { recentOpenedHistory, logActivity } = useDrishti();

  const handleReopen = (item: { title: string; url: string; category: string; type: 'link' | 'doc_tree' | 'flashcard' }) => {
    logActivity(item.title, item.url, item.category, item.type);
    if (item.url && item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'doc_tree':
        return <FileText size={13} className="type-icon-doc" />;
      case 'flashcard':
        return <BookOpen size={13} className="type-icon-rev" />;
      default:
        return <Globe size={13} className="type-icon-link" />;
    }
  };

  return (
    <div className="bento-card recent-history-container">
      <div className="recent-header">
        <div className="title-group">
          <div className="icon-box">
            <History size={16} />
          </div>
          <div>
            <h3 className="card-title">Recent 10 Opened Destinations</h3>
            <p className="card-sub">Quick jump back to recent docs, links & flashcards</p>
          </div>
        </div>

        <span className="count-badge">{recentOpenedHistory.length} Recorded</span>
      </div>

      <div className="history-list">
        {recentOpenedHistory.length > 0 ? (
          recentOpenedHistory.map((item) => (
            <div
              key={item.id}
              className="history-item-row"
              onClick={() => handleReopen(item)}
            >
              <div className="item-left">
                {getTypeIcon(item.type)}
                <div className="item-text-wrap">
                  <span className="item-title">{item.title}</span>
                  <span className="item-meta">
                    {item.category} • {item.timeStr || 'Recent'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="reopen-btn"
                title="Re-open Destination"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-history">
            <Clock size={24} className="empty-icon" />
            <span>No recent activity yet. Click any link or doc note to begin tracking!</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .recent-history-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          height: 100%;
        }

        .recent-header {
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
          background: rgba(56, 189, 248, 0.15);
          color: var(--accent-primary);
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

        .count-badge {
          font-size: 0.72rem;
          font-family: var(--font-mono);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
          color: var(--accent-primary);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          overflow-y: auto;
          max-height: 340px;
        }

        .history-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0.75rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .history-item-row:hover {
          border-color: var(--accent-primary);
          background: var(--bg-glass-card-hover);
          transform: translateX(2px);
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          overflow: hidden;
        }

        .type-icon-doc {
          color: #60a5fa;
        }

        .type-icon-rev {
          color: #c084fc;
        }

        .type-icon-link {
          color: #34d399;
        }

        .item-text-wrap {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .item-title {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-meta {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .reopen-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.2rem;
        }

        .history-item-row:hover .reopen-btn {
          color: var(--accent-primary);
        }

        .empty-history {
          padding: 2rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.78rem;
        }

        .empty-icon {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};
