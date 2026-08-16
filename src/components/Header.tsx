'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { ThemeMode } from '@/types';
import {
  Search,
  Sliders,
  Palette,
  Check,
  Cloud,
  CloudOff,
  Mic,
} from 'lucide-react';

const THEMES: { id: ThemeMode; name: string; iconColor: string; bgPreview: string }[] = [
  { id: 'obsidian', name: 'Obsidian OLED', iconColor: '#38bdf8', bgPreview: '#08090d' },
  { id: 'midnight', name: 'Midnight Navy', iconColor: '#60a5fa', bgPreview: '#030712' },
  { id: 'cyber', name: 'Cyber Matrix', iconColor: '#10b981', bgPreview: '#030a06' },
  { id: 'sunset', name: 'Sunset Warmth', iconColor: '#f97316', bgPreview: '#120907' },
  { id: 'paper', name: 'Paper Light', iconColor: '#0284c7', bgPreview: '#f8fafc' },
];

import { getSupabaseConfigStatus } from '@/lib/supabaseClient';

export const Header: React.FC = () => {
  const {
    isCloudConnected,
    syncError,
    setSyncError,
    setActiveTileId,
    searchQuery,
    setSearchQuery,
    settings,
    setTheme,
    setUiScale,
    setIsCommandPaletteOpen,
  } = useDrishti();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isCloudInfoOpen, setIsCloudInfoOpen] = useState(false);

  return (
    <>
    <header className="header-container">
      <div className="header-content">
        {/* Brand & Identity (Clicking logo returns to Master Dashboard) */}
        <div className="brand-section">
          <div
            className="brand-logo-wrap"
            onClick={() => setActiveTileId(null)}
            style={{ cursor: 'pointer' }}
            title="Return to Master Dashboard"
          >
            <div className="brand-icon">
              <span className="eye-symbol">👁️</span>
            </div>
            <div>
              <div className="brand-title-row">
                <h1 className="brand-title">Drishti</h1>
                <span className="brand-sanskrit">दृष्टि</span>
              </div>
              <p className="brand-subtitle">Distraction-Free Command Center & Learning Deck</p>
            </div>
          </div>
        </div>

        {/* Global Search & Command Bar */}
        <div className="search-section">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search across all 10 tiles, notes, docs, and links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="cmd-k-badge"
              title="Open Command Palette"
            >
              ⌘K
            </button>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="controls-section">
          {/* Cloud Sync Status Indicator */}
          <div className="relative-dropdown">
            <button
              onClick={() => setIsCloudInfoOpen(!isCloudInfoOpen)}
              className="cloud-status-badge"
              title="Click to view Cloud Sync Diagnostics"
            >
              {isCloudConnected ? (
                <>
                  <Cloud size={14} className="cloud-icon-connected" />
                  <span className="cloud-text-connected">Cloud Sync</span>
                </>
              ) : (
                <>
                  <CloudOff size={14} className="cloud-icon-local" />
                  <span className="cloud-text-local">Local Mode</span>
                </>
              )}
            </button>

            {isCloudInfoOpen && (
              <div className="dropdown-menu cloud-diagnostic-menu">
                <div className="dropdown-header">
                  <Cloud size={14} />
                  <span>Sync Diagnostics</span>
                </div>
                <div className="diag-item">
                  <span className="diag-label">Status:</span>
                  <span className={`diag-val ${isCloudConnected ? 'green' : 'amber'}`}>
                    {isCloudConnected ? '🟢 Live Sync Active (SUBSCRIBED)' : '🔴 Local Mode — no Supabase realtime'}
                  </span>
                </div>
                <div className="diag-item">
                  <span className="diag-label">NEXT_PUBLIC_SUPABASE_URL:</span>
                  <code className="diag-code">
                    {getSupabaseConfigStatus().hasUrl ? getSupabaseConfigStatus().urlDisplay : '❌ NOT_SET in Vercel'}
                  </code>
                </div>
                <div className="diag-item">
                  <span className="diag-label">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <code className="diag-code">
                    {getSupabaseConfigStatus().hasAnonKey ? `✓ Set (${getSupabaseConfigStatus().anonKeyLength} chars)` : '❌ NOT_SET in Vercel'}
                  </code>
                </div>

                {!isCloudConnected && (
                  <div className="diag-help-box">
                    <p className="diag-help-text">
                      To activate Cloud Sync on Vercel:
                    </p>
                    <ol className="diag-help-list">
                      <li>Go to Vercel Project ➡️ Settings ➡️ Environment Variables.</li>
                      <li>Ensure <strong>Production</strong> is checked.</li>
                      <li>Trigger a <strong>Redeploy</strong> without build cache.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Switcher Dropdown */}
          <div className="relative-dropdown">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="btn-icon theme-btn"
              title="Change Visual Theme"
            >
              <Palette size={18} />
            </button>

            {isThemeMenuOpen && (
              <div className="dropdown-menu theme-menu">
                <div className="dropdown-header">
                  <Palette size={14} />
                  <span>Choose Visual Aura</span>
                </div>
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setTheme(th.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`theme-option ${settings.theme === th.id ? 'active' : ''}`}
                  >
                    <span
                      className="color-dot"
                      style={{ backgroundColor: th.iconColor, borderColor: th.bgPreview }}
                    />
                    <span className="theme-name">{th.name}</span>
                    {settings.theme === th.id && <Check size={14} className="active-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* UI Scale / Font Size Controls */}
          <div className="scale-control-wrap" title="Scale UI & Font Size">
            <Sliders size={15} className="scale-icon" />
            <input
              type="range"
              min="85"
              max="120"
              step="5"
              value={settings.uiScale}
              onChange={(e) => setUiScale(Number(e.target.value))}
              className="scale-slider"
              title={`UI Scale: ${settings.uiScale}%`}
            />
            <span className="scale-badge">{settings.uiScale}%</span>
          </div>

          {/* Quick Voice Journal & Dictation Trigger */}
          <button
            onClick={() => {
              setActiveTileId(null);
              setTimeout(() => {
                const section = document.getElementById('daily-voice-journal-section');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
              }, 50);
            }}
            className="btn-icon voice-btn"
            title="Daily Voice Journal & Audio Dictation"
          >
            <Mic size={17} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .header-container {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0.85rem 1.75rem;
          transition: var(--transition-smooth);
        }

        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--bg-surface-elevated), var(--bg-glass-card));
          border: 1px solid var(--border-card);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          position: relative;
        }

        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .brand-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-sanskrit {
          font-size: 0.95rem;
          color: var(--accent-secondary);
          font-weight: 500;
          opacity: 0.85;
        }

        .brand-subtitle {
          font-size: 0.74rem;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .search-section {
          flex: 1;
          max-width: 480px;
          min-width: 240px;
        }

        .search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.62rem 3.2rem 0.62rem 2.4rem;
          background: var(--bg-input);
          border: 1px solid var(--border-card);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 0.86rem;
          outline: none;
          transition: var(--transition-smooth);
        }

        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.18);
          background: var(--bg-surface);
        }

        .cmd-k-badge {
          position: absolute;
          right: 8px;
          padding: 0.2rem 0.45rem;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .controls-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .relative-dropdown {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          background: var(--bg-surface);
          border: 1px solid var(--border-card);
          border-radius: 14px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
          padding: 0.5rem;
          min-width: 210px;
          z-index: 60;
          animation: menuSlide 0.2s ease-out;
        }

        @keyframes menuSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.35rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .theme-option,
        .settings-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.55rem 0.75rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.84rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: left;
        }

        .theme-option:hover,
        .settings-option:hover {
          background: var(--bg-surface-elevated);
          color: var(--accent-primary);
        }

        .voice-btn:hover {
          color: #c084fc !important;
          border-color: rgba(168, 85, 247, 0.4) !important;
          background: rgba(168, 85, 247, 0.12) !important;
        }

        .theme-option.active {
          background: var(--bg-surface-elevated);
          color: var(--accent-primary);
          font-weight: 600;
        }

        .color-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid;
        }

        .theme-name {
          flex: 1;
        }

        .active-check {
          color: var(--accent-primary);
        }

        .reset-option {
          color: #ef4444;
        }

        .reset-option:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .cloud-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.65rem;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 600;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cloud-status-badge:hover {
          border-color: var(--accent-primary);
        }

        .cloud-icon-connected {
          color: #10b981;
          animation: pulseGlow 2s infinite;
        }

        .cloud-text-connected {
          color: #10b981;
        }

        .cloud-icon-local {
          color: #f59e0b;
        }

        .cloud-text-local {
          color: var(--text-muted);
        }

        .cloud-diagnostic-menu {
          min-width: 320px;
          padding: 0.85rem;
        }

        .diag-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin-bottom: 0.65rem;
          font-size: 0.75rem;
        }

        .diag-label {
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .diag-val.green {
          color: #10b981;
          font-weight: 600;
        }

        .diag-val.amber {
          color: #f59e0b;
          font-weight: 600;
        }

        .diag-code {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-primary);
          word-break: break-all;
        }

        .diag-help-box {
          margin-top: 0.75rem;
          padding: 0.65rem;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 8px;
          font-size: 0.72rem;
        }

        .diag-help-text {
          font-weight: 600;
          color: #f59e0b;
          margin-bottom: 0.3rem;
        }

        .diag-help-list {
          padding-left: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .scale-control-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          border-radius: 10px;
          padding: 0.35rem 0.65rem;
        }

        .scale-icon {
          color: var(--text-muted);
        }

        .scale-slider {
          width: 70px;
          accent-color: var(--accent-primary);
          cursor: pointer;
        }

        .scale-badge {
          font-size: 0.74rem;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          min-width: 35px;
          text-align: right;
        }

        @media (max-width: 960px) {
          .search-section {
            order: 3;
            max-width: 100%;
            width: 100%;
          }
          .header-content {
            gap: 0.75rem;
          }
        }

        @media (max-width: 600px) {
          .brand-subtitle { display: none; }
          .brand-sanskrit { display: none; }
          .search-section { display: none; }
          .header-content { padding: 0.65rem 0.9rem; gap: 0.5rem; }
          .cloud-status-badge .cloud-text-connected,
          .cloud-status-badge .cloud-text-local { display: none; }
        }
      `}</style>
    </header>
    {syncError && (
      <div className="sync-error-banner">
        <span>⚠️ {syncError}</span>
        <button onClick={() => setSyncError(null)} className="sync-error-dismiss" title="Dismiss">✕</button>
        <style jsx>{`
          .sync-error-banner {
            position: fixed;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(245, 158, 11, 0.15);
            border: 1px solid rgba(245, 158, 11, 0.4);
            color: #fbbf24;
            padding: 0.55rem 1rem;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.82rem;
            backdrop-filter: blur(12px);
            z-index: 9999;
            max-width: calc(100vw - 2rem);
          }
          .sync-error-dismiss {
            background: none;
            border: none;
            color: #fbbf24;
            cursor: pointer;
            font-size: 1rem;
            line-height: 1;
            padding: 0 0.25rem;
          }
        `}</style>
      </div>
    )}
    </>
  );
};
