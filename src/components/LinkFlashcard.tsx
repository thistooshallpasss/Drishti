'use client';

import React, { useState } from 'react';
import { DeepLinkItem, LinkCategory } from '@/types';
import { useDrishti } from '@/context/DrishtiContext';
import {
  ExternalLink,
  Pin,
  Edit3,
  Trash2,
  Check,
  X,
  RotateCw,
  Flame,
} from 'lucide-react';

interface LinkFlashcardProps {
  link: DeepLinkItem;
  index: number;
}

export const LinkFlashcard: React.FC<LinkFlashcardProps> = ({ link }) => {
  const { updateLink, deleteLink, togglePinLink, recordLinkClick } = useDrishti();

  const [isFlipped, setIsFlipped] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editCategory, setEditCategory] = useState<LinkCategory>(link.category);
  const [faviconError, setFaviconError] = useState(false);

  // Extract domain for favicon lookup
  const getDomain = (rawUrl: string) => {
    try {
      const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      return urlObj.hostname;
    } catch {
      return rawUrl.replace(/(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
  };

  const domain = getDomain(link.url);
  const faviconSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordLinkClick(link.id);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editTitle.trim() || !editUrl.trim()) return;

    let cleanUrl = editUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    updateLink(link.id, {
      title: editTitle.trim(),
      url: cleanUrl,
      category: editCategory,
    });
    setIsFlipped(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${link.title}" from your Drishti launchpad?`)) {
      deleteLink(link.id);
    }
  };

  return (
    <div
      className={`link-card-container ${link.isPinned ? 'is-pinned' : ''} ${
        isFlipped ? 'is-flipped-container' : ''
      }`}
    >
      <div className={`flashcard-3d-wrapper ${isFlipped ? 'is-flipped' : ''}`}>
        {/* ================= FRONT FACE ================= */}
        <div className="flashcard-face bento-card card-front">
          {/* Top Bar: Category & Actions */}
          <div className="card-top-bar">
            <div className="category-pill-wrap">
              <span className={`category-badge cat-${link.category}`}>
                {link.category.toUpperCase()}
              </span>
              {link.badge && <span className="custom-subbadge">{link.badge}</span>}
            </div>

            <div className="action-icons-wrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinLink(link.id);
                }}
                className={`pin-btn ${link.isPinned ? 'pinned-active' : ''}`}
                title={link.isPinned ? 'Unpin card' : 'Pin card to top'}
              >
                <Pin size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditTitle(link.title);
                  setEditUrl(link.url);
                  setEditCategory(link.category);
                  setIsFlipped(true);
                }}
                className="flip-btn"
                title="Flip to Edit Card"
              >
                <Edit3 size={14} />
              </button>
            </div>
          </div>

          {/* Card Middle: Favicon & Title */}
          <div className="card-body-section" onClick={handleLaunch}>
            <div className="icon-launch-row">
              <div className="favicon-box">
                {!faviconError ? (
                  <img
                    src={faviconSrc}
                    alt={link.title}
                    onError={() => setFaviconError(true)}
                    className="favicon-img"
                  />
                ) : (
                  <span className="fallback-monogram">
                    {link.title.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="title-url-box">
                <h3 className="link-title">{link.title}</h3>
                <span className="link-domain-preview">{domain}</span>
              </div>
            </div>

            {link.description && (
              <p className="link-desc-text">{link.description}</p>
            )}

            {/* Tags Row */}
            {link.tags && link.tags.length > 0 && (
              <div className="tags-row">
                {link.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card Footer: Usage & Direct Launch Action */}
          <div className="card-footer-section">
            <div className="stats-indicator">
              {link.clickCount > 0 && (
                <span className="clicks-badge" title="Total launches">
                  <Flame size={12} className="flame-icon" /> {link.clickCount}
                </span>
              )}
              {link.lastVisited && (
                <span className="last-visited-text">Last: {link.lastVisited}</span>
              )}
            </div>

            <button
              onClick={handleLaunch}
              className="launch-direct-btn"
              title={`Open ${link.url}`}
            >
              <span>Launch</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* ================= BACK FACE (FLIP EDIT) ================= */}
        <div className="flashcard-face flashcard-face-back bento-card card-back">
          <div className="back-header">
            <div className="back-title-wrap">
              <RotateCw size={13} className="rotate-icon" />
              <span>Edit Flashcard</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="btn-icon close-flip-btn"
              title="Cancel Edit"
            >
              <X size={13} />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="back-edit-form">
            <div className="form-field">
              <label>Name</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Name"
                required
                autoFocus
              />
            </div>

            <div className="form-field">
              <label>Target URL</label>
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div className="form-field">
              <label>Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as LinkCategory)}
              >
                <option value="ai">AI Powerhouse</option>
                <option value="productivity">Productivity & Docs</option>
                <option value="social">Social & Comms</option>
                <option value="spiritual">Spiritual Wisdom</option>
                <option value="media">Media & Audio</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="back-action-buttons">
              <button
                type="button"
                onClick={handleDelete}
                className="delete-card-btn"
                title="Delete Link"
              >
                <Trash2 size={13} />
              </button>

              <button type="submit" className="btn-primary save-flip-btn">
                <Check size={13} />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .link-card-container {
          height: 210px;
          position: relative;
          perspective: 1200px;
          transition: z-index 0.3s ease;
        }

        .link-card-container.is-flipped-container {
          z-index: 50 !important;
          position: relative;
        }

        .flashcard-3d-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.2, 0.85, 0.32, 1.2);
        }

        .flashcard-3d-wrapper.is-flipped {
          transform: rotateY(180deg);
        }

        .flashcard-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
        }

        .card-front {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem 1.1rem;
          height: 100%;
          border: 1px solid var(--border-card);
        }

        .card-back {
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.9rem 1rem;
          height: 100%;
          border: 1px solid var(--accent-primary);
          background: var(--bg-surface);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
        }

        .is-pinned .card-front {
          border-color: var(--badge-pinned-border);
          background: linear-gradient(
            145deg,
            var(--badge-pinned-bg) 0%,
            var(--bg-glass-card) 50%
          );
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .category-pill-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .category-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .cat-social {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .cat-productivity {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .cat-ai {
          background: rgba(168, 85, 247, 0.18);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.35);
        }

        .cat-media {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .cat-spiritual {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }

        .custom-subbadge {
          font-size: 0.62rem;
          padding: 0.12rem 0.35rem;
          background: var(--bg-surface-elevated);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .action-icons-wrap {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .pin-btn,
        .flip-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .pin-btn:hover,
        .flip-btn:hover {
          background: var(--bg-surface-elevated);
          color: var(--text-primary);
          border-color: var(--border-subtle);
        }

        .pinned-active {
          color: var(--badge-pinned-text);
          background: var(--badge-pinned-bg);
          border-color: var(--badge-pinned-border);
        }

        .card-body-section {
          flex: 1;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0.3rem 0;
        }

        .icon-launch-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .favicon-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .favicon-img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }

        .fallback-monogram {
          font-weight: 800;
          font-size: 0.85rem;
          color: var(--accent-primary);
        }

        .title-url-box {
          overflow: hidden;
        }

        .link-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.25;
        }

        .link-domain-preview {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          display: block;
        }

        .link-desc-text {
          font-size: 0.74rem;
          color: var(--text-secondary);
          line-height: 1.35;
          margin-top: 0.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          margin-top: 0.3rem;
        }

        .tag-chip {
          font-size: 0.65rem;
          color: var(--text-muted);
          background: var(--bg-surface);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .card-footer-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.45rem;
          border-top: 1px solid var(--border-subtle);
        }

        .stats-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .clicks-badge {
          font-size: 0.7rem;
          font-weight: 600;
          color: #f97316;
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
        }

        .last-visited-text {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .launch-direct-btn {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-primary);
          padding: 0.3rem 0.7rem;
          border-radius: 7px;
          font-size: 0.76rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .launch-direct-btn:hover {
          background: var(--accent-primary);
          color: #030712;
          border-color: var(--accent-primary);
          transform: translateY(-1px);
        }

        /* BACK FACE FLIP EDIT STYLES */
        .back-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.3rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .back-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .rotate-icon {
          animation: spinOnce 0.4s ease;
        }

        .close-flip-btn {
          width: 24px;
          height: 24px;
        }

        .back-edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
          justify-content: space-around;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .form-field label {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .form-field input,
        .form-field select {
          background: var(--bg-input);
          border: 1px solid var(--border-card);
          color: var(--text-primary);
          padding: 0.28rem 0.45rem;
          border-radius: 6px;
          font-size: 0.78rem;
          outline: none;
        }

        .form-field input:focus,
        .form-field select:focus {
          border-color: var(--accent-primary);
        }

        .back-action-buttons {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.3rem;
          border-top: 1px solid var(--border-subtle);
        }

        .delete-card-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .delete-card-btn:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .save-flip-btn {
          padding: 0.3rem 0.75rem;
          font-size: 0.76rem;
        }
      `}</style>
    </div>
  );
};
