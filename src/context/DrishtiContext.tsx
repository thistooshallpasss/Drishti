'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface DrishtiContextType {
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

  // Activity Logging & Analytics
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

const STORAGE_KEY_LINKS = 'drishti_links_v4';
const STORAGE_KEY_TREE = 'drishti_tree_v4';
const STORAGE_KEY_REVISION = 'drishti_revision_v4';
const STORAGE_KEY_LOGS = 'drishti_logs_v4';
const STORAGE_KEY_SETTINGS = 'drishti_settings_v4';
const STORAGE_KEY_SCRATCHPAD = 'drishti_scratchpad_v4';

export const DrishtiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    `# Drishti Quick Scratchpad\n\n# SDE / AI Problem solving scratch area\n# Write code snippets, prompt drafts, or daily focus priorities here.\n\ndef solve_problem(inputs):\n    # Auto-saved in browser local memory\n    return sorted(inputs, reverse=True)\n`
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

  // Automatically adjust subtrack when active tile changes
  useEffect(() => {
    if (activeTileId) {
      const tile = masterTiles.find((t) => t.id === activeTileId);
      if (tile && tile.subTracks.length > 0) {
        setActiveSubTrack(tile.subTracks[0]);
      }
    }
  }, [activeTileId, masterTiles]);

  // Hydrate on mount
  useEffect(() => {
    try {
      const savedLinks = localStorage.getItem(STORAGE_KEY_LINKS);
      if (savedLinks) setLinks(JSON.parse(savedLinks));

      const savedTree = localStorage.getItem(STORAGE_KEY_TREE);
      if (savedTree) setTreeNodes(JSON.parse(savedTree));

      const savedRevision = localStorage.getItem(STORAGE_KEY_REVISION);
      if (savedRevision) setRevisionCards(JSON.parse(savedRevision));

      const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      if (savedLogs) setActivityLogs(JSON.parse(savedLogs));

      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      }

      const savedScratch = localStorage.getItem(STORAGE_KEY_SCRATCHPAD);
      if (savedScratch) setScratchpadContent(savedScratch);
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
    } catch (e) {
      console.warn('Failed to save links', e);
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

  // Activity Logging
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
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 499)]);
  };

  // Recent 10 Opened History
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

  // Link Management
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
  };

  const updateLink = (id: string, updates: Partial<DeepLinkItem>) => {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const togglePinLink = (id: string) => {
    setLinks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const recordLinkClick = (id: string) => {
    const targetLink = links.find((l) => l.id === id);
    if (targetLink) {
      logActivity(targetLink.title, targetLink.url, targetLink.category, 'link');
    }
    setLinks((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              clickCount: item.clickCount + 1,
              lastVisited: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : item
      )
    );
  };

  // Tree Node Operations with Cascading Delete
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
  };

  const updateTreeNode = (id: string, updates: Partial<CourseTreeNode>) => {
    setTreeNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );
  };

  const deleteTreeNodeCascade = (id: string) => {
    const target = treeNodes.find((n) => n.id === id);
    if (!target) return;

    const targetCodeClean = target.code.trim().replace(/\.$/, '');
    setTreeNodes((prev) =>
      prev.filter((node) => {
        if (node.id === id) return false;
        if (
          node.masterTileId === target.masterTileId &&
          node.subTrack === target.subTrack
        ) {
          const nodeCodeClean = node.code.trim().replace(/\.$/, '');
          if (
            nodeCodeClean === targetCodeClean ||
            nodeCodeClean.startsWith(`${targetCodeClean}.`)
          ) {
            return false;
          }
        }
        return true;
      })
    );
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
  };

  const updateRevisionCard = (id: string, updates: Partial<RevisionFlashcardItem>) => {
    setRevisionCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteRevisionCard = (id: string) => {
    setRevisionCards((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleMasteryStatus = (id: string) => {
    setRevisionCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus: Record<string, 'learning' | 'reviewing' | 'mastered'> = {
            learning: 'reviewing',
            reviewing: 'mastered',
            mastered: 'learning',
          };
          return { ...c, masteryStatus: nextStatus[c.masteryStatus] || 'learning' };
        }
        return c;
      })
    );
  };

  // Customization
  const setTheme = (theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setUiScale = (uiScale: number) => {
    setSettings((prev) => ({ ...prev, uiScale }));
  };

  const updateSettings = (updates: Partial<DrishtiSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
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
      version: '4.0',
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
        setScratchpadContent,
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
