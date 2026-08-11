'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { CourseDocTree } from './CourseDocTree';
import { ToolsTileDeck } from './ToolsTileDeck';
import { RevisionFlashcardDeck } from './RevisionFlashcardDeck';
import { TechRadarCard } from './TechRadarCard';
import { ScratchpadCard } from './ScratchpadCard';
import { WisdomFocusCard } from './WisdomFocusCard';
import {
  Plus,
  ArrowLeft,
  Layers,
  X,
  Check,
  FolderPlus,
} from 'lucide-react';

export const MasterTileDetailView: React.FC = () => {
  const {
    masterTiles,
    activeTileId,
    setActiveTileId,
    activeSubTrack,
    setActiveSubTrack,
    getSubTracksForTile,
    addCustomSubTrack,
    deleteCustomSubTrack,
  } = useDrishti();

  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');

  const currentTile = masterTiles.find((t) => t.id === activeTileId);
  if (!currentTile) return null;

  const currentSubTracks = getSubTracksForTile(currentTile.id);

  const handleCreateSubTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrackName.trim()) {
      addCustomSubTrack(currentTile.id, newTrackName.trim());
      setNewTrackName('');
      setIsAddingTrack(false);
    }
  };

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

        {activeTileId !== 'tools' && activeTileId !== 'market-updates' && (
          <>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-subtrack">{activeSubTrack}</span>
          </>
        )}
      </div>

      {/* Hub Hero Banner */}
      <div className="hub-hero-banner bento-card">
        <div className="hero-content">
          <h2 className="hero-title">{currentTile.title}</h2>
          <p className="hero-subtitle">{currentTile.subtitle}</p>
        </div>

        {/* Dynamic Subtrack Switcher Pills */}
        {activeTileId !== 'tools' && (
          <div className="subtracks-bar">
            {currentSubTracks.map((track) => {
              const isActive = activeSubTrack === track;
              const isDefaultTrack = currentTile.subTracks.includes(track);

              return (
                <div key={track} className="track-pill-wrapper">
                  <button
                    onClick={() => setActiveSubTrack(track)}
                    className={`filter-pill track-pill ${isActive ? 'active' : ''}`}
                  >
                    <Layers size={13} />
                    <span>{track}</span>
                  </button>

                  {!isDefaultTrack && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete custom sub-track "${track}" and its notes?`)) {
                          deleteCustomSubTrack(currentTile.id, track);
                        }
                      }}
                      className="track-delete-btn"
                      title={`Delete sub-track ${track}`}
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              );
            })}

            {isAddingTrack ? (
              <form onSubmit={handleCreateSubTrack} className="inline-add-track-form">
                <input
                  type="text"
                  placeholder="Sub-track name (e.g. Bangalore)..."
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  autoFocus
                  className="add-track-input"
                />
                <button type="submit" className="add-track-submit-btn" title="Add Track">
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTrack(false);
                    setNewTrackName('');
                  }}
                  className="add-track-cancel-btn"
                  title="Cancel"
                >
                  <X size={13} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingTrack(true)}
                className="filter-pill add-track-pill"
                title="Create a new custom tab / sub-track"
              >
                <Plus size={13} />
                <span>New Sub-Track</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conditional Hub Content */}
      {activeTileId === 'tools' ? (
        /* Tools Deep Link Deck */
        <div className="hub-body-section">
          <ToolsTileDeck />
        </div>
      ) : activeTileId === 'market-updates' ? (
        /* Market Updates & Pulse */
        <div className="hub-grid-2col">
          <TechRadarCard />
          <ScratchpadCard />
        </div>
      ) : activeTileId === 'life-sutras' ? (
        /* Life Sutras with Wisdom Card & Tree */
        <div className="hub-body-stack">
          <WisdomFocusCard />
          <CourseDocTree />
          <RevisionFlashcardDeck />
        </div>
      ) : (
        /* Standard Learning Hubs (AI, Coding DSA, System Design, Health, Finance, Apply Job, Open Source) */
        <div className="hub-body-stack">
          {/* 1. Hierarchical Tree & Below-Tree Box Grid */}
          <CourseDocTree />

          {/* 2. Active Recall Flashcards & Quick Notes */}
          <div className="hub-grid-2col">
            <RevisionFlashcardDeck />
            <ScratchpadCard />
          </div>
        </div>
      )}

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

        .breadcrumb-subtrack {
          color: var(--accent-primary);
          font-weight: 600;
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

        .subtracks-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-top: 0.4rem;
        }

        .track-pill-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .track-pill {
          padding-right: 0.85rem;
        }

        .track-delete-btn {
          margin-left: -0.4rem;
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: #f43f5e;
          border-radius: 999px;
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .track-delete-btn:hover {
          background: #f43f5e;
          color: #fff;
        }

        .inline-add-track-form {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--accent-primary);
          padding: 0.2rem 0.4rem;
          border-radius: 999px;
        }

        .add-track-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 0.78rem;
          padding: 0.2rem 0.4rem;
          min-width: 160px;
        }

        .add-track-submit-btn {
          background: var(--accent-primary);
          color: #030712;
          border: none;
          border-radius: 999px;
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 700;
        }

        .add-track-cancel-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .add-track-cancel-btn:hover {
          color: #f43f5e;
        }

        .add-track-pill {
          border-style: dashed;
        }

        .hub-body-stack {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .hub-grid-2col {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 1.5rem;
          align-items: stretch;
        }

        @media (max-width: 1000px) {
          .hub-grid-2col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
