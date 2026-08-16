'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  MasterTileId,
  MasterTileInfo,
  DeepLinkItem,
  RevisionFlashcardItem,
  TechNewsItem,
  DrishtiSettings,
  LinkCategory,
  ThemeMode,
  RevisionCategory,
  CourseTreeNode,
  ActivityLogItem,
  DailyVoiceEntry,
} from '@/types';
import {
  MASTER_TILES,
  INITIAL_LINKS,
  INITIAL_REVISION_CARDS,
  INITIAL_TECH_NEWS,
  INITIAL_SETTINGS,
  INITIAL_COURSE_TREE_NODES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_DAILY_VOICE_NOTES,
} from '@/data/initialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface DrishtiContextType {
  isCloudConnected: boolean;
  syncError: string | null;
  setSyncError: (err: string | null) => void;
  masterTiles: MasterTileInfo[];
  activeTileId: MasterTileId | null;
  setActiveTileId: (id: MasterTileId | null) => void;
  activeSubTrack: string;
  setActiveSubTrack: (track: string) => void;
  customSubTracks: Record<string, string[]>;
  getSubTracksForTile: (tileId: MasterTileId) => string[];
  addCustomSubTrack: (tileId: MasterTileId, name: string) => void;
  deleteCustomSubTrack: (tileId: MasterTileId, name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  links: DeepLinkItem[];
  filteredLinks: DeepLinkItem[];
  activeLinkCategory: LinkCategory;
  setActiveLinkCategory: (cat: LinkCategory) => void;
  addLink: (title: string, url: string, category?: LinkCategory) => void;
  updateLink: (id: string, updates: Partial<DeepLinkItem>) => void;
  deleteLink: (id: string) => void;
  togglePinLink: (id: string) => void;
  recordLinkClick: (id: string) => void;
  treeNodes: CourseTreeNode[];
  addTreeNode: (code: string, title: string, url: string, masterTileId?: MasterTileId, subTrack?: string) => void;
  updateTreeNode: (id: string, updates: Partial<CourseTreeNode>) => void;
  deleteTreeNodeCascade: (id: string) => void;
  revisionCards: RevisionFlashcardItem[];
  filteredRevisionCards: RevisionFlashcardItem[];
  activeRevisionCategory: RevisionCategory;
  setActiveRevisionCategory: (cat: RevisionCategory) => void;
  activeCardIndex: number;
  setActiveCardIndex: (index: number) => void;
  nextRevisionCard: () => void;
  prevRevisionCard: () => void;
  shuffleRevisionCards: () => void;
  addRevisionCard: (title: string, linkOrSummary: string, category?: RevisionCategory, tileId?: MasterTileId) => void;
  updateRevisionCard: (id: string, updates: Partial<RevisionFlashcardItem>) => void;
  deleteRevisionCard: (id: string) => void;
  toggleMasteryStatus: (id: string) => void;
  activityLogs: ActivityLogItem[];
  logActivity: (title: string, url: string, category: string, type: 'link' | 'doc_tree' | 'flashcard') => void;
  recentOpenedHistory: ActivityLogItem[];
  exportLogs: (timeframe: 'daily' | 'weekly' | 'monthly' | 'all') => void;
  newsItems: TechNewsItem[];
  scratchpadContent: string;
  setScratchpadContent: (content: string) => void;
  flushScratchpadToCloud: (content: string) => void;
  scratchpadLanguage: string;
  setScratchpadLanguage: (lang: string) => void;
  dailyVoiceNotes: DailyVoiceEntry[];
  todayVoiceEntry: DailyVoiceEntry | null;
  appendVoiceNote: (transcript: string) => void;
  updateDailyVoiceNote: (id: string, newContent: string) => void;
  deleteDailyVoiceNote: (id: string) => void;
  downloadVoiceNoteFile: (dateKey: string) => void;
  exportAllVoiceNotes: () => void;
  isVoiceDictationModalOpen: boolean;
  setIsVoiceDictationModalOpen: (open: boolean) => void;
  settings: DrishtiSettings;
  setTheme: (theme: ThemeMode) => void;
  setUiScale: (scale: number) => void;
  updateSettings: (updates: Partial<DrishtiSettings>) => void;
  isAddLinkModalOpen: boolean;
  setIsAddLinkModalOpen: (open: boolean) => void;
  defaultModalCategory: LinkCategory;
  setDefaultModalCategory: (cat: LinkCategory) => void;
  editingLink: DeepLinkItem | null;
  setEditingLink: (link: DeepLinkItem | null) => void;
  isAddRevisionModalOpen: boolean;
  setIsAddRevisionModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  exportDataJson: () => void;
  resetToDefaults: () => void;
}

const DrishtiContext = createContext<DrishtiContextType | undefined>(undefined);

const STORAGE_KEY_LINKS = 'drishti_links_v5';
const STORAGE_KEY_TREE = 'drishti_tree_v5';
const STORAGE_KEY_REVISION = 'drishti_revision_v5';
const STORAGE_KEY_LOGS = 'drishti_logs_v5';
const STORAGE_KEY_SETTINGS = 'drishti_settings_v5';
const STORAGE_KEY_SCRATCHPAD = 'drishti_scratchpad_v5';
const STORAGE_KEY_CUSTOM_SUBTRACKS = 'drishti_custom_subtracks_v5';
const STORAGE_KEY_VOICE_NOTES = 'drishti_voice_notes_v5';
const ECHO_GUARD_TTL_MS = 3000;

