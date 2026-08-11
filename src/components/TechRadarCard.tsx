'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { Radio, ExternalLink, RefreshCw, Zap, TrendingUp, Sparkles } from 'lucide-react';

export const TechRadarCard: React.FC = () => {
  const { newsItems } = useDrishti();
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sources = ['All', 'ArXiv AI', 'Hacker News', 'Engineering Blog', 'Market Pulse'];

  const filteredNews = newsItems.filter((item) =>
    activeSourceFilter === 'All' ? true : item.source === activeSourceFilter
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case 'ArXiv AI':
        return 'src-arxiv';
      case 'Hacker News':
        return 'src-hn';
      case 'Engineering Blog':
        return 'src-eng';
      case 'Market Pulse':
        return 'src-market';
      default:
        return 'src-default';
    }
  };

  return (
    <div className="bento-card tech-radar-container">
      {/* Header */}
      <div className="radar-header">
        <div className="radar-title-group">
          <div className="radar-icon-box">
            <Radio size={17} className="radar-icon" />
          </div>
          <div>
            <div className="title-pulse-row">
              <h3 className="radar-title">Tech & AI Market Radar</h3>
              <span className="pulse-dot" title="Live RSS Stream" />
            </div>
            <p className="radar-subtitle">Ad-free curated engineering pulse & papers</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className={`btn-icon refresh-btn ${isRefreshing ? 'spinning' : ''}`}
          title="Refresh RSS Pulse"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="radar-filters">
        {sources.map((src) => (
          <button
            key={src}
            onClick={() => setActiveSourceFilter(src)}
            className={`filter-pill mini-pill ${activeSourceFilter === src ? 'active' : ''}`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Headlines List */}
      <div className="radar-list">
        {filteredNews.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="radar-item-row"
          >
            <div className="item-meta-row">
              <span className={`source-badge ${getSourceBadgeClass(item.source)}`}>
                {item.source}
              </span>
              <span className="tag-text">#{item.tag}</span>
              <span className="time-text">{item.timestamp}</span>
            </div>

            <h4 className="item-title">{item.title}</h4>
            <p className="item-summary">{item.summary}</p>

            <div className="item-footer">
              <span className="read-time">{item.readTime}</span>
              <span className="open-link-cta">
                <span>Read Direct</span>
                <ExternalLink size={12} />
              </span>
            </div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .tech-radar-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          height: 100%;
        }

        .radar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .radar-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .radar-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(56, 189, 248, 0.15);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .title-pulse-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .radar-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .radar-subtitle {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .spinning {
          animation: spinOnce 0.8s linear infinite;
        }

        @keyframes spinOnce {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .radar-filters {
          display: flex;
          gap: 0.35rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .mini-pill {
          font-size: 0.72rem;
          padding: 0.2rem 0.6rem;
          white-space: nowrap;
        }

        .radar-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          overflow-y: auto;
          max-height: 360px;
          padding-right: 0.2rem;
        }

        .radar-item-row {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.8rem;
          border-radius: 10px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          transition: var(--transition-smooth);
        }

        .radar-item-row:hover {
          border-color: var(--accent-primary);
          background: var(--bg-glass-card-hover);
          transform: translateX(3px);
        }

        .item-meta-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.68rem;
        }

        .source-badge {
          font-weight: 700;
          padding: 0.12rem 0.45rem;
          border-radius: 4px;
          font-size: 0.65rem;
          text-transform: uppercase;
        }

        .src-arxiv {
          background: rgba(168, 85, 247, 0.2);
          color: #c084fc;
        }

        .src-hn {
          background: rgba(249, 115, 22, 0.2);
          color: #fb923c;
        }

        .src-eng {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .src-market {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .tag-text {
          color: var(--text-muted);
        }

        .time-text {
          color: var(--text-muted);
          margin-left: auto;
        }

        .item-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .item-summary {
          font-size: 0.76rem;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.35rem;
          border-top: 1px solid var(--border-subtle);
          margin-top: 0.15rem;
        }

        .read-time {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .open-link-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          color: var(--accent-primary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
