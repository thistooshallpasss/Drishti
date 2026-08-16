'use client';

import React, { useState, useEffect } from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import {
  Mic,
  MicOff,
  Download,
  Copy,
  Check,
  Trash2,
  Calendar,
  Clock,
  History,
  FileText,
  Sparkles,
  Volume2,
  AlertCircle,
  Archive,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';

export const DailyVoiceNotesCard: React.FC = () => {
  const {
    dailyVoiceNotes,
    todayVoiceEntry,
    appendVoiceNote,
    updateDailyVoiceNote,
    deleteDailyVoiceNote,
    downloadVoiceNoteFile,
    exportAllVoiceNotes,
  } = useDrishti();

  const [copiedDay, setCopiedDay] = useState<string | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [manualNoteText, setManualNoteText] = useState<string>('');
  const [isAddingManual, setIsAddingManual] = useState<boolean>(false);
  const [expandedPastDays, setExpandedPastDays] = useState<Record<string, boolean>>({});

  // Initialize Speech-to-text hook
  const {
    isListening,
    transcript,
    interimTranscript,
    fullLiveTranscript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText({
    onFinalTranscript: (finalText) => {
      if (finalText.trim()) {
        appendVoiceNote(finalText);
      }
    },
  });

  const todayKey = new Date().toISOString().split('T')[0];
  const activeDayKey = selectedDayKey || todayKey;

  const currentDisplayEntry =
    dailyVoiceNotes.find((n) => n.dateKey === activeDayKey) || todayVoiceEntry;

  const todayHeading = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleToggleListening = () => {
    if (isListening) {
      // Stopping: will append recorded transcript
      const textToAppend = transcript.trim() || interimTranscript.trim();
      stopListening();
      if (textToAppend) {
        appendVoiceNote(textToAppend);
        resetTranscript();
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleManualAdd = () => {
    if (!manualNoteText.trim()) return;
    appendVoiceNote(manualNoteText.trim());
    setManualNoteText('');
    setIsAddingManual(false);
  };

  const handleCopyContent = (content: string, dateKey: string) => {
    navigator.clipboard.writeText(content);
    setCopiedDay(dateKey);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  const togglePastDayExpand = (key: string) => {
    setExpandedPastDays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const pastDays = dailyVoiceNotes.filter((n) => n.dateKey !== todayKey);

  return (
    <div className="bento-card voice-notes-container">
      {/* Header */}
      <div className="voice-header">
        <div className="title-group">
          <div className={`mic-status-icon ${isListening ? 'recording' : ''}`}>
            {isListening ? <Volume2 size={18} /> : <Mic size={18} />}
          </div>
          <div>
            <div className="title-row">
              <h3 className="card-title">Daily Voice Journal & Audio Notes</h3>
              <span className="retention-pill">
                <Archive size={11} /> 14-Day Auto Retention
              </span>
            </div>
            <p className="card-sub">
              Audio-to-text dictation with automatic daily append & one-click text file export
            </p>
          </div>
        </div>

        <div className="header-actions">
          {dailyVoiceNotes.length > 0 && (
            <button
              onClick={exportAllVoiceNotes}
              className="btn-action-ghost"
              title="Download all 14-day voice notes as combined text archive"
            >
              <Download size={13} />
              <span>Export All 14 Days</span>
            </button>
          )}

          {pastDays.length > 0 && (
            <button
              onClick={() => setShowHistoryModal(!showHistoryModal)}
              className={`btn-action-ghost ${showHistoryModal ? 'active' : ''}`}
              title="View past 14 days dictation archives"
            >
              <History size={13} />
              <span>History ({pastDays.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dictation Controls Bar */}
      <div className={`dictation-bar ${isListening ? 'active-listening' : ''}`}>
        <div className="mic-action-area">
          <button
            onClick={handleToggleListening}
            className={`btn-mic-record ${isListening ? 'pulse-active' : ''}`}
            title={isListening ? 'Click to Stop & Append' : 'Click to Start Voice Recording'}
          >
            {isListening ? (
              <>
                <div className="soundwaves">
                  <span className="wave bar1"></span>
                  <span className="wave bar2"></span>
                  <span className="wave bar3"></span>
                  <span className="wave bar4"></span>
                  <span className="wave bar5"></span>
                </div>
                <span className="mic-btn-label">Stop & Save Note</span>
              </>
            ) : (
              <>
                <Mic size={18} className="mic-icon" />
                <span className="mic-btn-label">Tap to Speak / Dictate</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAddingManual(!isAddingManual)}
            className="btn-manual-add"
            title="Type a quick manual note instead of voice"
          >
            <Plus size={14} />
            <span>Type Note</span>
          </button>
        </div>

        {/* Live Audio Status */}
        <div className="live-status-info">
          {isListening ? (
            <div className="recording-status">
              <span className="red-pulse-dot"></span>
              <span className="live-status-text">
                Listening in real-time... Speak into your microphone
              </span>
            </div>
          ) : (
            <div className="idle-status">
              <Sparkles size={13} color="#a855f7" />
              <span className="idle-status-text">
                Tap the mic anytime today — notes automatically append below
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live Stream Transcript Preview (When Recording) */}
      {isListening && (
        <div className="live-stream-preview">
          <div className="stream-header">
            <span className="stream-label">🎙️ Live Voice Transcription:</span>
          </div>
          <p className="stream-text">
            {fullLiveTranscript || (
              <span className="stream-placeholder">Say something... your voice will appear here live...</span>
            )}
          </p>
        </div>
      )}

      {/* Speech Error Warning */}
      {speechError && (
        <div className="speech-error-box">
          <AlertCircle size={14} />
          <span>{speechError}</span>
        </div>
      )}

      {!isSupported && (
        <div className="speech-error-box">
          <AlertCircle size={14} />
          <span>Web Speech API is not supported in this browser. Please use Google Chrome, Edge, Safari, or Brave.</span>
        </div>
      )}

      {/* Manual Add Input Box */}
      {isAddingManual && (
        <div className="manual-input-wrap">
          <textarea
            value={manualNoteText}
            onChange={(e) => setManualNoteText(e.target.value)}
            placeholder="Type your notes or insights for today here..."
            className="manual-textarea"
            rows={3}
          />
          <div className="manual-btn-row">
            <button onClick={() => setIsAddingManual(false)} className="btn-cancel-sm">
              Cancel
            </button>
            <button onClick={handleManualAdd} className="btn-save-sm">
              Append to Today
            </button>
          </div>
        </div>
      )}

      {/* Today's Active Note Sheet */}
      <div className="today-sheet-container">
        <div className="sheet-top-meta">
          <div className="sheet-date-title">
            <Calendar size={15} color="#38bdf8" />
            <span className="sheet-heading-text">
              {currentDisplayEntry ? currentDisplayEntry.fullDateHeading : todayHeading}
            </span>
            {currentDisplayEntry && (
              <span className="sessions-badge">
                {currentDisplayEntry.sessionsCount} {currentDisplayEntry.sessionsCount === 1 ? 'session' : 'sessions'}
              </span>
            )}
          </div>

          <div className="sheet-actions">
            {currentDisplayEntry && (
              <>
                <button
                  onClick={() => downloadVoiceNoteFile(currentDisplayEntry.dateKey)}
                  className="btn-icon-pill"
                  title="Download this day's notes as a .txt file"
                >
                  <Download size={13} />
                  <span>Download .txt</span>
                </button>

                <button
                  onClick={() => handleCopyContent(currentDisplayEntry.content, currentDisplayEntry.dateKey)}
                  className="btn-icon-pill"
                  title="Copy day's notes to clipboard"
                >
                  {copiedDay === currentDisplayEntry.dateKey ? (
                    <>
                      <Check size={13} color="#10b981" />
                      <span style={{ color: '#10b981' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete notes for ${currentDisplayEntry.fullDateHeading}?`)) {
                      deleteDailyVoiceNote(currentDisplayEntry.id);
                    }
                  }}
                  className="btn-icon-pill danger"
                  title="Delete this day's notes"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="sheet-body">
          {currentDisplayEntry ? (
            <textarea
              value={currentDisplayEntry.content}
              onChange={(e) => updateDailyVoiceNote(currentDisplayEntry.id, e.target.value)}
              className="sheet-textarea"
              placeholder="Your voice transcripts for today will appear here..."
              spellCheck={false}
            />
          ) : (
            <div className="sheet-empty-state">
              <div className="empty-mic-circle">
                <Mic size={24} color="#64748b" />
              </div>
              <p className="empty-title">No voice notes recorded yet for today</p>
              <p className="empty-sub">
                Click <strong>&quot;Tap to Speak / Dictate&quot;</strong> above to record your first thought, algorithm, or insight.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 14-Day History Section / Past Days Accordion */}
      {showHistoryModal && pastDays.length > 0 && (
        <div className="history-drawer">
          <div className="history-header">
            <div className="history-title-row">
              <History size={15} color="#a855f7" />
              <h4>14-Day Voice Archive (Previous Days)</h4>
            </div>
            <span className="history-info-badge">Auto-purges after 2 weeks</span>
          </div>

          <div className="past-days-list">
            {pastDays.map((entry) => {
              const isExpanded = expandedPastDays[entry.dateKey];
              return (
                <div key={entry.id} className="past-day-card">
                  <div className="past-day-header" onClick={() => togglePastDayExpand(entry.dateKey)}>
                    <div className="past-day-meta">
                      <FileText size={14} color="#38bdf8" />
                      <span className="past-day-title">{entry.fullDateHeading}</span>
                      <span className="past-sessions-pill">{entry.sessionsCount} sessions</span>
                    </div>

                    <div className="past-day-ctrls" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => downloadVoiceNoteFile(entry.dateKey)}
                        className="btn-past-action"
                        title="Download .txt"
                      >
                        <Download size={12} />
                        <span>.txt</span>
                      </button>

                      <button
                        onClick={() => handleCopyContent(entry.content, entry.dateKey)}
                        className="btn-past-action"
                        title="Copy"
                      >
                        {copiedDay === entry.dateKey ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete archive for ${entry.fullDateHeading}?`)) {
                            deleteDailyVoiceNote(entry.id);
                          }
                        }}
                        className="btn-past-action danger"
                        title="Delete Day"
                      >
                        <Trash2 size={12} />
                      </button>

                      <button
                        onClick={() => togglePastDayExpand(entry.dateKey)}
                        className="btn-past-action toggle"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="past-day-content-wrap">
                      <textarea
                        value={entry.content}
                        onChange={(e) => updateDailyVoiceNote(entry.id, e.target.value)}
                        className="past-day-textarea"
                        rows={6}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .voice-notes-container {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-card);
          border-radius: 16px;
        }

        .voice-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mic-status-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(168, 85, 247, 0.12);
          color: #a855f7;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .mic-status-icon.recording {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          animation: pulseIcon 1.5s infinite;
        }

        @keyframes pulseIcon {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .retention-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.25);
          font-size: 0.68rem;
          font-weight: 600;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
        }

        .card-sub {
          font-size: 0.74rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-action-ghost {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-secondary);
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action-ghost:hover {
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-action-ghost.active {
          background: rgba(168, 85, 247, 0.15);
          border-color: rgba(168, 85, 247, 0.4);
          color: #c084fc;
        }

        /* Dictation Bar */
        .dictation-bar {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          transition: border-color 0.3s ease;
        }

        .dictation-bar.active-listening {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.04);
        }

        .mic-action-area {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .btn-mic-record {
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          color: #ffffff;
          border: none;
          padding: 0.55rem 1.1rem;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
          transition: all 0.25s ease;
        }

        .btn-mic-record:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);
        }

        .btn-mic-record.pulse-active {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
          animation: pulseBtn 1.5s infinite;
        }

        @keyframes pulseBtn {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .soundwaves {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 14px;
        }

        .wave {
          display: block;
          width: 3px;
          background: #ffffff;
          border-radius: 2px;
          animation: soundWave 1.2s infinite ease-in-out;
        }

        .bar1 { height: 6px; animation-delay: 0.1s; }
        .bar2 { height: 12px; animation-delay: 0.2s; }
        .bar3 { height: 16px; animation-delay: 0.3s; }
        .bar4 { height: 10px; animation-delay: 0.4s; }
        .bar5 { height: 5px; animation-delay: 0.5s; }

        @keyframes soundWave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.4); }
        }

        .btn-manual-add {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-secondary);
          padding: 0.55rem 0.85rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-manual-add:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .live-status-info {
          display: flex;
          align-items: center;
        }

        .recording-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .red-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: pulseRed 1s infinite;
        }

        @keyframes pulseRed {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
          100% { opacity: 1; transform: scale(1); }
        }

        .idle-status {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        /* Live Stream Preview */
        .live-stream-preview {
          background: rgba(168, 85, 247, 0.06);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stream-header {
          font-size: 0.72rem;
          font-weight: 700;
          color: #c084fc;
          margin-bottom: 0.35rem;
        }

        .stream-text {
          font-size: 0.86rem;
          line-height: 1.5;
          color: #f1f5f9;
          font-family: var(--font-mono);
        }

        .stream-placeholder {
          color: var(--text-muted);
          font-style: italic;
        }

        .speech-error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.5rem 0.85rem;
          border-radius: 8px;
          font-size: 0.76rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        /* Manual Input Wrap */
        .manual-input-wrap {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-card);
          border-radius: 10px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .manual-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.6rem;
          color: #e2e8f0;
          font-size: 0.82rem;
          font-family: var(--font-sans);
          outline: none;
          resize: vertical;
        }

        .manual-btn-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .btn-cancel-sm {
          background: transparent;
          border: 1px solid var(--border-card);
          color: var(--text-muted);
          padding: 0.3rem 0.7rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .btn-save-sm {
          background: #7c3aed;
          border: none;
          color: #ffffff;
          padding: 0.3rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* Today's Sheet */
        .today-sheet-container {
          background: #090d14;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          min-height: 200px;
        }

        .sheet-top-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 0.6rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .sheet-date-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sheet-heading-text {
          font-size: 0.88rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .sessions-badge {
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.2);
          font-size: 0.68rem;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .sheet-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-icon-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-icon-pill:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-icon-pill.danger:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.1);
        }

        .sheet-body {
          flex: 1;
          display: flex;
        }

        .sheet-textarea {
          width: 100%;
          min-height: 170px;
          background: transparent;
          border: none;
          outline: none;
          color: #e2e8f0;
          font-family: var(--font-mono);
          font-size: 0.84rem;
          line-height: 1.6;
          resize: vertical;
        }

        .sheet-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.5rem 1rem;
          width: 100%;
          gap: 0.4rem;
        }

        .empty-mic-circle {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
        }

        .empty-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .empty-sub {
          font-size: 0.76rem;
          color: var(--text-muted);
          max-width: 420px;
        }

        /* History Drawer */
        .history-drawer {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          animation: slideDown 0.25s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.45rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .history-title-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .history-header h4 {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .history-info-badge {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .past-days-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          max-height: 280px;
          overflow-y: auto;
        }

        .past-day-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          overflow: hidden;
        }

        .past-day-header {
          padding: 0.55rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .past-day-header:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .past-day-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .past-day-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .past-sessions-pill {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          font-size: 0.66rem;
          padding: 0.05rem 0.35rem;
          border-radius: 4px;
        }

        .past-day-ctrls {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .btn-past-action {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
          padding: 0.2rem 0.45rem;
          border-radius: 5px;
          font-size: 0.68rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
        }

        .btn-past-action:hover {
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .btn-past-action.danger:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }

        .btn-past-action.toggle {
          padding: 0.2rem 0.3rem;
        }

        .past-day-content-wrap {
          padding: 0.6rem 0.75rem;
          background: #070a0f;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .past-day-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #cbd5e1;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          line-height: 1.5;
          resize: vertical;
        }

        @media (max-width: 640px) {
          .voice-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .dictation-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .sheet-top-meta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
