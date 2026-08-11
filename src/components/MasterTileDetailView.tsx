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
  ChevronLeft,
  Plus,
  BookOpen,
  FolderTree,
  Brain,
  Compass,
  Sparkles,
  ArrowLeft,
  Layers,
} from 'lucide-react';

export const MasterTileDetailView: React.FC = () => {
  const {
    masterTiles,
    activeTileId,
    setActiveTileId,
    activeSubTrack,
    setActiveSubTrack,
  } = useDrishti();

  const currentTile = masterTiles.find((t) => t.id === activeTileId);
  if (!currentTile) return null;

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

        {/* Subtrack Switcher Pills */}
        {currentTile.subTracks.length > 0 && activeTileId !== 'tools' && (
          <div className="subtracks-bar">
            {currentTile.subTracks.map((track) => (
              <button
                key={track}
                onClick={() => setActiveSubTrack(track)}
                className={`filter-pill ${activeSubTrack === track ? 'active' : ''}`}
              >
                <Layers size={13} />
                <span>{track}</span>
              </button>
            ))}

            <button
              onClick={() => {
                const name = prompt(`Enter new sub-track for ${currentTile.title}:`);
                if (name && name.trim()) {
                  currentTile.subTracks.push(name.trim());
                  setActiveSubTrack(name.trim());
                }
              }}
              className="filter-pill add-track-pill"
            >
              <Plus size={13} />
              <span>New Sub-Track</span>
            </button>
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
