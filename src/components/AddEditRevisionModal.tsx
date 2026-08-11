'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { RevisionCategory } from '@/types';
import { X, Check, Brain } from 'lucide-react';

export const AddEditRevisionModal: React.FC = () => {
  const { isAddRevisionModalOpen, setIsAddRevisionModalOpen, addRevisionCard } = useDrishti();

  const [title, setTitle] = useState('');
  const [linkOrSummary, setLinkOrSummary] = useState('');
  const [category, setCategory] = useState<RevisionCategory>('AI & Deep Learning');

  if (!isAddRevisionModalOpen) return null;

  const handleClose = () => {
    setIsAddRevisionModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !linkOrSummary.trim()) return;

    addRevisionCard(title.trim(), linkOrSummary.trim(), category);
    setTitle('');
    setLinkOrSummary('');
    handleClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content bento-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Brain size={18} />
            </div>
            <div>
              <h2 className="modal-title">Add Active Recall Flashcard</h2>
              <p className="modal-subtitle">Quick question and answer/docs link</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="input-label">Question / Concept Title</label>
            <input
              type="text"
              className="text-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How does FlashAttention achieve speedup?"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="input-label">Answer / Formula / Notes Link</label>
            <textarea
              className="textarea-input"
              value={linkOrSummary}
              onChange={(e) => setLinkOrSummary(e.target.value)}
              placeholder="e.g. Tiling Q, K, V blocks in SRAM to minimize HBM IO access, or paste Google Doc link"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Category</label>
            <select
              className="select-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as RevisionCategory)}
            >
              <option value="AI & Deep Learning">AI & Deep Learning</option>
              <option value="System Design">System Design</option>
              <option value="DSA & Algorithms">DSA & Algorithms</option>
              <option value="Python & Backend">Python & Backend</option>
              <option value="Spiritual Wisdom">Spiritual Wisdom</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>Add Flashcard</span>
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
          background: rgba(168, 85, 247, 0.18);
          color: var(--accent-tertiary);
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
        .textarea-input,
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
        .textarea-input:focus,
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
