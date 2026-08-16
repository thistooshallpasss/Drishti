'use client';

import React, { useState } from 'react';
import { DeepLinkItem } from '@/types';
import { useDrishti } from '@/context/DrishtiContext';
import {
  ExternalLink,
  Pin,
  Edit3,
  Trash2,
  Check,
  X,
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
  const [editDesc, setEditDesc] = useState(link.description || '');
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
      description: editDesc.trim(),
    });
    setIsFlipped(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${link.title}"?`)) {
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
        <div className="flashcard-face bento-card card-front" onClick={handleLaunch}>
          {/* Top Bar: Pin & Edit Actions */}
          <div className="card-top-bar" onClick={(e) => e.stopPropagation()}>
            <div className="card-domain-badge">
              <span className="domain-text">{domain}</span>
            </div>

            <div className="action-icons-wrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinLink(link.id);
                }}
                className={`pin-btn ${link.isPinned ? 'pinned-active' : ''}`}
                title={link.isPinned ? 'Unpin item' : 'Pin item to top'}
              >
                <Pin size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditTitle(link.title);
                  setEditUrl(link.url);
                  setEditDesc(link.description || '');
                  setIsFlipped(true);
                }}
                className="flip-btn"
                title="Edit details"
              >
                <Edit3 size={14} />
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="delete-card-btn"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Card Middle: Favicon & Title */}
          <div className="card-body-section">
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
                {link.description && (
                  <p className="link-desc-text">{link.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="card-footer-section" onClick={(e) => e.stopPropagation()}>
            <div className="stats-indicator">
              {link.clickCount > 0 && (
                <span className="clicks-badge" title="Total launches">
                  <Flame size={12} className="flame-icon" /> {link.clickCount} launches
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              className="launch-direct-btn"
              title="Open Destination"
            >
              <span>Launch</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* ================= BACK FACE (EDIT FORM) ================= */}
        <div
          className="flashcard-face bento-card card-back"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="edit-header-row">
            <h4 className="edit-heading">Edit Document / Link</h4>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="close-flip-btn"
              title="Cancel"
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="edit-form-body">
            <div className="input-group">
              <label className="input-label">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. ChatGPT or System Design Doc"
                className="edit-text-input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Destination URL</label>
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
                className="edit-text-input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description (Optional)</label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Short note or description"
                className="edit-text-input"
              />
            </div>

            <div className="edit-actions-row">
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger-mini"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>

              <button type="submit" className="btn-primary-mini">
                <Check size={13} />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .link-card-container {
          perspective: 1000px;
          height: 190px;
          position: relative;
        }

        .flashcard-3d-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
        }

        .flashcard-3d-wrapper.is-flipped {
          transform: rotateY(180deg);
        }

        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem 1.15rem;
          border-radius: 14px;
        }

        .card-front {
          cursor: pointer;
          border: 1px solid var(--border-card);
          transition: var(--transition-bounce);
        }

        .card-front:hover {
          border-color: var(--accent-primary);
          transform: translateY(-3px);
          box-shadow: var(--card-shadow-hover);
        }

        .is-pinned .card-front {
          border-color: rgba(56, 189, 248, 0.4);
          background: linear-gradient(
            135deg,
            rgba(56, 189, 248, 0.05) 0%,
            var(--bg-glass-card) 100%
          );
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-domain-badge {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          border: 1px solid var(--border-subtle);
          max-width: 130px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .action-icons-wrap {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .pin-btn,
        .flip-btn,
        .delete-card-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.3rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .pin-btn:hover,
        .flip-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .pin-btn.pinned-active {
          color: var(--accent-primary);
          background: rgba(56, 189, 248, 0.15);
        }

        .delete-card-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
        }

        .card-body-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin: 0.3rem 0;
        }

        .icon-launch-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .favicon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .favicon-img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }

        .fallback-monogram {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-primary);
          font-family: var(--font-mono);
        }

        .title-url-box {
          flex: 1;
          overflow: hidden;
        }

        .link-title {
          font-size: 0.96rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        .link-desc-text {
          font-size: 0.73rem;
          color: var(--text-muted);
          line-height: 1.35;
          margin-top: 0.2rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.4rem;
          border-top: 1px solid var(--border-subtle);
        }

        .stats-indicator {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .clicks-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: #f97316;
        }

        .launch-direct-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .launch-direct-btn:hover {
          background: var(--accent-primary);
          color: #030712;
          border-color: var(--accent-primary);
        }

        /* BACK FACE */
        .card-back {
          transform: rotateY(180deg);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
        }

        .edit-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.3rem;
        }

        .edit-heading {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .close-flip-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .edit-form-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .input-label {
          font-size: 0.64rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .edit-text-input {
          background: var(--bg-surface);
          border: 1px solid var(--border-card);
          padding: 0.3rem 0.5rem;
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.76rem;
          outline: none;
        }

        .edit-text-input:focus {
          border-color: var(--accent-primary);
        }

        .edit-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .btn-danger-mini {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
        }

        .btn-primary-mini {
          background: var(--accent-primary);
          border: none;
          color: #030712;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
