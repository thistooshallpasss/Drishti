'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { LinkFlashcard } from './LinkFlashcard';
import {
  ArrowLeft,
  Plus,
  Search,
  SearchX,
  FileText,
} from 'lucide-react';

export const MasterTileDetailView: React.FC = () => {
  const {
    masterTiles,
    activeTileId,
    setActiveTileId,
    links,
    setIsAddLinkModalOpen,
  } = useDrishti();

  const [tileSearch, setTileSearch] = useState('');

  const currentTile = masterTiles.find((t) => t.id === activeTileId);
  if (!currentTile) return null;

  // Filter links belonging to this tile — strictly by masterTileId
  const tileLinks = links.filter((l) => {
    const matchesTile = l.masterTileId === currentTile.id;

    if (!matchesTile) return false;

    if (tileSearch.trim()) {
      const q = tileSearch.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchUrl = l.url.toLowerCase().includes(q);
      const matchDesc = l.description?.toLowerCase().includes(q);
      return matchTitle || matchUrl || matchDesc;
    }

    return true;
  });


  return (
    <div className="tile-detail-container">
      {/* Breadcrumb Navigation Bar */}
      <div className="breadcrumb-nav-bar">
        <button
          onClick={() => setActiveTileId(null)}
          className="back-to-dashboard-btn"
          id="back-to-dashboard-btn"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>

        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current-tile">{currentTile.title}</span>
      </div>

      {/* Hub Hero Banner */}
      <div className="hub-hero-banner bento-card">
        <div className="hero-top-row">
          <div className="hero-content">
            <h2 className="hero-title">{currentTile.title}</h2>
            <p className="hero-subtitle">{currentTile.subtitle}</p>
          </div>

          <button
            onClick={() => {
              setIsAddLinkModalOpen(true);
            }}
            className="btn-primary add-doc-btn"
          >
            <Plus size={15} />
            <span>Add Link / Document</span>
          </button>
        </div>

        {/* Local Search inside this Hub */}
        <div className="hub-search-bar">
          <Search size={15} className="hub-search-icon" />
          <input
            type="text"
            placeholder={`Search ${currentTile.title}...`}
            value={tileSearch}
            onChange={(e) => setTileSearch(e.target.value)}
            className="hub-search-input"
          />
          {tileSearch && (
            <button onClick={() => setTileSearch('')} className="clear-search-btn">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Hub Direct Links & Notes Grid */}
      <div className="hub-resources-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <FileText size={16} color={currentTile.colorAccent} />
            <h3 className="section-title">Documents, Notes & Direct Launchers</h3>
          </div>
          <span className="resource-count-badge">
            {tileLinks.length} {tileLinks.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {tileLinks.length > 0 ? (
          <div className="resources-grid">
            {tileLinks.map((link, idx) => (
              <LinkFlashcard key={link.id} link={link} index={idx} />
            ))}

            {/* "+ New Item" Quick Tile */}
            <div
              className="add-card-placeholder bento-card"
              onClick={() => {
                setIsAddLinkModalOpen(true);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="plus-circle-aura">
                <Plus size={22} />
              </div>
              <span className="add-text">Add New Note / Link</span>
              <span className="add-subtext">Direct destination URL or Google Doc</span>
            </div>
          </div>
        ) : (
          <div className="empty-hub-state bento-card">
            <SearchX size={36} className="empty-icon" />
            <h3 className="empty-title">
              {tileSearch ? 'No items match your search' : 'No documents or links added yet'}
            </h3>
            <p className="empty-desc">
              {tileSearch
                ? `No resources found matching "${tileSearch}".`
                : `Add your Google Docs, GitHub repos, or direct destination links to ${currentTile.title}.`}
            </p>
            <button
              onClick={() => {
                setIsAddLinkModalOpen(true);
              }}
              className="btn-primary empty-add-btn"
            >
              <Plus size={15} />
              <span>Add First Document / Link</span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .tile-detail-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .breadcrumb-nav-bar {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
        }

        .back-to-dashboard-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-secondary);
          padding: 0.35rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.82rem;
          transition: var(--transition-smooth);
        }

        .back-to-dashboard-btn:hover {
          background: var(--accent-primary);
          color: #030712;
          border-color: var(--accent-primary);
        }

        .breadcrumb-sep {
          color: var(--text-muted);
        }

        .breadcrumb-current-tile {
          font-weight: 700;
          color: var(--text-primary);
        }

        .hub-hero-banner {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          background: linear-gradient(
            135deg,
            var(--bg-glass-card) 0%,
            var(--bg-surface-elevated) 100%
          );
          border: 1px solid var(--border-card);
        }

        .hero-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .hero-title {
          font-size: 1.55rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 0.86rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .add-doc-btn {
          padding: 0.5rem 1rem;
          font-size: 0.82rem;
        }

        .hub-search-bar {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.45rem 0.8rem;
          max-width: 460px;
        }

        .hub-search-icon {
          color: var(--text-muted);
        }

        .hub-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 0.82rem;
          width: 100%;
        }

        .clear-search-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.8rem;
        }

        .hub-resources-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .resource-count-badge {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-family: var(--font-mono);
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .add-card-placeholder {
          height: 190px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed var(--border-card);
          cursor: pointer;
          background: transparent;
          gap: 0.45rem;
          transition: var(--transition-smooth);
        }

        .add-card-placeholder:hover {
          border-color: var(--accent-primary);
          background: var(--bg-glass-card-hover);
          transform: translateY(-3px);
        }

        .plus-circle-aura {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          transition: var(--transition-bounce);
        }

        .add-card-placeholder:hover .plus-circle-aura {
          background: var(--accent-primary);
          color: #030712;
          transform: scale(1.1) rotate(90deg);
        }

        .add-text {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .add-subtext {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-align: center;
          padding: 0 1rem;
        }

        .empty-hub-state {
          padding: 3rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .empty-icon {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .empty-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .empty-desc {
          font-size: 0.84rem;
          color: var(--text-secondary);
          max-width: 440px;
        }

        .empty-add-btn {
          margin-top: 0.5rem;
        }

        @media (max-width: 640px) {
          .resources-grid {
            grid-template-columns: 1fr;
          }
          .hero-top-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .hub-search-bar {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
