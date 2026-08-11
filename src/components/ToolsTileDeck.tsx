'use client';

import React from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { LinkFlashcard } from './LinkFlashcard';
import { LinkCategory } from '@/types';
import {
  Compass,
  Plus,
  Pin,
  Sparkles,
  Layers,
  SearchX,
  Share2,
  Cpu,
  FolderKanban,
  Headphones,
} from 'lucide-react';

const CATEGORIES: { id: LinkCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Tools', icon: <Layers size={14} /> },
  { id: 'ai', label: 'AI Powerhouse', icon: <Cpu size={14} /> },
  { id: 'productivity', label: 'Productivity & Docs', icon: <FolderKanban size={14} /> },
  { id: 'social', label: 'Social & Comms', icon: <Share2 size={14} /> },
  { id: 'spiritual', label: 'Spiritual Wisdom', icon: <Sparkles size={14} /> },
  { id: 'media', label: 'Media & Audio', icon: <Headphones size={14} /> },
];

export const ToolsTileDeck: React.FC = () => {
  const {
    links,
    filteredLinks,
    activeLinkCategory,
    setActiveLinkCategory,
    searchQuery,
    setIsAddLinkModalOpen,
    setDefaultModalCategory,
  } = useDrishti();

  const pinnedCount = links.filter((l) => l.isPinned).length;

  return (
    <section className="tools-deck-section">
      {/* Category Filter Bar */}
      <div className="tools-header-row">
        <div className="filter-chips-row">
          {CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? links.length
                : links.filter((l) => l.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveLinkCategory(cat.id)}
                className={`filter-pill ${activeLinkCategory === cat.id ? 'active' : ''}`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className="category-count-badge">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setDefaultModalCategory(activeLinkCategory === 'all' ? 'ai' : activeLinkCategory);
            setIsAddLinkModalOpen(true);
          }}
          className="btn-primary add-link-deck-btn"
        >
          <Plus size={14} />
          <span>Add Tool / Link</span>
        </button>
      </div>

      {/* Grid of Link Cards */}
      {filteredLinks.length > 0 ? (
        <div className="flashcards-grid">
          {filteredLinks.map((link, idx) => (
            <LinkFlashcard key={link.id} link={link} index={idx} />
          ))}

          {/* "+ New Card" Quick Tile */}
          <div
            className="add-card-placeholder bento-card"
            onClick={() => {
              setDefaultModalCategory(activeLinkCategory === 'all' ? 'ai' : activeLinkCategory);
              setIsAddLinkModalOpen(true);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="plus-circle-aura">
              <Plus size={22} />
            </div>
            <span className="add-text">Add Deep Link</span>
            <span className="add-subtext">Direct destination URL</span>
          </div>
        </div>
      ) : (
        <div className="empty-search-state bento-card">
          <SearchX size={36} className="empty-icon" />
          <h3 className="empty-title">No Links Match Your Filter</h3>
          <p className="empty-desc">
            {searchQuery
              ? `No links found matching "${searchQuery}". Try a different keyword.`
              : 'No links available in this category yet.'}
          </p>
          <button
            onClick={() => setIsAddLinkModalOpen(true)}
            className="btn-primary empty-add-btn"
          >
            <Plus size={15} />
            <span>Create New Link</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .tools-deck-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .tools-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .filter-chips-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-count-badge {
          background: rgba(0, 0, 0, 0.25);
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          margin-left: 0.2rem;
        }

        .filter-pill.active .category-count-badge {
          background: rgba(0, 0, 0, 0.4);
          color: #ffffff;
        }

        .flashcards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.15rem;
        }

        .add-card-placeholder {
          height: 205px;
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
        }

        .empty-search-state {
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
          max-width: 420px;
        }

        .empty-add-btn {
          margin-top: 0.5rem;
        }

        @media (max-width: 640px) {
          .flashcards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
