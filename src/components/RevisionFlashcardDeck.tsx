'use client';

import React, { useState, useEffect } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { RevisionCategory, RevisionDifficulty, MasteryStatus } from '@/types';
import {
  Brain,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Code2,
  Copy,
  Check,
  Award,
  Sparkles,
  Trash2,
  Lightbulb,
} from 'lucide-react';

const REVISION_CATS: RevisionCategory[] = [
  'All',
  'AI & Deep Learning',
  'System Design',
  'DSA & Algorithms',
];

export const RevisionFlashcardDeck: React.FC = () => {
  const {
    revisionCards,
    activeRevisionCategory,
    setActiveRevisionCategory,
    activeCardIndex,
    setActiveCardIndex,
    nextRevisionCard,
    prevRevisionCard,
    shuffleRevisionCards,
    toggleMasteryStatus,
    deleteRevisionCard,
    setIsAddRevisionModalOpen,
  } = useDrishti();

  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Filter cards by selected category
  const filteredCards = revisionCards.filter((c) =>
    activeRevisionCategory === 'All' ? true : c.category === activeRevisionCategory
  );

  const currentCard =
    filteredCards.length > 0
      ? filteredCards[Math.min(activeCardIndex, filteredCards.length - 1)]
      : null;

  // Reset flip state when card or category changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCopiedCode(false);
  }, [activeCardIndex, activeRevisionCategory]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getDifficultyColor = (diff: RevisionDifficulty) => {
    switch (diff) {
      case 'Beginner':
        return '#34d399';
      case 'Intermediate':
        return '#60a5fa';
      case 'Advanced':
        return '#f43f5e';
    }
  };

  const getMasteryBadge = (status: MasteryStatus) => {
    switch (status) {
      case 'mastered':
        return { label: 'Mastered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'reviewing':
        return { label: 'Reviewing', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'learning':
        return { label: 'Learning', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    }
  };

  return (
    <section className="revision-deck-section">
      {/* Header & Category Switcher */}
      <div className="rev-header">
        <div className="rev-title-row">
          <div className="rev-title-group">
            <div className="rev-icon-badge">
              <Brain size={18} />
            </div>
            <div>
              <h2 className="rev-heading">Active Recall Flashcards</h2>
              <p className="rev-subheading">SDE & AI/ML concept revision with interactive 3D flip</p>
            </div>
          </div>

          <div className="rev-actions-row">
            <button
              onClick={shuffleRevisionCards}
              className="btn-icon shuffle-btn"
              title="Shuffle Deck"
            >
              <Shuffle size={15} />
            </button>
            <button
              onClick={() => setIsAddRevisionModalOpen(true)}
              className="btn-primary add-card-btn"
            >
              <Plus size={14} />
              <span>New Question</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="rev-category-pills">
          {REVISION_CATS.map((cat) => {
            const count =
              cat === 'All'
                ? revisionCards.length
                : revisionCards.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveRevisionCategory(cat);
                  setActiveCardIndex(0);
                }}
                className={`filter-pill ${activeRevisionCategory === cat ? 'active' : ''}`}
              >
                <span>{cat}</span>
                <span className="pill-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The 3D Flashcard Container */}
      {currentCard ? (
        <div className="flashcard-viewport">
          <div className={`flashcard-3d-wrapper ${isFlipped ? 'is-flipped' : ''}`}>
            {/* ================= FRONT FACE (QUESTION) ================= */}
            <div
              className="flashcard-face bento-card rev-card-front"
              onClick={() => setIsFlipped(true)}
            >
              {/* Card Meta Bar */}
              <div className="rev-card-meta">
                <div className="meta-left">
                  <span className="rev-cat-tag">{currentCard.category}</span>
                  <span
                    className="rev-diff-tag"
                    style={{
                      color: getDifficultyColor(currentCard.difficulty),
                      borderColor: getDifficultyColor(currentCard.difficulty),
                    }}
                  >
                    {currentCard.difficulty}
                  </span>
                </div>

                <div className="meta-right">
                  {(() => {
                    const m = getMasteryBadge(currentCard.masteryStatus);
                    return (
                      <span
                        className="mastery-pill"
                        style={{ color: m.color, background: m.bg }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMasteryStatus(currentCard.id);
                        }}
                        title="Click to cycle status"
                      >
                        <Award size={12} />
                        {m.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Central Question */}
              <div className="rev-question-body">
                <span className="q-label">QUESTION & PROBLEM</span>
                <h3 className="rev-question-text">{currentCard.question}</h3>

                {/* Hint Toggle */}
                {currentCard.hint && (
                  <div className="hint-section" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="hint-toggle-btn"
                    >
                      <Lightbulb size={13} className="lightbulb-icon" />
                      <span>{showHint ? 'Hide Hint' : 'Reveal Hint'}</span>
                    </button>
                    {showHint && <p className="hint-content">{currentCard.hint}</p>}
                  </div>
                )}
              </div>

              {/* Tags & Flip Action Prompt */}
              <div className="rev-front-footer">
                <div className="rev-tags-wrap">
                  {currentCard.tags.map((tag, i) => (
                    <span key={i} className="rev-tag">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="flip-prompt-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                >
                  <RotateCw size={14} className="flip-icon-anim" />
                  <span>Reveal Solution</span>
                </button>
              </div>
            </div>

            {/* ================= BACK FACE (ANSWER & CODE) ================= */}
            <div className="flashcard-face flashcard-face-back bento-card rev-card-back">
              {/* Back Top Meta Bar */}
              <div className="rev-back-header">
                <div className="back-meta-left">
                  <CheckCircle2 size={16} className="solution-check" />
                  <span className="solution-title">Solution & Key Takeaways</span>
                </div>

                <div className="back-meta-right">
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="flip-back-pill"
                    title="Flip Back to Question"
                  >
                    <RotateCw size={12} />
                    <span>Question</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Answer Content */}
              <div className="rev-answer-scroll">
                {/* Summary Box */}
                <div className="summary-box">
                  <span className="summary-lbl">CORE FORMULA / SUMMARY:</span>
                  <p className="summary-txt">{currentCard.answerSummary}</p>
                </div>

                {/* Markdown Detailed Explanation */}
                <div className="markdown-explanation">
                  {currentCard.answerMarkdown.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="markdown-p">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Code Snippet Box */}
                {currentCard.codeSnippet && (
                  <div className="code-block-wrap">
                    <div className="code-header">
                      <div className="code-lang-label">
                        <Code2 size={13} />
                        <span>{currentCard.codeSnippet.language.toUpperCase()}</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(currentCard.codeSnippet!.code)}
                        className="copy-code-btn"
                        title="Copy Code"
                      >
                        {copiedCode ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="code-content">
                      <code>{currentCard.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {/* Key Takeaways Checklist */}
                {currentCard.keyTakeaways && currentCard.keyTakeaways.length > 0 && (
                  <div className="takeaways-box">
                    <span className="takeaways-title">Key Engineering Takeaways:</span>
                    <ul className="takeaways-list">
                      {currentCard.keyTakeaways.map((takeaway, tIdx) => (
                        <li key={tIdx} className="takeaway-item">
                          <Check size={13} className="takeaway-check" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Back Footer: Mastery Controls */}
              <div className="rev-back-footer">
                <div className="mastery-buttons-group">
                  <span className="mastery-lbl">Confidence:</span>
                  <button
                    onClick={() => toggleMasteryStatus(currentCard.id)}
                    className="cycle-mastery-btn"
                  >
                    Status: <strong>{currentCard.masteryStatus.toUpperCase()}</strong> (Click to change)
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Delete this flashcard question?')) {
                      deleteRevisionCard(currentCard.id);
                    }
                  }}
                  className="delete-rev-card-btn"
                  title="Delete Card"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-deck-box bento-card">
          <BookOpen size={36} className="empty-deck-icon" />
          <h3>No Flashcards in this Category</h3>
          <p>Create a new SDE or AI question to start practicing active recall.</p>
          <button
            onClick={() => setIsAddRevisionModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={15} />
            <span>Create Flashcard</span>
          </button>
        </div>
      )}

      {/* Deck Controls (Prev, Next, Position) */}
      {filteredCards.length > 0 && (
        <div className="deck-nav-bar">
          <button onClick={prevRevisionCard} className="btn-secondary nav-arrow-btn">
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="nav-counter-pill">
            <span>
              Card <strong>{activeCardIndex + 1}</strong> of <strong>{filteredCards.length}</strong>
            </span>
          </div>

          <button onClick={nextRevisionCard} className="btn-secondary nav-arrow-btn">
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <style jsx>{`
        .revision-deck-section {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .rev-header {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .rev-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .rev-title-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .rev-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(56, 189, 248, 0.2));
          border: 1px solid var(--border-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-tertiary);
        }

        .rev-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .rev-subheading {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .rev-actions-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rev-category-pills {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .pill-count {
          background: rgba(0, 0, 0, 0.25);
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          margin-left: 0.2rem;
        }

        .flashcard-viewport {
          height: 420px;
          perspective: 1200px;
          position: relative;
        }

        .rev-card-front,
        .rev-card-back {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.4rem;
          height: 100%;
          border: 1px solid var(--border-card);
        }

        .rev-card-front {
          cursor: pointer;
          background: linear-gradient(
            150deg,
            var(--bg-glass-card) 0%,
            var(--bg-surface-elevated) 100%
          );
        }

        .rev-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .meta-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rev-cat-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          background: rgba(168, 85, 247, 0.15);
          color: var(--accent-tertiary);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 6px;
        }

        .rev-diff-tag {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.15rem 0.45rem;
          border: 1px solid;
          border-radius: 6px;
        }

        .mastery-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .rev-question-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1rem 0;
        }

        .q-label {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--accent-primary);
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 0.4rem;
        }

        .rev-question-text {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          letter-spacing: -0.02em;
        }

        .hint-section {
          margin-top: 1rem;
        }

        .hint-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .hint-content {
          margin-top: 0.5rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
          background: var(--bg-surface);
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          border-left: 3px solid #fbbf24;
        }

        .rev-front-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
        }

        .rev-tags-wrap {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .rev-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
          background: var(--bg-surface);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .flip-prompt-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: #030712;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 0.45rem 0.95rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(56, 189, 248, 0.25);
          transition: var(--transition-smooth);
        }

        .flip-prompt-btn:hover {
          transform: scale(1.03);
          filter: brightness(1.1);
        }

        .flip-icon-anim {
          animation: spinOnce 0.6s ease;
        }

        /* BACK FACE STYLES */
        .rev-card-back {
          background: var(--bg-surface);
        }

        .rev-back-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .back-meta-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .solution-check {
          color: #10b981;
        }

        .solution-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .flip-back-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-secondary);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .flip-back-pill:hover {
          color: var(--accent-primary);
          border-color: var(--border-hover);
        }

        .rev-answer-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0.85rem 0.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .summary-box {
          background: rgba(56, 189, 248, 0.08);
          border-left: 3px solid var(--accent-primary);
          padding: 0.65rem 0.85rem;
          border-radius: 0 8px 8px 0;
        }

        .summary-lbl {
          font-size: 0.68rem;
          font-family: var(--font-mono);
          color: var(--accent-primary);
          font-weight: 700;
          display: block;
        }

        .summary-txt {
          font-size: 0.86rem;
          color: var(--text-primary);
          margin-top: 0.2rem;
          font-family: var(--font-mono);
        }

        .markdown-explanation {
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .code-block-wrap {
          background: #0d1117;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.75rem;
          background: #161b22;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .code-lang-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: #8b949e;
        }

        .copy-code-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          font-size: 0.72rem;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
        }

        .copy-code-btn:hover {
          color: #f0f6fc;
        }

        .code-content {
          padding: 0.75rem;
          font-size: 0.8rem;
          color: #e6edf3;
          overflow-x: auto;
          line-height: 1.45;
        }

        .takeaways-box {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.75rem 0.95rem;
          border-radius: 10px;
        }

        .takeaways-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
          display: block;
        }

        .takeaways-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .takeaway-item {
          display: flex;
          align-items: flex-start;
          gap: 0.45rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .takeaway-check {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .rev-back-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
        }

        .mastery-buttons-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mastery-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .cycle-mastery-btn {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-primary);
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .cycle-mastery-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .delete-rev-card-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          width: 30px;
          height: 30px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .deck-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .nav-counter-pill {
          font-size: 0.84rem;
          color: var(--text-secondary);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.35rem 0.95rem;
          border-radius: 999px;
        }

        .nav-arrow-btn {
          padding: 0.45rem 1rem;
        }

        .empty-deck-box {
          padding: 3rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .empty-deck-icon {
          color: var(--text-muted);
        }
      `}</style>
    </section>
  );
};
