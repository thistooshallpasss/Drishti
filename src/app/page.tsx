'use client';

import React from 'react';
import { useDrishti } from '@/context/DrishtiContext';
import { Header } from '@/components/Header';
import { DashboardMasterGrid } from '@/components/DashboardMasterGrid';
import { MasterTileDetailView } from '@/components/MasterTileDetailView';
import { RecentHistoryCard } from '@/components/RecentHistoryCard';
import { ActivityLogCard } from '@/components/ActivityLogCard';
import { DailyVoiceNotesCard } from '@/components/DailyVoiceNotesCard';
import { AddEditLinkModal } from '@/components/AddEditLinkModal';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';

export default function Home() {
  const { activeTileId } = useDrishti();

  return (
    <main className="drishti-app-wrapper">
      {/* Clean Header (Brand, Search bar, Theme switcher, Scale slider, Voice Notes Trigger) */}
      <Header />

      {/* Main Content Area */}
      <div className="main-content-container">
        {activeTileId === null ? (
          /* ================= MAIN DASHBOARD OVERVIEW (DEFAULT) ================= */
          <div className="dashboard-master-stack">
            {/* The 10 Focus & Learning Hub Tiles */}
            <DashboardMasterGrid />

            {/* Daily Voice Journal & Audio-to-Text Dictation Deck */}
            <section id="daily-voice-journal-section" className="dashboard-voice-section">
              <DailyVoiceNotesCard />
            </section>

            {/* Recent History & Activity Tracker Grid */}
            <section className="dashboard-secondary-grid">
              <div className="secondary-col-left">
                <RecentHistoryCard />
              </div>
              <div className="secondary-col-right">
                <ActivityLogCard />
              </div>
            </section>
          </div>
        ) : (
          /* ================= DEDICATED TILE / HUB DRILLDOWN ================= */
          <MasterTileDetailView />
        )}
      </div>

      {/* Global Modals */}
      <AddEditLinkModal />
      <CommandPaletteModal />

      <style jsx>{`
        .drishti-app-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1.75rem 1.75rem 3.5rem 1.75rem;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dashboard-master-stack {
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
        }

        .dashboard-voice-section {
          width: 100%;
        }

        .dashboard-secondary-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 1.5rem;
          align-items: stretch;
        }

        .secondary-col-left,
        .secondary-col-right {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 1080px) {
          .dashboard-secondary-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .main-content-container {
            padding: 1rem;
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .main-content-container {
            padding: 0.6rem 0.6rem 2rem 0.6rem;
            gap: 1rem;
          }
          .dashboard-master-stack {
            gap: 1.25rem;
          }
        }
      `}</style>
    </main>
  );
}
