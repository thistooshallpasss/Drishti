'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Headphones, BookOpen, ExternalLink, Play, Pause, RotateCcw } from 'lucide-react';

export const WisdomFocusCard: React.FC = () => {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bento-card wisdom-container">
      {/* Header */}
      <div className="wisdom-header">
        <div className="title-group">
          <div className="icon-box">
            <Sparkles size={17} />
          </div>
          <div>
            <h3 className="card-title">Wisdom & Focus Sanctuary</h3>
            <p className="card-sub">Vedantic reflections & deep-work focus timer</p>
          </div>
        </div>
      </div>

      {/* Featured Sanskrit / Vedabase Reflection */}
      <div className="verse-card">
        <span className="verse-citation">Bhagavad Gita 2.47 • Karma Yoga</span>
        <p className="sanskrit-text">
          कर्मण्येवाधिकारस्ते मा फलेषु कदाचन |<br />
          मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ||
        </p>
        <p className="verse-trans">
          &ldquo;You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results, and never be attached to not doing your duty.&rdquo;
        </p>
      </div>

      {/* Deep Audio Hub Quick Links */}
      <div className="audio-links-grid">
        <a
          href="https://vedabase.io/en/"
          target="_blank"
          rel="noopener noreferrer"
          className="audio-link-btn"
        >
          <BookOpen size={14} className="link-icon gold-icon" />
          <div className="link-texts">
            <span className="link-name">Vedabase.io</span>
            <span className="link-hint">Original Texts & Purports</span>
          </div>
          <ExternalLink size={12} className="ext-icon" />
        </a>

        <a
          href="https://audio.iskcondesiretree.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="audio-link-btn"
        >
          <Headphones size={14} className="link-icon amber-icon" />
          <div className="link-texts">
            <span className="link-name">Desire Tree Audio</span>
            <span className="link-hint">Lectures & Kirtans</span>
          </div>
          <ExternalLink size={12} className="ext-icon" />
        </a>
      </div>

      {/* Mini Focus Sprint Timer */}
      <div className="pomodoro-bar">
        <div className="timer-display-group">
          <span className="timer-label">Focus Sprint:</span>
          <span className="timer-clock">{formatTime(timerSeconds)}</span>
        </div>

        <div className="timer-controls">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`btn-primary timer-btn ${isRunning ? 'running' : ''}`}
          >
            {isRunning ? <Pause size={13} /> : <Play size={13} />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setTimerSeconds(25 * 60);
            }}
            className="btn-icon timer-reset"
            title="Reset to 25 mins"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .wisdom-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          height: 100%;
        }

        .wisdom-header {
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
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
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

        .verse-card {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          border-left: 3px solid #f59e0b;
          padding: 0.85rem;
          border-radius: 0 10px 10px 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .verse-citation {
          font-size: 0.68rem;
          font-family: var(--font-mono);
          color: #fbbf24;
          font-weight: 700;
        }

        .sanskrit-text {
          font-size: 0.88rem;
          color: var(--text-primary);
          line-height: 1.4;
          font-weight: 600;
        }

        .verse-trans {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.45;
          font-style: italic;
        }

        .audio-links-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }

        .audio-link-btn {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.65rem 0.75rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          transition: var(--transition-smooth);
        }

        .audio-link-btn:hover {
          border-color: #f59e0b;
          background: var(--bg-glass-card-hover);
          transform: translateY(-2px);
        }

        .gold-icon {
          color: #fbbf24;
        }

        .amber-icon {
          color: #f59e0b;
        }

        .link-texts {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .link-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .link-hint {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .ext-icon {
          color: var(--text-muted);
        }

        .pomodoro-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.6rem 0.85rem;
          border-radius: 10px;
          margin-top: auto;
        }

        .timer-display-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .timer-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .timer-clock {
          font-size: 1.15rem;
          font-weight: 800;
          font-family: var(--font-mono);
          color: var(--accent-primary);
        }

        .timer-controls {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .timer-btn {
          padding: 0.35rem 0.75rem;
          font-size: 0.76rem;
        }

        .running {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .timer-reset {
          width: 30px;
          height: 30px;
        }

        @media (max-width: 600px) {
          .audio-links-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
