'use client';

import React from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { MasterTileId } from '@/types';
import {
  Cpu,
  Code2,
  Server,
  TrendingUp,
  GitBranch,
  Sparkles,
  HeartPulse,
  BadgeDollarSign,
  Briefcase,
  Compass,
  ArrowRight,
  FileText,
  BookOpen,
} from 'lucide-react';

export const DashboardMasterGrid: React.FC = () => {
  const { masterTiles, setActiveTileId, treeNodes, links, revisionCards } = useDrishti();

  const getTileIcon = (id: MasterTileId) => {
    switch (id) {
      case 'ai':
        return <Cpu size={22} className="tile-main-icon" />;
      case 'coding-dsa':
        return <Code2 size={22} className="tile-main-icon" />;
      case 'system-design':
        return <Server size={22} className="tile-main-icon" />;
      case 'market-updates':
        return <TrendingUp size={22} className="tile-main-icon" />;
      case 'open-source':
        return <GitBranch size={22} className="tile-main-icon" />;
      case 'life-sutras':
        return <Sparkles size={22} className="tile-main-icon" />;
      case 'health':
        return <HeartPulse size={22} className="tile-main-icon" />;
      case 'finance':
        return <BadgeDollarSign size={22} className="tile-main-icon" />;
      case 'apply-job':
        return <Briefcase size={22} className="tile-main-icon" />;
      case 'tools':
        return <Compass size={22} className="tile-main-icon" />;
    }
  };

  const getStats = (id: MasterTileId) => {
    if (id === 'tools') {
      return `${links.length} Deep Links`;
    }
    const notesCount = treeNodes.filter((n) => n.masterTileId === id).length;
    const revCount = revisionCards.filter((r) => r.masterTileId === id).length;
    return `${notesCount} Docs • ${revCount} Flashcards`;
  };

  return (
    <section className="master-grid-section">
      <div className="grid-header-banner">
        <div>
          <h2 className="section-main-title">Focus & Learning Hubs</h2>
          <p className="section-main-subtitle">
            Select any hub to explore its multi-level tree notes, Google Docs, flashcards, and tools
          </p>
        </div>
      </div>

      <div className="master-tiles-grid">
        {masterTiles.map((tile) => (
          <div
            key={tile.id}
            className="master-hub-card bento-card"
            onClick={() => setActiveTileId(tile.id)}
            role="button"
            tabIndex={0}
          >
            <div className="hub-top-row">
              <div
                className="hub-icon-box"
                style={{
                  color: tile.colorAccent,
                  borderColor: `${tile.colorAccent}40`,
                  background: `${tile.colorAccent}15`,
                }}
              >
                {getTileIcon(tile.id)}
              </div>

              <span className="hub-stats-badge">{getStats(tile.id)}</span>
            </div>

            <div className="hub-content">
              <h3 className="hub-title">{tile.title}</h3>
              <p className="hub-subtitle">{tile.subtitle}</p>

              {/* Subtracks Preview Pills */}
              <div className="subtracks-pill-row">
                {tile.subTracks.slice(0, 3).map((track, idx) => (
                  <span key={idx} className="track-mini-pill">
                    {track}
                  </span>
                ))}
                {tile.subTracks.length > 3 && (
                  <span className="track-mini-pill more-pill">
                    +{tile.subTracks.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="hub-footer">
              <span className="explore-cta">
                <span>Open Hub & Tree</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .master-grid-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .grid-header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-main-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .section-main-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .master-tiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .master-hub-card {
          padding: 1.3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 230px;
          cursor: pointer;
          border: 1px solid var(--border-card);
          transition: var(--transition-bounce);
        }

        .master-hub-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-4px);
          box-shadow: var(--card-shadow-hover);
        }

        .hub-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hub-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .hub-stats-badge {
          font-size: 0.72rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
        }

        .hub-content {
          margin: 0.6rem 0;
        }

        .hub-title {
          font-size: 1.12rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .hub-subtitle {
          font-size: 0.76rem;
          color: var(--text-secondary);
          line-height: 1.35;
          margin-top: 0.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .subtracks-pill-row {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          margin-top: 0.55rem;
        }

        .track-mini-pill {
          font-size: 0.68rem;
          color: var(--text-muted);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 0.12rem 0.45rem;
          border-radius: 5px;
          white-space: nowrap;
        }

        .more-pill {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .hub-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        .explore-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--accent-primary);
          transition: var(--transition-smooth);
        }

        .master-hub-card:hover .explore-cta {
          transform: translateX(3px);
        }

        @media (max-width: 640px) {
          .master-tiles-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
