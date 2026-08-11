'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
} from '@/types';
import {
  MASTER_TILES,
  INITIAL_LINKS,
  INITIAL_REVISION_CARDS,
  INITIAL_TECH_NEWS,
  INITIAL_SETTINGS,
  INITIAL_COURSE_TREE_NODES,
  INITIAL_ACTIVITY_LOGS,
} from '@/data/initialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface DrishtiContextType {
  // Cloud Sync Status
  isCloudConnected: boolean;

  // Navigation & Drilldown State
  masterTiles: MasterTileInfo[];
  activeTileId: MasterTileId | null;
  setActiveTileId: (id: MasterTileId | null) => void;
  activeSubTrack: string;
  setActiveSubTrack: (track: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Links (under Tools)
  links: DeepLinkItem[];
  filteredLinks: DeepLinkItem[];
  activeLinkCategory: LinkCategory;
  setActiveLinkCategory: (cat: LinkCategory) => void;
  addLink: (title: string, url: string, category?: LinkCategory) => void;
  updateLink: (id: string, updates: Partial<DeepLinkItem>) => void;
  deleteLink: (id: string) => void;
  togglePinLink: (id: string) => void;
  recordLinkClick: (id: string) => void;

  // Hierarchical Course & Notes Tree
  treeNodes: CourseTreeNode[];
  addTreeNode: (code: string, title: string, url: string, masterTileId?: MasterTileId, subTrack?: string) => void;
  updateTreeNode: (id: string, updates: Partial<CourseTreeNode>) => void;
  deleteTreeNodeCascade: (id: string) => void;

  // Active Recall Flashcards
  revisionCards: RevisionFlashcardItem[];
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

  // Activity Logging & Analytics (60-day / 2-month retention)
  activityLogs: ActivityLogItem[];
  logActivity: (title: string, url: string, category: string, type: 'link' | 'doc_tree' | 'flashcard') => void;
  recentOpenedHistory: ActivityLogItem[];
  exportLogs: (timeframe: 'daily' | 'weekly' | 'monthly' | 'all') => void;

  // Tech Radar & Scratchpad
  newsItems: TechNewsItem[];
  scratchpadContent: string;
  setScratchpadContent: (content: string) => void;
  scratchpadLanguage: string;
  setScratchpadLanguage: (lang: string) => void;

  // Settings & Themes
  settings: DrishtiSettings;
  setTheme: (theme: ThemeMode) => void;
  setUiScale: (scale: number) => void;
  updateSettings: (updates: Partial<DrishtiSettings>) => void;

  // Modals
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

  // Backup & Reset
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

export const DrishtiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured());
  const [masterTiles] = useState<MasterTileInfo[]>(MASTER_TILES);
  const [activeTileId, setActiveTileId] = useState<MasterTileId | null>(null);
  const [activeSubTrack, setActiveSubTrack] = useState<string>('Large Language Models (LLM)');

  const [links, setLinks] = useState<DeepLinkItem[]>(INITIAL_LINKS);
  const [treeNodes, setTreeNodes] = useState<CourseTreeNode[]>(INITIAL_COURSE_TREE_NODES);
  const [revisionCards, setRevisionCards] = useState<RevisionFlashcardItem[]>(INITIAL_REVISION_CARDS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [newsItems] = useState<TechNewsItem[]>(INITIAL_TECH_NEWS);
  const [settings, setSettings] = useState<DrishtiSettings>(INITIAL_SETTINGS);
  const [scratchpadContent, setScratchpadContent] = useState<string>(
    `# Drishti Quick Scratchpad\n\n# SDE / AI Problem solving scratch area\n# Auto-saved to Cloud & local memory\n\ndef solve_problem(inputs):\n    return sorted(inputs, reverse=True)\n`
  );
  const [scratchpadLanguage, setScratchpadLanguage] = useState<string>('python');

  const [activeLinkCategory, setActiveLinkCategory] = useState<LinkCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeRevisionCategory, setActiveRevisionCategory] = useState<RevisionCategory>('All');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Modals
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [defaultModalCategory, setDefaultModalCategory] = useState<LinkCategory>('ai');
  const [editingLink, setEditingLink] = useState<DeepLinkItem | null>(null);
  const [isAddRevisionModalOpen, setIsAddRevisionModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Auto adjust subtrack when active tile changes
  useEffect(() => {
    if (activeTileId) {
      const tile = masterTiles.find((t) => t.id === activeTileId);
      if (tile && tile.subTracks.length > 0) {
        setActiveSubTrack(tile.subTracks[0]);
      }
    }
  }, [activeTileId, masterTiles]);

  // Filter logs for rolling 60 days (current month + previous month)
  const filter60DayLogs = useCallback((rawLogs: ActivityLogItem[]): ActivityLogItem[] => {
    const now = new Date().getTime();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
    return rawLogs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return now - logTime <= sixtyDaysMs;
    });
  }, []);

  // Hydrate Data on Mount (Cloud-First with Local Storage Fallback)
  useEffect(() => {
    const initData = async () => {
      // 1. Try local storage first for instant render
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
        if (savedScratch) setScratchpadContent(savedScratch);
      } catch (e) {
        console.warn('Local storage read error', e);
      }

      // 2. Fetch from Supabase cloud
      if (supabase && isSupabaseConfigured()) {
        try {
          setIsCloudConnected(true);

          // Fetch Links (ordered by order_index)
          const { data: dbLinks, error: linkErr } = await supabase
            .from('drishti_links')
            .select('*')
            .order('order_index', { ascending: true });

          if (dbLinks && dbLinks.length > 0) {
            const mappedLinks: DeepLinkItem[] = dbLinks.map((row) => ({
              id: row.id,
              title: row.title,
              url: row.url,
              category: row.category as LinkCategory,
              description: row.description,
              isPinned: row.is_pinned,
              orderIndex: row.order_index,
              iconType: row.icon_type,
              iconValue: row.icon_value,
              tags: row.tags || [],
              badge: row.badge,
              accentColor: row.accent_color,
              clickCount: row.click_count,
              lastVisited: row.last_visited,
              createdAt: row.created_at,
            }));
            setLinks(mappedLinks);
          }

          // Fetch Tree Nodes (ordered by created_at)
          const { data: dbTree } = await supabase
            .from('drishti_tree_nodes')
            .select('*')
            .order('created_at', { ascending: true });

          if (dbTree && dbTree.length > 0) {
            const mappedTree: CourseTreeNode[] = dbTree.map((row) => ({
              id: row.id,
              masterTileId: row.master_tile_id as MasterTileId,
              subTrack: row.sub_track,
              code: row.code,
              title: row.title,
              url: row.url,
              notesSnippet: row.notes_snippet,
              createdAt: row.created_at,
            }));
            setTreeNodes(mappedTree);
          }

          // Fetch Revision Cards
          const { data: dbCards } = await supabase
            .from('drishti_revision_cards')
            .select('*')
            .order('created_at', { ascending: false });

          if (dbCards && dbCards.length > 0) {
            const mappedCards: RevisionFlashcardItem[] = dbCards.map((row) => ({
              id: row.id,
              masterTileId: row.master_tile_id as MasterTileId,
              category: row.category as RevisionCategory,
              question: row.question,
              difficulty: row.difficulty,
              hint: row.hint,
              tags: row.tags || [],
              answerSummary: row.answer_summary,
              answerMarkdown: row.answer_markdown,
              keyTakeaways: row.key_takeaways || [],
              masteryStatus: row.mastery_status,
              reviewCount: row.review_count,
              createdAt: row.created_at,
            }));
            setRevisionCards(mappedCards);
          }

          // Fetch Activity Logs (last 60 days)
          const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
          const { data: dbLogs } = await supabase
            .from('drishti_activity_logs')
            .select('*')
            .gte('timestamp', sixtyDaysAgo)
            .order('timestamp', { ascending: false });

          if (dbLogs && dbLogs.length > 0) {
            const mappedLogs: ActivityLogItem[] = dbLogs.map((row) => ({
              id: row.id,
              title: row.title,
              url: row.url,
              category: row.category,
              type: row.type,
              timestamp: row.timestamp,
              dateStr: row.date_str,
              timeStr: row.time_str,
            }));
            setActivityLogs(mappedLogs);
          }

          // Fetch Settings & Scratchpad
          const { data: dbSettings } = await supabase
            .from('drishti_settings')
            .select('*')
            .eq('id', 'master_config')
            .single();

          if (dbSettings) {
            if (dbSettings.scratchpad_content) {
              setScratchpadContent(dbSettings.scratchpad_content);
            }
            if (dbSettings.theme) {
              setSettings((prev) => ({
                ...prev,
                theme: dbSettings.theme as ThemeMode,
                uiScale: dbSettings.ui_scale || 100,
              }));
            }
          }
        } catch (err) {
          console.warn('[Supabase Init Error]', err);
        }
      }
    };

    initData();
  }, [filter60DayLogs]);

  // Real-Time WebSocket Channel across all devices
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel('drishti-live-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drishti_links' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          setLinks((prev) => {
            if (prev.some((l) => l.id === row.id)) return prev;
            const item: DeepLinkItem = {
              id: row.id,
              title: row.title,
              url: row.url,
              category: row.category as LinkCategory,
              description: row.description,
              isPinned: row.is_pinned,
              orderIndex: row.order_index,
              iconType: row.icon_type,
              iconValue: row.icon_value,
              tags: row.tags || [],
              badge: row.badge,
              accentColor: row.accent_color,
              clickCount: row.click_count,
              lastVisited: row.last_visited,
              createdAt: row.created_at,
            };
            return [item, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          setLinks((prev) =>
            prev.map((l) =>
              l.id === row.id
                ? {
                    ...l,
                    title: row.title,
                    url: row.url,
                    category: row.category as LinkCategory,
                    description: row.description,
                    isPinned: row.is_pinned,
                    tags: row.tags || [],
                    clickCount: row.click_count,
                    lastVisited: row.last_visited,
                  }
                : l
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setLinks((prev) => prev.filter((l) => l.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drishti_tree_nodes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          setTreeNodes((prev) => {
            if (prev.some((t) => t.id === row.id)) return prev;
            const node: CourseTreeNode = {
              id: row.id,
              masterTileId: row.master_tile_id as MasterTileId,
              subTrack: row.sub_track,
              code: row.code,
              title: row.title,
              url: row.url,
              createdAt: row.created_at,
            };
            return [...prev, node];
          });
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          setTreeNodes((prev) =>
            prev.map((t) =>
              t.id === row.id
                ? {
                    ...t,
                    code: row.code,
                    title: row.title,
                    url: row.url,
                    subTrack: row.sub_track,
                  }
                : t
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setTreeNodes((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drishti_revision_cards' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          setRevisionCards((prev) => {
            if (prev.some((c) => c.id === row.id)) return prev;
            const card: RevisionFlashcardItem = {
              id: row.id,
              masterTileId: row.master_tile_id as MasterTileId,
              category: row.category as RevisionCategory,
              question: row.question,
              difficulty: row.difficulty,
              hint: row.hint,
              tags: row.tags || [],
              answerSummary: row.answer_summary,
              answerMarkdown: row.answer_markdown,
              keyTakeaways: row.key_takeaways || [],
              masteryStatus: row.mastery_status,
              reviewCount: row.review_count,
              createdAt: row.created_at,
            };
            return [card, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          setRevisionCards((prev) =>
            prev.map((c) =>
              c.id === row.id
                ? {
                    ...c,
                    question: row.question,
                    answerSummary: row.answer_summary,
                    masteryStatus: row.mastery_status,
                  }
                : c
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setRevisionCards((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drishti_settings' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          if (row.scratchpad_content !== undefined) {
            setScratchpadContent(row.scratchpad_content);
          }
          if (row.theme) {
            setSettings((prev) => ({ ...prev, theme: row.theme as ThemeMode, uiScale: row.ui_scale || 100 }));
          }
        }
      })
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Save to Local Storage as fast local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
    } catch (e) {
      console.warn('Failed to save links to local cache', e);
    }
  }, [links]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TREE, JSON.stringify(treeNodes));
    } catch (e) {
      console.warn('Failed to save tree nodes', e);
    }
  }, [treeNodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVISION, JSON.stringify(revisionCards));
    } catch (e) {
      console.warn('Failed to save revision cards', e);
    }
  }, [revisionCards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs));
    } catch (e) {
      console.warn('Failed to save logs', e);
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      document.documentElement.setAttribute('data-theme', settings.theme);
      document.documentElement.style.setProperty('--ui-scale', (settings.uiScale / 100).toString());
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCRATCHPAD, scratchpadContent);
    } catch (e) {
      console.warn('Failed to save scratchpad', e);
    }
  }, [scratchpadContent]);

  // Global Keyboard Shortcuts (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Activity Logging (60-day / 2-month rolling retention)
  const logActivity = (
    title: string,
    url: string,
    category: string,
    type: 'link' | 'doc_tree' | 'flashcard'
  ) => {
    const now = new Date();
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      title,
      url,
      category,
      type,
      timestamp: now.toISOString(),
      dateStr: now.toISOString().split('T')[0],
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setActivityLogs((prev) => filter60DayLogs([newLog, ...prev]));

    // Push to Supabase if connected
    if (supabase && isSupabaseConfigured()) {
      supabase
        .from('drishti_activity_logs')
        .insert({
          id: newLog.id,
          title: newLog.title,
          url: newLog.url,
          category: newLog.category,
          type: newLog.type,
          timestamp: newLog.timestamp,
          date_str: newLog.dateStr,
          time_str: newLog.timeStr,
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase Log Insert Error]', error);
        });
    }
  };

  // Recent 10 Opened Destinations
  const recentOpenedHistory = React.useMemo(() => {
    const seen = new Set<string>();
    const recents: ActivityLogItem[] = [];
    for (const item of activityLogs) {
      const key = `${item.title}-${item.url}`;
      if (!seen.has(key)) {
        seen.add(key);
        recents.push(item);
        if (recents.length >= 10) break;
      }
    }
    return recents;
  }, [activityLogs]);

  // Link Management with Full Upsert to Cloud
  const addLink = (title: string, url: string, category: LinkCategory = 'ai') => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const item: DeepLinkItem = {
      id: `link-${Date.now()}`,
      title: title.trim(),
      url: cleanUrl,
      category,
      isPinned: false,
      orderIndex: links.length,
      iconType: 'favicon',
      iconValue: cleanUrl,
      tags: [category.toUpperCase()],
      clickCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLinks((prev) => [item, ...prev]);
    logActivity(item.title, item.url, item.category, 'link');

    if (supabase && isSupabaseConfigured()) {
      supabase
        .from('drishti_links')
        .upsert({
          id: item.id,
          title: item.title,
          url: item.url,
          category: item.category,
          description: item.description || '',
          is_pinned: item.isPinned,
          order_index: item.orderIndex,
          tags: item.tags,
          badge: item.badge || '',
          click_count: item.clickCount,
          last_visited: item.lastVisited || '',
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase Link Add Error]', error);
        });
    }
  };

  const updateLink = (id: string, updates: Partial<DeepLinkItem>) => {
    setLinks((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      const target = updated.find((item) => item.id === id);

      if (target && supabase && isSupabaseConfigured()) {
        supabase
          .from('drishti_links')
          .upsert({
            id: target.id,
            title: target.title,
            url: target.url,
            category: target.category,
            description: target.description || '',
            is_pinned: target.isPinned,
            order_index: target.orderIndex,
            tags: target.tags || [],
            badge: target.badge || '',
            click_count: target.clickCount,
            last_visited: target.lastVisited || '',
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) console.error('[Supabase Link Update Error]', error);
          });
      }
      return updated;
    });
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
    if (supabase && isSupabaseConfigured()) {
      supabase
        .from('drishti_links')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[Supabase Link Delete Error]', error);
        });
    }
  };

  const togglePinLink = (id: string) => {
    const target = links.find((l) => l.id === id);
    if (!target) return;
    const newPinned = !target.isPinned;
    updateLink(id, { isPinned: newPinned });
  };

  const recordLinkClick = (id: string) => {
    const targetLink = links.find((l) => l.id === id);
    if (targetLink) {
      logActivity(targetLink.title, targetLink.url, targetLink.category, 'link');
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updateLink(id, { clickCount: targetLink.clickCount + 1, lastVisited: nowStr });
    }
  };

  // Tree Node Operations with Cascading Delete & Cloud Sync
  const addTreeNode = (
    code: string,
    title: string,
    url: string,
    masterTileId: MasterTileId = activeTileId || 'ai',
    subTrack: string = activeSubTrack
  ) => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const newNode: CourseTreeNode = {
      id: `tree-${Date.now()}`,
      masterTileId,
      subTrack,
      code: code.trim(),
      title: title.trim(),
      url: cleanUrl,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTreeNodes((prev) => [...prev, newNode]);
    logActivity(`${newNode.code} ${newNode.title}`, newNode.url, `${masterTileId} / ${subTrack}`, 'doc_tree');

    if (supabase && isSupabaseConfigured()) {
      supabase
        .from('drishti_tree_nodes')
        .upsert({
          id: newNode.id,
          master_tile_id: newNode.masterTileId,
          sub_track: newNode.subTrack,
          code: newNode.code,
          title: newNode.title,
          url: newNode.url,
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase Tree Add Error]', error);
        });
    }
  };

  const updateTreeNode = (id: string, updates: Partial<CourseTreeNode>) => {
    setTreeNodes((prev) => {
      const updated = prev.map((node) => (node.id === id ? { ...node, ...updates } : node));
      const target = updated.find((node) => node.id === id);

      if (target && supabase && isSupabaseConfigured()) {
        supabase
          .from('drishti_tree_nodes')
          .upsert({
            id: target.id,
            master_tile_id: target.masterTileId,
            sub_track: target.subTrack,
            code: target.code,
            title: target.title,
            url: target.url,
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) console.error('[Supabase Tree Update Error]', error);
          });
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
        if (node.id === id) {
          idsToDelete.push(node.id);
          return false;
        }
        if (
          node.masterTileId === target.masterTileId &&
          node.subTrack === target.subTrack
        ) {
          const nodeCodeClean = node.code.trim().replace(/\.$/, '');
          if (
            nodeCodeClean === targetCodeClean ||
            nodeCodeClean.startsWith(`${targetCodeClean}.`)
          ) {
            idsToDelete.push(node.id);
            return false;
          }
        }
        return true;
      })
    );

    if (supabase && isSupabaseConfigured() && idsToDelete.length > 0) {
      supabase
        .from('drishti_tree_nodes')
        .delete()
        .in('id', idsToDelete)
        .then(({ error }) => {
          if (error) console.error('[Supabase Tree Delete Error]', error);
        });
    }
  };

  // Filtered links
  const filteredLinks = links
    .filter((link) => {
      const matchesCat =
        activeLinkCategory === 'all' ? true : link.category === activeLinkCategory;
      const matchesSearch =
        searchQuery.trim() === ''
          ? true
          : link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.orderIndex - b.orderIndex;
    });

  // Revision Cards
  const filteredRevisionCards = revisionCards.filter((card) => {
    const matchesCategory =
      activeRevisionCategory === 'All' ? true : card.category === activeRevisionCategory;
    const matchesTile =
      !activeTileId || activeTileId === 'tools' || card.masterTileId === activeTileId;
    return matchesCategory && matchesTile;
  });

  const nextRevisionCard = () => {
    if (filteredRevisionCards.length === 0) return;
    setActiveCardIndex((prev) => (prev + 1) % filteredRevisionCards.length);
  };

  const prevRevisionCard = () => {
    if (filteredRevisionCards.length === 0) return;
    setActiveCardIndex((prev) =>
      prev === 0 ? filteredRevisionCards.length - 1 : prev - 1
    );
  };

  const shuffleRevisionCards = () => {
    setRevisionCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setActiveCardIndex(0);
  };

  const addRevisionCard = (
    title: string,
    linkOrSummary: string,
    category: RevisionCategory = 'AI & Deep Learning',
    tileId: MasterTileId = activeTileId || 'ai'
  ) => {
    const card: RevisionFlashcardItem = {
      id: `rev-${Date.now()}`,
      masterTileId: tileId,
      category,
      question: title.trim(),
      difficulty: 'Intermediate',
      hint: '',
      tags: [category],
      answerSummary: linkOrSummary.trim(),
      answerMarkdown: `### ${title.trim()}\n\n${linkOrSummary.trim()}`,
      keyTakeaways: ['Active recall concept saved in Drishti'],
      masteryStatus: 'learning',
      reviewCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRevisionCards((prev) => [card, ...prev]);
    logActivity(card.question, linkOrSummary, category, 'flashcard');

    if (supabase && isSupabaseConfigured()) {
      supabase
        .from('drishti_revision_cards')
        .upsert({
          id: card.id,
          master_tile_id: card.masterTileId,
          category: card.category,
          question: card.question,
          difficulty: card.difficulty,
          tags: card.tags,
          answer_summary: card.answerSummary,
          answer_markdown: card.answerMarkdown,
          key_takeaways: card.keyTakeaways,
          mastery_status: card.masteryStatus,
          review_count: card.reviewCount,
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase Revision Add Error]', error);
        });
    }
  };

  const updateRevisionCard = (id: string, updates: Partial<RevisionFlashcardItem>) => {
    setRevisionCards((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      const target = updated.find((c) => c.id === id);

      if (target && supabase && isSupabaseConfigured()) {
        supabase
          .from('drishti_revision_cards')
          .upsert({
            id: target.id,
            master_tile_id: target.masterTileId,
            category: target.category,
            question: target.question,
            difficulty: target.difficulty,
            tags: target.tags,
            answer_summary: target.answerSummary,
            answer_markdown: target.answerMarkdown,
            key_takeaways: target.keyTakeaways,
            mastery_status: target.masteryStatus,
            review_count: target.reviewCount,
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) console.error('[Supabase Revision Update Error]', error);
          });
      }
      return updated;
    });
  };

  const deleteRevisionCard = (id: string) => {
    setRevisionCards((prev) => prev.filter((c) => c.id !== id));
    if (supabase && isSupabaseConfigured()) {
      supabase
        .from('drishti_revision_cards')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[Supabase Revision Delete Error]', error);
        });
    }
  };

  const toggleMasteryStatus = (id: string) => {
    const target = revisionCards.find((c) => c.id === id);
    if (!target) return;
    const nextStatus: Record<string, 'learning' | 'reviewing' | 'mastered'> = {
      learning: 'reviewing',
      reviewing: 'mastered',
      mastered: 'learning',
    };
    const newStatus = nextStatus[target.masteryStatus] || 'learning';
    updateRevisionCard(id, { masteryStatus: newStatus });
  };

  // Customization & Themes
  const setTheme = (theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }));
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_settings').upsert({ id: 'master_config', theme }).then();
    }
  };

  const setUiScale = (uiScale: number) => {
    setSettings((prev) => ({ ...prev, uiScale }));
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_settings').upsert({ id: 'master_config', ui_scale: uiScale }).then();
    }
  };

  const updateSettings = (updates: Partial<DrishtiSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Update scratchpad to cloud
  const handleUpdateScratchpad = (content: string) => {
    setScratchpadContent(content);
    if (supabase && isSupabaseConfigured()) {
      supabase.from('drishti_settings').upsert({ id: 'master_config', scratchpad_content: content }).then();
    }
  };

  // Export Activity Logs
  const exportLogs = (timeframe: 'daily' | 'weekly' | 'monthly' | 'all') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const filtered = activityLogs.filter((log) => {
      if (timeframe === 'all') return true;
      if (timeframe === 'daily') return log.dateStr === todayStr;

      const logDate = new Date(log.timestamp);
      const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
      if (timeframe === 'weekly') return diffDays <= 7;
      if (timeframe === 'monthly') return diffDays <= 30;
      return true;
    });

    const csvHeader = 'Timestamp,Date,Time,Type,Category,Title,URL\n';
    const csvRows = filtered
      .map(
        (l) =>
          `"${l.timestamp}","${l.dateStr}","${l.timeStr}","${l.type}","${l.category}","${l.title.replace(/"/g, '""')}","${l.url}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drishti-activity-${timeframe}-log-${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drishti-master-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefaults = () => {
    setLinks(INITIAL_LINKS);
    setTreeNodes(INITIAL_COURSE_TREE_NODES);
    setRevisionCards(INITIAL_REVISION_CARDS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <DrishtiContext.Provider
      value={{
        isCloudConnected,
        masterTiles,
        activeTileId,
        setActiveTileId,
        activeSubTrack,
        setActiveSubTrack,

        searchQuery,
        setSearchQuery,

        links,
        filteredLinks,
        activeLinkCategory,
        setActiveLinkCategory,
        addLink,
        updateLink,
        deleteLink,
        togglePinLink,
        recordLinkClick,

        treeNodes,
        addTreeNode,
        updateTreeNode,
        deleteTreeNodeCascade,

        revisionCards,
        activeRevisionCategory,
        setActiveRevisionCategory,
        activeCardIndex,
        setActiveCardIndex,
        nextRevisionCard,
        prevRevisionCard,
        shuffleRevisionCards,
        addRevisionCard,
        updateRevisionCard,
        deleteRevisionCard,
        toggleMasteryStatus,

        activityLogs,
        logActivity,
        recentOpenedHistory,
        exportLogs,

        newsItems,
        scratchpadContent,
        setScratchpadContent: handleUpdateScratchpad,
        scratchpadLanguage,
        setScratchpadLanguage,

        settings,
        setTheme,
        setUiScale,
        updateSettings,

        isAddLinkModalOpen,
        setIsAddLinkModalOpen,
        defaultModalCategory,
        setDefaultModalCategory,
        editingLink,
        setEditingLink,
        isAddRevisionModalOpen,
        setIsAddRevisionModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,

        exportDataJson,
        resetToDefaults,
      }}
    >
      {children}
    </DrishtiContext.Provider>
  );
};

export const useDrishti = () => {
  const context = useContext(DrishtiContext);
  if (!context) {
    throw new Error('useDrishti must be used within a DrishtiProvider');
  }
  return context;
};