export const DrishtiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  // Issue #18: warn immediately if Supabase env vars are missing (not just on failure)
  const [syncError, setSyncError] = useState<string | null>(
    !isSupabaseConfigured()
      ? 'Cloud sync disabled — NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Running in local-only mode.'
      : null
  );
  const recentMutations = useRef<Map<string, number>>(new Map());

  const trackMutation = (id: string) => {
    recentMutations.current.set(id, Date.now());
  };

  const isOwnMutation = (id: string): boolean => {
    const ts = recentMutations.current.get(id);
    if (!ts) return false;
    if (Date.now() - ts < ECHO_GUARD_TTL_MS) return true;
    recentMutations.current.delete(id);
    return false;
  };

  const [masterTiles] = useState<MasterTileInfo[]>(MASTER_TILES);
  const [activeTileId, setActiveTileId] = useState<MasterTileId | null>(null);
  const [activeSubTrack, setActiveSubTrack] = useState<string>('Large Language Models (LLM)');
  const [customSubTracks, setCustomSubTracks] = useState<Record<string, string[]>>({});
  const [links, setLinks] = useState<DeepLinkItem[]>(INITIAL_LINKS);
  const [treeNodes, setTreeNodes] = useState<CourseTreeNode[]>(INITIAL_COURSE_TREE_NODES);
  const [revisionCards, setRevisionCards] = useState<RevisionFlashcardItem[]>(INITIAL_REVISION_CARDS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [newsItems] = useState<TechNewsItem[]>(INITIAL_TECH_NEWS);
  const [settings, setSettings] = useState<DrishtiSettings>(INITIAL_SETTINGS);
  const [scratchpadContent, setScratchpadContentState] = useState<string>(
    `# Drishti Quick Scratchpad\n\n# SDE / AI Problem solving scratch area\n# Auto-saved to Cloud & local memory\n\ndef solve_problem(inputs):\n    return sorted(inputs, reverse=True)\n`
  );
  const [scratchpadLanguage, setScratchpadLanguage] = useState<string>('python');
  const [activeLinkCategory, setActiveLinkCategory] = useState<LinkCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRevisionCategory, setActiveRevisionCategory] = useState<RevisionCategory>('All');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [defaultModalCategory, setDefaultModalCategory] = useState<LinkCategory>('ai');
  const [editingLink, setEditingLink] = useState<DeepLinkItem | null>(null);
  const [isAddRevisionModalOpen, setIsAddRevisionModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isVoiceDictationModalOpen, setIsVoiceDictationModalOpen] = useState(false);
  const [dailyVoiceNotes, setDailyVoiceNotes] = useState<DailyVoiceEntry[]>(INITIAL_DAILY_VOICE_NOTES);

  // 14-Day (2-Week) Rolling Retention Filter - Automatically purges entries older than 14 days
  const filter14DayVoiceNotes = useCallback((rawNotes: DailyVoiceEntry[]): DailyVoiceEntry[] => {
    const now = new Date().getTime();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    return (rawNotes || []).filter((note) => {
      if (!note || !note.dateKey) return false;
      const noteTime = new Date(note.dateKey).getTime();
      return (now - noteTime) <= fourteenDaysMs;
    });
  }, []);

  const todayKey = new Date().toISOString().split('T')[0];
  const todayVoiceEntry = useMemo(() => {
    return dailyVoiceNotes.find((entry) => entry.dateKey === todayKey) || null;
  }, [dailyVoiceNotes, todayKey]);

  const getSubTracksForTile = useCallback(
    (tileId: MasterTileId): string[] => {
      const custom = customSubTracks[tileId] || [];
      return custom;
    },
    [customSubTracks]
  );

  const addCustomSubTrack = useCallback((tileId: MasterTileId, name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setCustomSubTracks((prev) => {
      const existing = prev[tileId] || [];
      if (existing.includes(cleanName)) return prev;
      const updated = { ...prev, [tileId]: [...existing, cleanName] };
      try { localStorage.setItem(STORAGE_KEY_CUSTOM_SUBTRACKS, JSON.stringify(updated)); } catch (e) {}
      if (supabase && isSupabaseConfigured()) {
        supabase.from('drishti_settings').upsert({ id: 'master_config', custom_subtracks: updated }).then();
      }
      return updated;
    });
    setActiveSubTrack(cleanName);
  }, []);

  const deleteCustomSubTrack = useCallback((tileId: MasterTileId, name: string) => {
    setCustomSubTracks((prev) => {
      const existing = prev[tileId] || [];
      const updated = { ...prev, [tileId]: existing.filter((t) => t !== name) };
      try { localStorage.setItem(STORAGE_KEY_CUSTOM_SUBTRACKS, JSON.stringify(updated)); } catch (e) {}
      if (supabase && isSupabaseConfigured()) {
        supabase.from('drishti_settings').upsert({ id: 'master_config', custom_subtracks: updated }).then();
      }
      return updated;
    });
    setTreeNodes((prev) => prev.filter((n) => !(n.masterTileId === tileId && n.subTrack === name)));
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_tree_nodes').delete().eq('master_tile_id', tileId).eq('sub_track', name).then();
    }
    const remaining = getSubTracksForTile(tileId).filter((t) => t !== name);
    if (remaining.length > 0) setActiveSubTrack(remaining[0]);
  }, [getSubTracksForTile]);

  useEffect(() => {
    if (activeTileId) {
      const tracks = getSubTracksForTile(activeTileId);
      if (tracks.length > 0 && !tracks.includes(activeSubTrack)) {
        setActiveSubTrack(tracks[0]);
      }
    }
  }, [activeTileId, getSubTracksForTile, activeSubTrack]);

  const filter60DayLogs = useCallback((rawLogs: ActivityLogItem[]): ActivityLogItem[] => {
    const now = new Date().getTime();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
    return rawLogs.filter((log) => now - new Date(log.timestamp).getTime() <= sixtyDaysMs);
  }, []);

  const fetchFromCloud = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured()) return;
    try {
      const { data: dbLinks, error: linkErr } = await supabase.from('drishti_links').select('*').order('order_index', { ascending: true });
      if (linkErr) throw linkErr;
      if (dbLinks !== null) {
        setLinks(dbLinks.map((row) => ({
          id: row.id, title: row.title, url: row.url,
          category: row.category as LinkCategory, description: row.description,
          isPinned: row.is_pinned, orderIndex: row.order_index,
          iconType: row.icon_type, iconValue: row.icon_value,
          tags: row.tags || [], badge: row.badge, accentColor: row.accent_color,
          clickCount: row.click_count, lastVisited: row.last_visited, createdAt: row.created_at,
        })));
      }

      const { data: dbTree, error: treeErr } = await supabase.from('drishti_tree_nodes').select('*').order('created_at', { ascending: true });
      if (treeErr) throw treeErr;
      if (dbTree !== null) {
        setTreeNodes(dbTree.map((row) => ({
          id: row.id, masterTileId: row.master_tile_id as MasterTileId,
          subTrack: row.sub_track, code: row.code, title: row.title,
          url: row.url, notesSnippet: row.notes_snippet, createdAt: row.created_at,
        })));
      }

      const { data: dbCards, error: cardErr } = await supabase.from('drishti_revision_cards').select('*').order('created_at', { ascending: false });
      if (cardErr) throw cardErr;
      if (dbCards !== null) {
        setRevisionCards(dbCards.map((row) => ({
          id: row.id, masterTileId: row.master_tile_id as MasterTileId,
          category: row.category as RevisionCategory, question: row.question,
          difficulty: row.difficulty, hint: row.hint, tags: row.tags || [],
          answerSummary: row.answer_summary, answerMarkdown: row.answer_markdown,
          keyTakeaways: row.key_takeaways || [], masteryStatus: row.mastery_status,
          reviewCount: row.review_count, createdAt: row.created_at,
        })));
      }

      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data: dbLogs, error: logErr } = await supabase.from('drishti_activity_logs').select('*').gte('timestamp', sixtyDaysAgo).order('timestamp', { ascending: false });
      if (logErr) throw logErr;
      if (dbLogs !== null) {
        setActivityLogs(dbLogs.map((row) => ({
          id: row.id, title: row.title, url: row.url, category: row.category,
          type: row.type, timestamp: row.timestamp, dateStr: row.date_str, timeStr: row.time_str,
        })));
      }

      const { data: dbSettings } = await supabase.from('drishti_settings').select('*').eq('id', 'master_config').single();
      if (dbSettings) {
        if (dbSettings.scratchpad_content) setScratchpadContentState(dbSettings.scratchpad_content);
        if (dbSettings.theme) setSettings((prev) => ({ ...prev, theme: dbSettings.theme as ThemeMode, uiScale: dbSettings.ui_scale || 100 }));
        if (dbSettings.custom_subtracks) setCustomSubTracks(dbSettings.custom_subtracks);
      }

      setSyncError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[Supabase Fetch Error]', err);
      setSyncError(`Cloud sync failed: ${msg}`);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const savedLinks = localStorage.getItem(STORAGE_KEY_LINKS);
        if (savedLinks) setLinks(JSON.parse(savedLinks));
        const savedTree = localStorage.getItem(STORAGE_KEY_TREE);
        if (savedTree) setTreeNodes(JSON.parse(savedTree));
        const savedRevision = localStorage.getItem(STORAGE_KEY_REVISION);
        if (savedRevision) setRevisionCards(JSON.parse(savedRevision));
        const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
        if (savedLogs) setActivityLogs(filter60DayLogs(JSON.parse(savedLogs)));
        const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        const savedScratch = localStorage.getItem(STORAGE_KEY_SCRATCHPAD);
        if (savedScratch) setScratchpadContentState(savedScratch);
        const savedSubTracks = localStorage.getItem(STORAGE_KEY_CUSTOM_SUBTRACKS);
        if (savedSubTracks) setCustomSubTracks(JSON.parse(savedSubTracks));
        const savedVoice = localStorage.getItem(STORAGE_KEY_VOICE_NOTES);
        if (savedVoice) setDailyVoiceNotes(filter14DayVoiceNotes(JSON.parse(savedVoice)));
      } catch (e) { console.warn('Local storage read error', e); }
      await fetchFromCloud();
    };
    initData();
  }, [filter60DayLogs, filter14DayVoiceNotes, fetchFromCloud]);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) return;
    const channel = supabase
      .channel('drishti-live-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drishti_links' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          if (isOwnMutation(row.id)) return;
          setLinks((prev) => {
            if (prev.some((l) => l.id === row.id)) return prev;
            return [{ id: row.id, title: row.title, url: row.url, category: row.category as LinkCategory,
              description: row.description, isPinned: row.is_pinned, orderIndex: row.order_index,
              iconType: row.icon_type, iconValue: row.icon_value, tags: row.tags || [],
              badge: row.badge, accentColor: row.accent_color, clickCount: row.click_count,
              lastVisited: row.last_visited, createdAt: row.created_at,
            }, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          if (isOwnMutation(row.id)) return;
          // Issue #14: skip stale out-of-order events using updated_at timestamp
          setLinks((prev) => prev.map((l) => {
            if (l.id !== row.id) return l;
            if (row.updated_at && l.createdAt && new Date(row.updated_at) < new Date(l.createdAt)) return l;
            return {
              ...l, title: row.title, url: row.url, category: row.category as LinkCategory,
              description: row.description, isPinned: row.is_pinned, orderIndex: row.order_index,
              iconType: row.icon_type, iconValue: row.icon_value, tags: row.tags || [],
              badge: row.badge, accentColor: row.accent_color, clickCount: row.click_count,
              lastVisited: row.last_visited,
            };
          }));
        } else if (payload.eventType === 'DELETE') {
          setLinks((prev) => prev.filter((l) => l.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drishti_tree_nodes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          if (isOwnMutation(row.id)) return;
          setTreeNodes((prev) => {
            if (prev.some((t) => t.id === row.id)) return prev;
            return [...prev, { id: row.id, masterTileId: row.master_tile_id as MasterTileId,
              subTrack: row.sub_track, code: row.code, title: row.title,
              url: row.url, notesSnippet: row.notes_snippet, createdAt: row.created_at,
            }];
          });
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          if (isOwnMutation(row.id)) return;
          // Issue #14: skip stale out-of-order events
          setTreeNodes((prev) => prev.map((t) => {
            if (t.id !== row.id) return t;
            if (row.updated_at && t.createdAt && new Date(row.updated_at) < new Date(t.createdAt)) return t;
            return {
              ...t, code: row.code, title: row.title, url: row.url,
              subTrack: row.sub_track, notesSnippet: row.notes_snippet,
              masterTileId: row.master_tile_id as MasterTileId,
            };
          }));
        } else if (payload.eventType === 'DELETE') {
          setTreeNodes((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drishti_revision_cards' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          if (isOwnMutation(row.id)) return;
          setRevisionCards((prev) => {
            if (prev.some((c) => c.id === row.id)) return prev;
            return [{ id: row.id, masterTileId: row.master_tile_id as MasterTileId,
              category: row.category as RevisionCategory, question: row.question,
              difficulty: row.difficulty, hint: row.hint, tags: row.tags || [],
              answerSummary: row.answer_summary, answerMarkdown: row.answer_markdown,
              keyTakeaways: row.key_takeaways || [], masteryStatus: row.mastery_status,
              reviewCount: row.review_count, createdAt: row.created_at,
            }, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          if (isOwnMutation(row.id)) return;
          // Issue #14: skip stale out-of-order events
          setRevisionCards((prev) => prev.map((c) => {
            if (c.id !== row.id) return c;
            if (row.updated_at && c.createdAt && new Date(row.updated_at) < new Date(c.createdAt)) return c;
            return {
              ...c, question: row.question, difficulty: row.difficulty, hint: row.hint,
              tags: row.tags || [], answerSummary: row.answer_summary,
              answerMarkdown: row.answer_markdown, keyTakeaways: row.key_takeaways || [],
              masteryStatus: row.mastery_status, reviewCount: row.review_count,
              category: row.category as RevisionCategory, masterTileId: row.master_tile_id as MasterTileId,
            };
          }));
        } else if (payload.eventType === 'DELETE') {
          setRevisionCards((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drishti_settings' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const row = payload.new;
          // Issue #7: apply fields selectively — only update what changed
          // so device A saving scratchpad won't overwrite device B's local theme/scale
          if (row.scratchpad_content !== undefined && !isOwnMutation('settings-scratchpad')) {
            setScratchpadContentState(row.scratchpad_content);
          }
          // Only apply theme/scale from cloud if we haven't set them locally in the last 5s
          if (row.theme && !isOwnMutation('settings-theme')) {
            setSettings((prev) => ({ ...prev, theme: row.theme as ThemeMode }));
          }
          if (row.ui_scale && !isOwnMutation('settings-scale')) {
            setSettings((prev) => ({ ...prev, uiScale: Math.min(120, Math.max(80, row.ui_scale)) }));
          }
          if (row.custom_subtracks) {
            setCustomSubTracks(row.custom_subtracks);
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsCloudConnected(true);
          setSyncError(null);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsCloudConnected(false);
          setSyncError(`Realtime channel ${status.toLowerCase().replace('_', ' ')} — live changes may not sync`);
        }
      });

    return () => { if (supabase) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) return;
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible') fetchFromCloud(); };
    const handleOnline = () => fetchFromCloud();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchFromCloud]);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links)); } catch (e) {} }, [links]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY_TREE, JSON.stringify(treeNodes)); } catch (e) {} }, [treeNodes]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY_REVISION, JSON.stringify(revisionCards)); } catch (e) {} }, [revisionCards]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs)); } catch (e) {} }, [activityLogs]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      document.documentElement.setAttribute('data-theme', settings.theme);
      document.documentElement.style.setProperty('--ui-scale', (settings.uiScale / 100).toString());
    } catch (e) {}
  }, [settings]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY_SCRATCHPAD, scratchpadContent); } catch (e) {} }, [scratchpadContent]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY_VOICE_NOTES, JSON.stringify(dailyVoiceNotes)); } catch (e) {} }, [dailyVoiceNotes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen((prev) => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const logActivity = (title: string, url: string, category: string, type: 'link' | 'doc_tree' | 'flashcard') => {
    const now = new Date();
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`, title, url, category, type,
      timestamp: now.toISOString(),
      dateStr: now.toISOString().split('T')[0],
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setActivityLogs((prev) => filter60DayLogs([newLog, ...prev]));
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_activity_logs').insert({
        id: newLog.id, title: newLog.title, url: newLog.url, category: newLog.category,
        type: newLog.type, timestamp: newLog.timestamp, date_str: newLog.dateStr, time_str: newLog.timeStr,
      }).then(({ error }) => { if (error) { console.error('[Supabase Log Insert Error]', error); setSyncError(`Failed to log activity: ${error.message}`); } });
    }
  };

  const recentOpenedHistory = useMemo(() => {
    const seen = new Set<string>();
    const recents: ActivityLogItem[] = [];
    for (const item of activityLogs) {
      const key = `${item.title}-${item.url}`;
      if (!seen.has(key)) { seen.add(key); recents.push(item); if (recents.length >= 10) break; }
    }
    return recents;
  }, [activityLogs]);

  const addLink = (title: string, url: string, category: LinkCategory = 'ai') => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) cleanUrl = `https://${cleanUrl}`;
    const item: DeepLinkItem = {
      id: `link-${Date.now()}`, title: title.trim(), url: cleanUrl, category,
      isPinned: false, orderIndex: links.length, iconType: 'favicon', iconValue: cleanUrl,
      tags: [category.toUpperCase()], clickCount: 0, createdAt: new Date().toISOString().split('T')[0],
    };
    trackMutation(item.id);
    setLinks((prev) => [item, ...prev]);
    logActivity(item.title, item.url, item.category, 'link');
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_links').upsert({
        id: item.id, title: item.title, url: item.url, category: item.category,
        description: item.description || '', is_pinned: item.isPinned, order_index: item.orderIndex,
        tags: item.tags, badge: item.badge || '', click_count: item.clickCount, last_visited: item.lastVisited || '',
      }).then(({ error }) => { if (error) { console.error('[Supabase Link Add Error]', error); setSyncError(`Failed to save link: ${error.message}`); } });
    }
  };

  const updateLink = (id: string, updates: Partial<DeepLinkItem>) => {
    trackMutation(id);
    setLinks((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      const target = updated.find((item) => item.id === id);
      if (target && supabase && isSupabaseConfigured()) {
        supabase.from('drishti_links').upsert({
          id: target.id, title: target.title, url: target.url, category: target.category,
          description: target.description || '', is_pinned: target.isPinned, order_index: target.orderIndex,
          tags: target.tags || [], badge: target.badge || '', click_count: target.clickCount,
          last_visited: target.lastVisited || '', updated_at: new Date().toISOString(),
        }).then(({ error }) => { if (error) { console.error('[Supabase Link Update Error]', error); setSyncError(`Failed to update link: ${error.message}`); } });
      }
      return updated;
    });
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_links').delete().eq('id', id)
        .then(({ error }) => { if (error) { console.error('[Supabase Link Delete Error]', error); setSyncError(`Failed to delete link: ${error.message}`); } });
    }
  };

  const togglePinLink = (id: string) => {
    const target = links.find((l) => l.id === id);
    if (target) updateLink(id, { isPinned: !target.isPinned });
  };

  const recordLinkClick = (id: string) => {
    const targetLink = links.find((l) => l.id === id);
    if (targetLink) {
      logActivity(targetLink.title, targetLink.url, targetLink.category, 'link');
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updateLink(id, { clickCount: targetLink.clickCount + 1, lastVisited: nowStr });
    }
  };

  const addTreeNode = (code: string, title: string, url: string, masterTileId: MasterTileId = activeTileId || 'ai', subTrack: string = activeSubTrack) => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) cleanUrl = `https://${cleanUrl}`;
    const cleanSubTrack = (subTrack || activeSubTrack || 'General').trim();
    const newNode: CourseTreeNode = {
      id: `tree-${Date.now()}`, masterTileId, subTrack: cleanSubTrack,
      code: code.trim(), title: title.trim(), url: cleanUrl,
      createdAt: new Date().toISOString().split('T')[0],
    };
    trackMutation(newNode.id);
    setTreeNodes((prev) => [...prev, newNode]);
    logActivity(`${newNode.code} ${newNode.title}`, newNode.url, `${masterTileId} / ${cleanSubTrack}`, 'doc_tree');
    addCustomSubTrack(masterTileId, cleanSubTrack);
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_tree_nodes').upsert({
        id: newNode.id, master_tile_id: newNode.masterTileId, sub_track: newNode.subTrack,
        code: newNode.code, title: newNode.title, url: newNode.url,
      }).then(({ error }) => { if (error) { console.error('[Supabase Tree Add Error]', error); setSyncError(`Failed to save tree node: ${error.message}`); } });
    }
  };

  const updateTreeNode = (id: string, updates: Partial<CourseTreeNode>) => {
    trackMutation(id);
    setTreeNodes((prev) => {
      const updated = prev.map((node) => (node.id === id ? { ...node, ...updates } : node));
      const target = updated.find((node) => node.id === id);
      if (target && supabase && isSupabaseConfigured()) {
        supabase.from('drishti_tree_nodes').upsert({
          id: target.id, master_tile_id: target.masterTileId, sub_track: target.subTrack,
          code: target.code, title: target.title, url: target.url, updated_at: new Date().toISOString(),
        }).then(({ error }) => { if (error) { console.error('[Supabase Tree Update Error]', error); setSyncError(`Failed to update tree node: ${error.message}`); } });
      }
      return updated;
    });
  };

  const deleteTreeNodeCascade = (id: string) => {
    const target = treeNodes.find((n) => n.id === id);
    if (!target) return;
    const targetCodeClean = target.code.trim().replace(/\.$/, '');
    const idsToDelete: string[] = [];
    setTreeNodes((prev) =>
      prev.filter((node) => {
        if (node.id === id) { idsToDelete.push(node.id); return false; }
        if (node.masterTileId === target.masterTileId && node.subTrack === target.subTrack) {
          const nodeCodeClean = node.code.trim().replace(/\.$/, '');
          if (nodeCodeClean === targetCodeClean || nodeCodeClean.startsWith(`${targetCodeClean}.`)) {
            idsToDelete.push(node.id); return false;
          }
        }
        return true;
      })
    );
    if (supabase && isSupabaseConfigured() && idsToDelete.length > 0) {
      supabase.from('drishti_tree_nodes').delete().in('id', idsToDelete)
        .then(({ error }) => { if (error) { console.error('[Supabase Tree Delete Error]', error); setSyncError(`Failed to delete tree node: ${error.message}`); } });
    }
  };

  const filteredLinks = links
    .filter((link) => {
      const matchesCat = activeLinkCategory === 'all' ? true : link.category === activeLinkCategory;
      const matchesSearch = searchQuery.trim() === '' ? true :
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.orderIndex - b.orderIndex;
    });

  const filteredRevisionCards = useMemo(() =>
    revisionCards.filter((card) => {
      const matchesCategory = activeRevisionCategory === 'All' ? true : card.category === activeRevisionCategory;
      const matchesTile = !activeTileId || activeTileId === 'tools' || card.masterTileId === activeTileId;
      return matchesCategory && matchesTile;
    }),
    [revisionCards, activeRevisionCategory, activeTileId]
  );

  useEffect(() => {
    if (filteredRevisionCards.length > 0 && activeCardIndex >= filteredRevisionCards.length) {
      setActiveCardIndex(0);
    }
  }, [filteredRevisionCards.length, activeCardIndex]);

  const nextRevisionCard = () => {
    if (filteredRevisionCards.length === 0) return;
    setActiveCardIndex((prev) => (prev + 1) % filteredRevisionCards.length);
  };

  const prevRevisionCard = () => {
    if (filteredRevisionCards.length === 0) return;
    setActiveCardIndex((prev) => prev === 0 ? filteredRevisionCards.length - 1 : prev - 1);
  };

  const shuffleRevisionCards = () => {
    setRevisionCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setActiveCardIndex(0);
  };

  const addRevisionCard = (title: string, linkOrSummary: string, category: RevisionCategory = 'AI & Deep Learning', tileId: MasterTileId = activeTileId || 'ai') => {
    const card: RevisionFlashcardItem = {
      id: `rev-${Date.now()}`, masterTileId: tileId, category, question: title.trim(),
      difficulty: 'Intermediate', hint: '', tags: [category],
      answerSummary: linkOrSummary.trim(),
      answerMarkdown: `### ${title.trim()}\n\n${linkOrSummary.trim()}`,
      keyTakeaways: ['Active recall concept saved in Drishti'],
      masteryStatus: 'learning', reviewCount: 0, createdAt: new Date().toISOString().split('T')[0],
    };
    trackMutation(card.id);
    setRevisionCards((prev) => [card, ...prev]);
    logActivity(card.question, linkOrSummary, category, 'flashcard');
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_revision_cards').upsert({
        id: card.id, master_tile_id: card.masterTileId, category: card.category, question: card.question,
        difficulty: card.difficulty, tags: card.tags, answer_summary: card.answerSummary,
        answer_markdown: card.answerMarkdown, key_takeaways: card.keyTakeaways,
        mastery_status: card.masteryStatus, review_count: card.reviewCount,
      }).then(({ error }) => { if (error) { console.error('[Supabase Revision Add Error]', error); setSyncError(`Failed to save flashcard: ${error.message}`); } });
    }
  };

  const updateRevisionCard = (id: string, updates: Partial<RevisionFlashcardItem>) => {
    trackMutation(id);
    setRevisionCards((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      const target = updated.find((c) => c.id === id);
      if (target && supabase && isSupabaseConfigured()) {
        supabase.from('drishti_revision_cards').upsert({
          id: target.id, master_tile_id: target.masterTileId, category: target.category,
          question: target.question, difficulty: target.difficulty, tags: target.tags,
          answer_summary: target.answerSummary, answer_markdown: target.answerMarkdown,
          key_takeaways: target.keyTakeaways, mastery_status: target.masteryStatus,
          review_count: target.reviewCount, updated_at: new Date().toISOString(),
        }).then(({ error }) => { if (error) { console.error('[Supabase Revision Update Error]', error); setSyncError(`Failed to update flashcard: ${error.message}`); } });
      }
      return updated;
    });
  };

  const deleteRevisionCard = (id: string) => {
    setRevisionCards((prev) => prev.filter((c) => c.id !== id));
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_revision_cards').delete().eq('id', id)
        .then(({ error }) => { if (error) { console.error('[Supabase Revision Delete Error]', error); setSyncError(`Failed to delete flashcard: ${error.message}`); } });
    }
  };

  const toggleMasteryStatus = (id: string) => {
    const target = revisionCards.find((c) => c.id === id);
    if (!target) return;
    const nextStatus: Record<string, 'learning' | 'reviewing' | 'mastered'> = { learning: 'reviewing', reviewing: 'mastered', mastered: 'learning' };
    updateRevisionCard(id, { masteryStatus: nextStatus[target.masteryStatus] || 'learning' });
  };

  const setTheme = (theme: ThemeMode) => {
    trackMutation('settings-theme');
    setSettings((prev) => ({ ...prev, theme }));
    if (supabase && isSupabaseConfigured()) supabase.from('drishti_settings').upsert({ id: 'master_config', theme }).then();
  };

  const setUiScale = (uiScale: number) => {
    const clamped = Math.min(120, Math.max(80, uiScale));
    trackMutation('settings-scale');
    setSettings((prev) => ({ ...prev, uiScale: clamped }));
    if (supabase && isSupabaseConfigured()) supabase.from('drishti_settings').upsert({ id: 'master_config', ui_scale: clamped }).then();
  };

  const updateSettings = (updates: Partial<DrishtiSettings>) => { setSettings((prev) => ({ ...prev, ...updates })); };

  const setScratchpadContent = (content: string) => { setScratchpadContentState(content); };

  const flushScratchpadToCloud = (content: string) => {
    setScratchpadContentState(content);
    trackMutation('settings-scratchpad');
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_settings').upsert({ id: 'master_config', scratchpad_content: content })
        .then(({ error }) => { if (error) { console.error('[Supabase Scratchpad Error]', error); setSyncError(`Failed to sync scratchpad: ${error.message}`); } });
    }
  };

  const exportLogs = (timeframe: 'daily' | 'weekly' | 'monthly' | 'all') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const filtered = activityLogs.filter((log) => {
      if (timeframe === 'all') return true;
      if (timeframe === 'daily') return log.dateStr === todayStr;
      const diffDays = (now.getTime() - new Date(log.timestamp).getTime()) / (1000 * 3600 * 24);
      if (timeframe === 'weekly') return diffDays <= 7;
      if (timeframe === 'monthly') return diffDays <= 30;
      return true;
    });
    const csvHeader = 'Timestamp,Date,Time,Type,Category,Title,URL\n';
    const csvRows = filtered.map((l) => `"${l.timestamp}","${l.dateStr}","${l.timeStr}","${l.type}","${l.category}","${l.title.replace(/"/g, '""')}","${l.url}"`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drishti-activity-${timeframe}-log-${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Daily Voice Journal & Dictation Methods (14-day rolling retention)
  const appendVoiceNote = useCallback(
    (transcript: string) => {
      const clean = transcript.trim();
      if (!clean) return;

      const now = new Date();
      const todayDateKey = now.toISOString().split('T')[0];
      const heading = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newBlock = `### 🎙️ [${timeStr}]\n${clean}`;

      setDailyVoiceNotes((prev) => {
        const valid = filter14DayVoiceNotes(prev);
        const existingIndex = valid.findIndex((n) => n.dateKey === todayDateKey);
        let updated: DailyVoiceEntry[];

        if (existingIndex >= 0) {
          const existing = valid[existingIndex];
          const updatedEntry: DailyVoiceEntry = {
            ...existing,
            content: `${existing.content}\n\n${newBlock}`,
            sessionsCount: (existing.sessionsCount || 1) + 1,
            updatedAt: now.toISOString(),
          };
          updated = [
            ...valid.slice(0, existingIndex),
            updatedEntry,
            ...valid.slice(existingIndex + 1),
          ];
        } else {
          const newEntry: DailyVoiceEntry = {
            id: `voice-${todayDateKey}`,
            dateKey: todayDateKey,
            fullDateHeading: heading,
            content: `# ${heading}\n\n${newBlock}`,
            sessionsCount: 1,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          };
          updated = [newEntry, ...valid];
        }

        try {
          localStorage.setItem(STORAGE_KEY_VOICE_NOTES, JSON.stringify(updated));
        } catch (e) {}

        return updated;
      });

      logActivity(`Voice note recorded for ${heading}`, '#voice-journal', 'Audio Dictation', 'link');
    },
    [filter14DayVoiceNotes]
  );

  const updateDailyVoiceNote = useCallback((id: string, newContent: string) => {
    setDailyVoiceNotes((prev) => {
      const updated = prev.map((entry) =>
        entry.id === id
          ? { ...entry, content: newContent, updatedAt: new Date().toISOString() }
          : entry
      );
      try {
        localStorage.setItem(STORAGE_KEY_VOICE_NOTES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const deleteDailyVoiceNote = useCallback((id: string) => {
    setDailyVoiceNotes((prev) => {
      const updated = prev.filter((entry) => entry.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_VOICE_NOTES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const downloadVoiceNoteFile = useCallback(
    (dateKey: string) => {
      const entry = dailyVoiceNotes.find((n) => n.dateKey === dateKey);
      if (!entry) return;

      const headerMeta = `=======================================================\nDRISHTI (दृष्टि) - DAILY VOICE NOTES & DICTATION LOG\nDate: ${entry.fullDateHeading}\nSessions: ${entry.sessionsCount}\nUpdated: ${new Date(entry.updatedAt).toLocaleTimeString()}\n=======================================================\n\n`;
      const fileBody = headerMeta + entry.content;

      const blob = new Blob([fileBody], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Drishti_VoiceNotes_${dateKey}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [dailyVoiceNotes]
  );

  const exportAllVoiceNotes = useCallback(() => {
    if (dailyVoiceNotes.length === 0) return;

    let combined = `=======================================================\nDRISHTI (दृष्टि) - COMPLETE 14-DAY VOICE JOURNAL ARCHIVE\nExported: ${new Date().toLocaleString()}\nTotal Days: ${dailyVoiceNotes.length}\nAuto-Purge Window: 14 Days (2 Weeks)\n=======================================================\n\n`;

    for (const entry of dailyVoiceNotes) {
      combined += `\n#######################################################\n# ${entry.fullDateHeading} (${entry.sessionsCount} sessions)\n#######################################################\n\n${entry.content}\n\n`;
    }

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Drishti_All_VoiceNotes_14Days_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dailyVoiceNotes]);

  const exportDataJson = () => {
    const backupData = {
      version: '5.0',
      exportedAt: new Date().toISOString(),
      links,
      treeNodes,
      revisionCards,
      activityLogs,
      settings,
      scratchpadContent,
      customSubTracks,
      dailyVoiceNotes,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drishti-master-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefaults = async () => {
    setLinks(INITIAL_LINKS);
    setTreeNodes(INITIAL_COURSE_TREE_NODES);
    setRevisionCards(INITIAL_REVISION_CARDS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSettings(INITIAL_SETTINGS);
    setCustomSubTracks({});
    setDailyVoiceNotes(INITIAL_DAILY_VOICE_NOTES);
    if (supabase && isSupabaseConfigured()) {
      try {
        await Promise.all([
          supabase.from('drishti_links').delete().neq('id', '__placeholder__'),
          supabase.from('drishti_tree_nodes').delete().neq('id', '__placeholder__'),
          supabase.from('drishti_revision_cards').delete().neq('id', '__placeholder__'),
          supabase.from('drishti_activity_logs').delete().neq('id', '__placeholder__'),
          supabase.from('drishti_settings').upsert({ id: 'master_config', scratchpad_content: '', custom_subtracks: {} }),
        ]);
      } catch (err) { console.warn('[Reset Cloud Error]', err); }
    }
  };

  return (
    <DrishtiContext.Provider
      value={{
        isCloudConnected, syncError, setSyncError,
        masterTiles, activeTileId, setActiveTileId,
        activeSubTrack, setActiveSubTrack,
        customSubTracks, getSubTracksForTile, addCustomSubTrack, deleteCustomSubTrack,
        searchQuery, setSearchQuery,
        links, filteredLinks, activeLinkCategory, setActiveLinkCategory,
        addLink, updateLink, deleteLink, togglePinLink, recordLinkClick,
        treeNodes, addTreeNode, updateTreeNode, deleteTreeNodeCascade,
        revisionCards, filteredRevisionCards,
        activeRevisionCategory, setActiveRevisionCategory,
        activeCardIndex, setActiveCardIndex,
        nextRevisionCard, prevRevisionCard, shuffleRevisionCards,
        addRevisionCard, updateRevisionCard, deleteRevisionCard, toggleMasteryStatus,
        activityLogs, logActivity, recentOpenedHistory, exportLogs,
        newsItems, scratchpadContent, setScratchpadContent, flushScratchpadToCloud,
        scratchpadLanguage, setScratchpadLanguage,
        dailyVoiceNotes, todayVoiceEntry, appendVoiceNote, updateDailyVoiceNote,
        deleteDailyVoiceNote, downloadVoiceNoteFile, exportAllVoiceNotes,
        isVoiceDictationModalOpen, setIsVoiceDictationModalOpen,
        settings, setTheme, setUiScale, updateSettings,
        isAddLinkModalOpen, setIsAddLinkModalOpen,
        defaultModalCategory, setDefaultModalCategory,
        editingLink, setEditingLink,
        isAddRevisionModalOpen, setIsAddRevisionModalOpen,
        isCommandPaletteOpen, setIsCommandPaletteOpen,
        exportDataJson, resetToDefaults,
      }}
    >
      {children}
    </DrishtiContext.Provider>
  );
};

export const useDrishti = () => {
  const context = useContext(DrishtiContext);
  if (!context) throw new Error('useDrishti must be used within a DrishtiProvider');
  return context;
};
