'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { MasterTileId } from '@/types';
import { X, Check, Globe, Plus, Tag, Trash2 } from 'lucide-react';

const HUB_OPTIONS: { id: MasterTileId; label: string }[] = [
  { id: 'ai', label: 'AI & Machine Learning' },
  { id: 'coding-dsa', label: 'Coding & DSA' },
  { id: 'system-design', label: 'System Design' },
  { id: 'market-updates', label: 'Recent Update in Market' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'life-sutras', label: 'Life Sutras & Wisdom' },
  { id: 'health', label: 'Health & Energy' },
  { id: 'finance', label: 'Finance & Wealth' },
  { id: 'apply-job', label: 'Apply Job & Career' },
  { id: 'tools', label: 'Tools & Deep Links' },
];

export const AddEditLinkModal: React.FC = () => {
  const {
    isAddLinkModalOpen,
    setIsAddLinkModalOpen,
    editingLink,
    setEditingLink,
    addLink,
    updateLink,
    activeTileId,
  } = useDrishti();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedHub, setSelectedHub] = useState<MasterTileId>(activeTileId || 'tools');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title);
      setUrl(editingLink.url);
      setSelectedHub((editingLink.masterTileId as MasterTileId) || activeTileId || 'tools');
      setTags(editingLink.tags || []);
    } else {
      setTitle('');
      setUrl('');
      setSelectedHub(activeTileId || 'tools');
      setTags([]);
    }
    setTagInput('');
  }, [editingLink, isAddLinkModalOpen, activeTileId]);

  if (!isAddLinkModalOpen) return null;

  const handleClose = () => {
    setIsAddLinkModalOpen(false);
    setEditingLink(null);
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
    tagInputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    if (editingLink) {
      updateLink(editingLink.id, {
        title: title.trim(),
        url: url.trim(),
        masterTileId: selectedHub,
        tags,
      });
    } else {
      addLink(title.trim(), url.trim(), 'custom', selectedHub, tags);
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
            <label className="input-label">Add to Hub</label>
            <select
              className="select-input"
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value as MasterTileId)}
            >
              {HUB_OPTIONS.map((h) => (
                <option key={h.id} value={h.id}>{h.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">
              <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Custom Tags <span className="label-hint">(press Enter or comma to add)</span>
            </label>
            <div className="tag-input-area">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove-btn"
                    onClick={() => removeTag(tag)}
                    tabIndex={-1}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                className="tag-text-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? 'Add tag…' : ''}
              />
            </div>
            {tagInput.trim() && (
              <button type="button" onClick={addTag} className="add-tag-btn">
                <Plus size={12} /> Add &quot;{tagInput.trim()}&quot;
              </button>
            )}
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
          display: flex;
          align-items: center;
        }

        .label-hint {
          font-size: 0.72rem;
          font-weight: 400;
          color: var(--text-muted);
          margin-left: 0.3rem;
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
          width: 100%;
        }

        .text-input:focus,
        .select-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
        }

        /* Tag Input Area */
        .tag-input-area {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-input);
          border: 1px solid var(--border-card);
          border-radius: 10px;
          padding: 0.4rem 0.7rem;
          min-height: 42px;
          cursor: text;
          transition: border-color 0.2s;
        }

        .tag-input-area:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
        }

        .tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: var(--accent-primary);
          padding: 0.18rem 0.55rem;
          border-radius: 20px;
          font-size: 0.76rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .tag-remove-btn {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          opacity: 0.7;
        }

        .tag-remove-btn:hover {
          opacity: 1;
        }

        .tag-text-input {
          flex: 1;
          min-width: 80px;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 0.88rem;
          padding: 0.1rem 0;
        }

        .add-tag-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: transparent;
          border: 1px dashed var(--accent-primary);
          color: var(--accent-primary);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.1rem;
        }

        .add-tag-btn:hover {
          background: rgba(56, 189, 248, 0.1);
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
