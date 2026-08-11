'use client';

import React, { useState } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { CourseTreeNode } from '@/types';
import {
  FolderTree,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  BookOpen,
  Folder,
} from 'lucide-react';

export const CourseDocTree: React.FC = () => {
  const {
    treeNodes,
    activeTileId,
    activeSubTrack,
    addTreeNode,
    updateTreeNode,
    deleteTreeNodeCascade,
    logActivity,
  } = useDrishti();

  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  // Collapsed branches state
  const [collapsedCodes, setCollapsedCodes] = useState<Set<string>>(new Set());

  const currentTileId = activeTileId || 'ai';

  // Filter nodes for the current active tile and active subtrack
  const currentNodes = treeNodes
    .filter(
      (n) =>
        n.masterTileId === currentTileId &&
        (!activeSubTrack || n.subTrack === activeSubTrack)
    )
    .sort((a, b) => {
      const parseCode = (c: string) =>
        c
          .replace(/\.$/, '')
          .split('.')
          .map((part) => parseInt(part, 10) || 0);

      const aParts = parseCode(a.code);
      const bParts = parseCode(b.code);
      const maxLen = Math.max(aParts.length, bParts.length);

      for (let i = 0; i < maxLen; i++) {
        const aVal = aParts[i] ?? -1;
        const bVal = bParts[i] ?? -1;
        if (aVal !== bVal) return aVal - bVal;
      }
      return a.code.localeCompare(b.code);
    });

  // Calculate level of depth based on dot count in code (e.g. "1." -> 0, "1.1" -> 1, "1.1.1" -> 2)
  const getNodeDepth = (code: string) => {
    const clean = code.trim().replace(/\.$/, '');
    if (!clean.includes('.')) return 0;
    return clean.split('.').length - 1;
  };

  const handleToggleCollapse = (code: string) => {
    setCollapsedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const isNodeHiddenByParent = (code: string) => {
    const clean = code.trim().replace(/\.$/, '');
    const collapsedArray = Array.from(collapsedCodes);
    for (let i = 0; i < collapsedArray.length; i++) {
      const cleanCollapsed = collapsedArray[i].trim().replace(/\.$/, '');
      if (clean.startsWith(`${cleanCollapsed}.`)) {
        return true;
      }
    }
    return false;
  };

  const handleOpenDoc = (node: CourseTreeNode) => {
    logActivity(`${node.code} ${node.title}`, node.url, `${node.masterTileId} / ${node.subTrack}`, 'doc_tree');
    window.open(node.url, '_blank', 'noopener,noreferrer');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let autoCode = newCode.trim();
    if (!autoCode) {
      autoCode = `${currentNodes.length + 1}.`;
    }

    addTreeNode(autoCode, newTitle.trim(), newUrl.trim(), currentTileId, activeSubTrack);
    setNewCode('');
    setNewTitle('');
    setNewUrl('');
    setIsAddingNode(false);
  };

  const handleStartEdit = (node: CourseTreeNode) => {
    setEditingId(node.id);
    setEditCode(node.code);
    setEditTitle(node.title);
    setEditUrl(node.url);
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) return;
    updateTreeNode(id, {
      code: editCode.trim(),
      title: editTitle.trim(),
      url: editUrl.trim(),
    });
    setEditingId(null);
  };

  const handleDeleteCascade = (id: string, code: string, title: string) => {
    if (
      confirm(
        `Delete "${code} ${title}" and ALL its sub-child notes from both tree and boxes?`
      )
    ) {
      deleteTreeNodeCascade(id);
    }
  };

  return (
    <div className="bento-card course-tree-container">
      {/* Header */}
      <div className="tree-header">
        <div className="tree-title-group">
          <div className="tree-icon-box">
            <FolderTree size={18} />
          </div>
          <div>
            <h3 className="tree-heading">
              {activeSubTrack} • Notes Tree Hierarchy
            </h3>
            <p className="tree-subheading">
              Hierarchical Google Docs notes with automatic multi-level numbering (e.g. 1., 1.1, 1.1.1)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingNode(true)}
          className="btn-primary add-node-top-btn"
        >
          <Plus size={14} />
          <span>Add Doc to {activeSubTrack}</span>
        </button>
      </div>

      {/* Quick Add Form (Only Code, Title, Link) */}
      {isAddingNode && (
        <form onSubmit={handleAddSubmit} className="inline-add-node-box">
          <div className="add-node-header">
            <span className="add-form-title">
              <Plus size={14} /> Add Note in <strong>{activeSubTrack}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNode(false)}
              className="btn-icon mini-icon-btn"
            >
              <X size={13} />
            </button>
          </div>

          <div className="add-node-inputs">
            <input
              type="text"
              placeholder="Number (e.g. 1.2 or 1.2.1)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="node-input code-input"
            />
            <input
              type="text"
              placeholder="Note Title (e.g. Scaled Dot-Product Attention)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="node-input title-input"
              required
              autoFocus
            />
            <input
              type="url"
              placeholder="Google Docs Link (https://docs.google.com/...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="node-input url-input"
              required
            />
            <button type="submit" className="btn-primary save-node-btn">
              <Check size={14} />
              <span>Add to Tree & Boxes</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= 1. VISUAL TREE NAVIGATOR ================= */}
      <div className="tree-visual-panel">
        <div className="panel-label">
          <Layers size={13} />
          <span>HIERARCHICAL TREE EXPLORER</span>
        </div>

        {currentNodes.length > 0 ? (
          <div className="tree-nodes-list">
            {currentNodes.map((node) => {
              if (isNodeHiddenByParent(node.code)) return null;

              const depth = getNodeDepth(node.code);
              const isCollapsed = collapsedCodes.has(node.code);
              const isEditing = editingId === node.id;

              return (
                <div
                  key={node.id}
                  className={`tree-node-item depth-${Math.min(depth, 3)}`}
                  style={{ paddingLeft: `${depth * 1.5 + 0.6}rem` }}
                >
                  {/* Tree branch guide */}
                  <div className="tree-branch-guide" />

                  {/* Node icon / folder */}
                  {depth === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleToggleCollapse(node.code)}
                      className="collapse-toggle-btn"
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      <Folder size={15} className="folder-icon" />
                    </button>
                  ) : (
                    <div className="doc-icon-badge">
                      <FileText size={14} className="doc-icon" />
                    </div>
                  )}

                  {/* Node Content / Inline Edit */}
                  {isEditing ? (
                    <div className="node-inline-edit-form">
                      <input
                        type="text"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="inline-code-edit"
                      />
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="inline-title-edit"
                      />
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="inline-url-edit"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(node.id)}
                        className="btn-primary mini-btn"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn-secondary mini-btn"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="node-content-row">
                      <span className="node-code-badge">{node.code}</span>
                      <span
                        className="node-title-clickable"
                        onClick={() => handleOpenDoc(node)}
                        title={`Open Google Doc: ${node.url}`}
                      >
                        {node.title}
                      </span>

                      <div className="node-hover-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenDoc(node)}
                          className="action-btn open-doc-btn"
                          title="Open Google Doc"
                        >
                          <ExternalLink size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(node)}
                          className="action-btn edit-node-btn"
                          title="Edit Code, Title or Link"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCascade(node.id, node.code, node.title)}
                          className="action-btn delete-node-btn"
                          title="Delete node and all children"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-tree-state">
            <FileText size={32} className="empty-tree-icon" />
            <p>No notes or docs added to <strong>{activeSubTrack}</strong> yet.</p>
            <button
              onClick={() => setIsAddingNode(true)}
              className="btn-primary mini-add-btn"
            >
              <Plus size={13} />
              <span>Add First Doc (e.g. 1. Intro)</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= 2. STRUCTURED BELOW-TREE BOX GRID ================= */}
      <div className="below-tree-boxes-panel">
        <div className="panel-label">
          <Layers size={13} />
          <span>DOCUMENT TILES FOR {activeSubTrack.toUpperCase()}</span>
        </div>

        <div className="doc-boxes-grid">
          {currentNodes.map((node) => (
            <div key={node.id} className="doc-tile-card bento-card">
              <div className="tile-top-row">
                <span className="tile-code">{node.code}</span>
                <div className="tile-actions">
                  <button
                    onClick={() => handleStartEdit(node)}
                    className="tile-action-btn"
                    title="Edit Note"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteCascade(node.id, node.code, node.title)}
                    className="tile-action-btn delete-btn"
                    title="Delete Note"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h4 className="tile-title">{node.title}</h4>
              <p className="tile-url-preview">{node.url}</p>

              <div className="tile-footer">
                <span className="course-badge">{node.subTrack}</span>
                <button
                  onClick={() => handleOpenDoc(node)}
                  className="open-doc-tile-btn"
                >
                  <span>Open Doc</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* Quick Add Tile */}
          <div
            className="add-doc-tile-placeholder bento-card"
            onClick={() => setIsAddingNode(true)}
          >
            <Plus size={20} className="plus-icon" />
            <span>Add Note to {activeSubTrack}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .course-tree-container {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .tree-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tree-title-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .tree-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2));
          border: 1px solid var(--border-hover);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tree-heading {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .tree-subheading {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .inline-add-node-box {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-hover);
          border-radius: 12px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .add-node-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .add-form-title {
          font-size: 0.82rem;
          color: var(--accent-primary);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .add-node-inputs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .node-input {
          background: var(--bg-input);
          border: 1px solid var(--border-card);
          border-radius: 8px;
          color: var(--text-primary);
          padding: 0.45rem 0.65rem;
          font-size: 0.82rem;
          outline: none;
        }

        .code-input {
          width: 130px;
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .title-input {
          flex: 1;
          min-width: 200px;
        }

        .url-input {
          flex: 1;
          min-width: 220px;
        }

        .save-node-btn {
          padding: 0.45rem 0.85rem;
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .panel-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--accent-primary);
          letter-spacing: 0.05em;
          margin-bottom: 0.65rem;
        }

        .tree-visual-panel {
          background: #090c14;
          border: 1px solid var(--border-card);
          border-radius: 12px;
          padding: 1rem;
          max-height: 420px;
          overflow-y: auto;
        }

        .tree-nodes-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .tree-node-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.5rem;
          border-radius: 8px;
          position: relative;
          transition: var(--transition-smooth);
        }

        .tree-node-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .collapse-toggle-btn {
          background: transparent;
          border: none;
          color: #f59e0b;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .doc-icon-badge {
          display: inline-flex;
          align-items: center;
          color: var(--accent-primary);
        }

        .node-content-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
        }

        .node-code-badge {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--accent-secondary);
          background: rgba(129, 140, 248, 0.15);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }

        .node-title-clickable {
          font-size: 0.86rem;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .node-title-clickable:hover {
          color: var(--accent-primary);
          text-decoration: underline;
        }

        .node-hover-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          opacity: 0.4;
          transition: var(--transition-smooth);
        }

        .tree-node-item:hover .node-hover-actions {
          opacity: 1;
        }

        .action-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          width: 26px;
          height: 26px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .action-btn:hover {
          background: var(--bg-surface-elevated);
          color: var(--text-primary);
          border-color: var(--border-subtle);
        }

        .delete-node-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .node-inline-edit-form {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex: 1;
        }

        .inline-code-edit {
          width: 90px;
          background: var(--bg-input);
          border: 1px solid var(--border-hover);
          color: var(--text-primary);
          padding: 0.25rem 0.45rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-family: var(--font-mono);
        }

        .inline-title-edit,
        .inline-url-edit {
          flex: 1;
          background: var(--bg-input);
          border: 1px solid var(--border-hover);
          color: var(--text-primary);
          padding: 0.25rem 0.45rem;
          border-radius: 6px;
          font-size: 0.78rem;
        }

        .mini-btn {
          padding: 0.25rem 0.5rem;
          height: 28px;
        }

        .empty-tree-state {
          padding: 2.5rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.84rem;
        }

        .empty-tree-icon {
          color: var(--text-muted);
          opacity: 0.5;
        }

        /* BELOW TREE BOXES GRID */
        .below-tree-boxes-panel {
          margin-top: 0.5rem;
        }

        .doc-boxes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .doc-tile-card {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 150px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
        }

        .tile-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tile-code {
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 0.8rem;
          color: var(--accent-primary);
          background: rgba(56, 189, 248, 0.12);
          padding: 0.15rem 0.5rem;
          border-radius: 5px;
        }

        .tile-actions {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .tile-action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.2rem;
        }

        .tile-action-btn:hover {
          color: var(--text-primary);
        }

        .tile-action-btn.delete-btn:hover {
          color: #ef4444;
        }

        .tile-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
          margin-top: 0.3rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tile-url-preview {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tile-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-subtle);
          margin-top: 0.3rem;
        }

        .course-badge {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .open-doc-tile-btn {
          background: var(--bg-surface);
          border: 1px solid var(--border-card);
          color: var(--accent-primary);
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .open-doc-tile-btn:hover {
          background: var(--accent-primary);
          color: #030712;
        }

        .add-doc-tile-placeholder {
          height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 2px dashed var(--border-card);
          background: transparent;
          color: var(--text-muted);
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .add-doc-tile-placeholder:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--bg-glass-card-hover);
        }
      `}</style>
    </div>
  );
};
