'use client';

import React, { useState, useEffect } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { LinkCategory } from '@/types';
import { X, Check, Globe, Sparkles } from 'lucide-react';

export const AddEditLinkModal: React.FC = () => {
  const {
    isAddLinkModalOpen,
    setIsAddLinkModalOpen,
    defaultModalCategory,
    editingLink,
    setEditingLink,
    addLink,
    updateLink,
  } = useDrishti();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<LinkCategory>(defaultModalCategory);

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title);
      setUrl(editingLink.url);
      setCategory(editingLink.category);
    } else {
      setTitle('');
      setUrl('');
      setCategory(defaultModalCategory || 'ai');
    }
  }, [editingLink, isAddLinkModalOpen, defaultModalCategory]);

  if (!isAddLinkModalOpen) return null;

  const handleClose = () => {
    setIsAddLinkModalOpen(false);
    setEditingLink(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    if (editingLink) {
      updateLink(editingLink.id, {
        title: title.trim(),
        url: url.trim(),
        category,
      });
    } else {
      addLink(title.trim(), url.trim(), category);
    }

    handleClose();
  };

  // Preview Domain Favicon
  const getDomain = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      return u.hostname;
    } catch {
      return '';
    }
  };
  const previewDomain = getDomain(url);
  const previewFavicon = previewDomain
    ? `https://www.google.com/s2/favicons?domain=${previewDomain}&sz=128`
    : null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content bento-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="modal-title">
                {editingLink ? 'Edit Deep Link' : 'Add New Deep Link'}
              </h2>
              <p className="modal-subtitle">Direct destination link to avoid feed distractions</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {previewDomain && (
            <div className="preview-banner">
              <div className="preview-favicon">
                {previewFavicon && (
                  <img src={previewFavicon} alt="Favicon" className="preview-img" />
                )}
              </div>
              <div className="preview-info">
                <span className="preview-domain">{previewDomain}</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Title / Display Name</label>
            <input
              type="text"
              className="text-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LinkedIn Feed / Google Docs Notes"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="input-label">Target Link / URL</label>
            <input
              type="text"
              className="text-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Category</label>
            <select
              className="select-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as LinkCategory)}
            >
              <option value="ai">AI Powerhouse</option>
              <option value="productivity">Productivity & Docs</option>
              <option value="social">Social & Comms</option>
              <option value="spiritual">Spiritual Wisdom</option>
              <option value="media">Media & Audio</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>{editingLink ? 'Save Link' : 'Add Link'}</span>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.2rem 1.4rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .modal-icon-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(56, 189, 248, 0.15);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-subtitle {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .modal-form {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-banner {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
        }

        .preview-favicon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-img {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }

        .preview-domain {
          font-size: 0.8rem;
          font-family: var(--font-mono);
          color: var(--accent-primary);
          font-weight: 600;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .input-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .text-input,
        .select-input {
          background: var(--bg-input);
          border: 1px solid var(--border-card);
          border-radius: 10px;
          color: var(--text-primary);
          padding: 0.6rem 0.85rem;
          font-size: 0.88rem;
          outline: none;
        }

        .text-input:focus,
        .select-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
        }
      `}</style>
    </div>
  );
};
