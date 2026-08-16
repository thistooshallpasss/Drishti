'use client';

import React, { useState, useEffect } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import {
  Search,
  ExternalLink,
  Plus,
  Compass,
  Mic,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    links,
    masterTiles,
    setActiveTileId,
    setIsAddLinkModalOpen,
    recordLinkClick,
  } = useDrishti();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) setQuery('');
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const handleClose = () => {
    setIsCommandPaletteOpen(false);
  };

  const filteredLinks = links.filter(
    (l) =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.url.toLowerCase().includes(query.toLowerCase()) ||
      l.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      l.description?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredHubs = masterTiles.filter(
    (h) =>
      h.title.toLowerCase().includes(query.toLowerCase()) ||
      h.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="palette-box bento-card" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="palette-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Type a command, search links, docs, or jump to any hub..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="palette-input"
            autoFocus
          />
          <span className="esc-hint" onClick={handleClose}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="palette-results-list">
          {/* Quick Actions */}
          <div className="section-group">
            <span className="section-label">COMMAND ACTIONS</span>
            <div
              className="palette-item"
              onClick={() => {
                handleClose();
                setIsAddLinkModalOpen(true);
              }}
            >
              <Plus size={15} className="item-icon-cyan" />
              <span>Add New Link / Google Doc</span>
              <span className="item-badge">Action</span>
            </div>

            <div
              className="palette-item"
              onClick={() => {
                handleClose();
                setActiveTileId(null);
                setTimeout(() => {
                  const el = document.getElementById('daily-voice-journal-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
            >
              <Mic size={15} className="item-icon-purple" />
              <span>Open Daily Voice Journal & Dictation</span>
              <span className="item-badge">Voice</span>
            </div>
          </div>

          {/* Matching Master Hubs */}
          {filteredHubs.length > 0 && (
            <div className="section-group">
              <span className="section-label">FOCUS & LEARNING HUBS</span>
              {filteredHubs.slice(0, 4).map((hub) => (
                <div
                  key={hub.id}
                  className="palette-item"
                  onClick={() => {
                    setActiveTileId(hub.id);
                    handleClose();
                  }}
                >
                  <FolderKanban size={15} style={{ color: hub.colorAccent }} />
                  <div className="item-text-group">
                    <span className="item-title">{hub.title}</span>
                    <span className="item-sub">{hub.subtitle}</span>
                  </div>
                  <ArrowRight size={13} className="ext-icon" />
                </div>
              ))}
            </div>
          )}

          {/* Matching Links & Documents */}
          {filteredLinks.length > 0 && (
            <div className="section-group">
              <span className="section-label">DIRECT DEEP LINKS & DOCS</span>
              {filteredLinks.slice(0, 8).map((link) => (
                <div
                  key={link.id}
                  className="palette-item"
                  onClick={() => {
                    recordLinkClick(link.id);
                    window.open(link.url, '_blank', 'noopener,noreferrer');
                    handleClose();
                  }}
                >
                  <Compass size={15} className="item-icon-blue" />
                  <div className="item-text-group">
                    <span className="item-title">{link.title}</span>
                    <span className="item-sub">{link.url}</span>
                  </div>
                  <ExternalLink size={13} className="ext-icon" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .palette-box {
          background: var(--bg-surface);
          border: 1px solid var(--border-card);
          border-radius: 18px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85);
          width: 100%;
          max-width: 620px;
          overflow: hidden;
          animation: popPalette 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popPalette {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .palette-input-wrap {
          display: flex;
          align-items: center;
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          gap: 0.75rem;
        }

        .search-icon {
          color: var(--accent-primary);
        }

        .palette-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: var(--font-sans);
        }

        .esc-hint {
          font-size: 0.72rem;
          font-family: var(--font-mono);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.15rem 0.45rem;
          border-radius: 5px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .palette-results-list {
          padding: 0.85rem;
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .section-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .section-label {
          font-size: 0.68rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--text-muted);
          padding: 0.2rem 0.5rem;
          letter-spacing: 0.05em;
        }

        .palette-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .palette-item:hover {
          background: var(--bg-surface-elevated);
          color: var(--accent-primary);
        }

        .item-icon-cyan {
          color: var(--accent-primary);
        }

        .item-icon-purple {
          color: #c084fc;
        }

        .item-icon-blue {
          color: #60a5fa;
        }

        .item-badge {
          margin-left: auto;
          font-size: 0.68rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          color: var(--text-muted);
        }

        .item-text-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .item-title {
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ext-icon {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
