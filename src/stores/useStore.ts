import { create } from 'zustand'
import type { UserSettings, StorySegment, WordProgress, StoryMeta, SavedSession, CEFRLevel, StoryGenre } from '../types'
import { autoFixEndpoint } from '../services/ai'

interface AppState {
  // 全局设置（API key 等跨会话共享）
  settings: UserSettings
  updateSettings: (partial: Partial<UserSettings>) => void
  resetSettings: () => void

  // 会话管理
  sessions: SavedSession[]
  currentSessionId: string | null
  createSession: (name: string, level: CEFRLevel, genres: StoryGenre[], wordList: string[], wordListLabel: string) => string
  autoSaveSession: () => void
  saveCurrentSession: () => void
  loadSession: (id: string) => void
  deleteSession: (id: string) => void
  renameSession: (id: string, name: string) => void

  // 故事状态（当前会话的视图）
  storyHistory: StorySegment[]
  currentSegment: StorySegment | null
  storyMeta: StoryMeta | null
  isLoading: boolean
  setLoading: (loading: boolean) => void
  addSegment: (segment: StorySegment) => void
  setStoryMeta: (meta: StoryMeta) => void
  clearStory: () => void

  // 词汇进度
  wordProgress: Record<string, WordProgress>
  markWordEncountered: (word: string) => void
  markWordsEncountered: (words: string[]) => void
  markWordLookedUp: (word: string) => void
  toggleWordMastered: (word: string) => void
  resetWordProgress: () => void

  // UI 状态
  sidebarOpen: boolean
  toggleSidebar: () => void
  settingsModalOpen: boolean
  setSettingsModalOpen: (open: boolean) => void
}

const defaultSettings: UserSettings = {
  level: 'B1',
  genres: ['medieval-fantasy'],
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
  customWordList: [],
  wordListLabel: '',
  hasCompletedSetup: false,
}

// ============ localStorage 辅助函数 ============

function loadSettings(): UserSettings {
  try {
    const saved = localStorage.getItem('aplus1-settings')
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) }
  } catch { /* ignore */ }
  return { ...defaultSettings }
}

function loadSessions(): SavedSession[] {
  try {
    const saved = localStorage.getItem('aplus1-sessions')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

function loadCurrentSessionId(): string | null {
  try {
    return localStorage.getItem('aplus1-current-session-id')
  } catch { /* ignore */ }
  return null
}

function persistSessions(sessions: SavedSession[]) {
  try {
    localStorage.setItem('aplus1-sessions', JSON.stringify(sessions))
  } catch { /* ignore */ }
}

function persistCurrentSessionId(id: string | null) {
  if (id) {
    try { localStorage.setItem('aplus1-current-session-id', id) } catch { /* ignore */ }
  } else {
    try { localStorage.removeItem('aplus1-current-session-id') } catch { /* ignore */ }
  }
}

// ============ 旧数据迁移 ============

function migrateOldData(): { sessions: SavedSession[]; currentSessionId: string | null } {
  const oldHistory = localStorage.getItem('aplus1-story-history')
  if (!oldHistory) return { sessions: [], currentSessionId: null }

  // 已有新格式则跳过
  if (localStorage.getItem('aplus1-sessions')) return { sessions: [], currentSessionId: null }

  try {
    const storyHistory = JSON.parse(oldHistory)
    const storyMeta = JSON.parse(localStorage.getItem('aplus1-story-meta') || 'null')
    const wordProgress = JSON.parse(localStorage.getItem('aplus1-word-progress') || '{}')
    const oldSettings = JSON.parse(localStorage.getItem('aplus1-settings') || '{}')

    const session: SavedSession = {
      id: crypto.randomUUID(),
      name: storyMeta?.title || '我的第一个故事',
      storyHistory: Array.isArray(storyHistory) ? storyHistory : [],
      storyMeta,
      wordProgress,
      level: oldSettings.level || 'B1',
      genres: oldSettings.genres || ['medieval-fantasy'],
      customWordList: oldSettings.customWordList || [],
      wordListLabel: oldSettings.wordListLabel || '',
      createdAt: storyMeta?.startedAt || Date.now(),
      updatedAt: Date.now(),
    }

    // 清除旧键
    localStorage.removeItem('aplus1-story-history')
    localStorage.removeItem('aplus1-story-meta')
    localStorage.removeItem('aplus1-word-progress')

    return { sessions: [session], currentSessionId: session.id }
  } catch {
    return { sessions: [], currentSessionId: null }
  }
}

// ============ 防抖持久化 ============

let wordProgressSaveTimer: ReturnType<typeof setTimeout> | null = null
let storyHistorySaveTimer: ReturnType<typeof setTimeout> | null = null

function saveWordProgress(progress: Record<string, WordProgress>) {
  if (wordProgressSaveTimer) clearTimeout(wordProgressSaveTimer)
  wordProgressSaveTimer = setTimeout(() => {
    try { localStorage.setItem('aplus1-word-progress', JSON.stringify(progress)) }
    catch { /* quota exceeded */ }
  }, 300)
}

function saveStoryHistory(history: StorySegment[]) {
  if (storyHistorySaveTimer) clearTimeout(storyHistorySaveTimer)
  storyHistorySaveTimer = setTimeout(() => {
    try { localStorage.setItem('aplus1-story-history', JSON.stringify(history)) }
    catch { /* ignore */ }
  }, 300)
}

// ============ 初始化 ============

const migrated = migrateOldData()
const sessions = migrated.sessions.length > 0 ? migrated.sessions : loadSessions()
const currentSessionId = migrated.currentSessionId ?? loadCurrentSessionId()
const currentSession = sessions.find(s => s.id === currentSessionId)

// ============ Store ============

export const useStore = create<AppState>((set, get) => ({
  // --- 全局设置 ---
  settings: loadSettings(),
  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial }
    // 自动修正常见端点错误
    if (partial.apiEndpoint) {
      newSettings.apiEndpoint = autoFixEndpoint(partial.apiEndpoint)
    }
    localStorage.setItem('aplus1-settings', JSON.stringify(newSettings))
    set({ settings: newSettings })
  },
  resetSettings: () => {
    localStorage.removeItem('aplus1-settings')
    set({ settings: { ...defaultSettings } })
  },

  // --- 会话管理 ---
  sessions,
  currentSessionId,

  createSession: (name, level, genres, wordList, wordListLabel) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    const session: SavedSession = {
      id,
      name,
      storyHistory: [],
      storyMeta: null,
      wordProgress: {},
      level,
      genres,
      customWordList: wordList,
      wordListLabel,
      createdAt: now,
      updatedAt: now,
    }
    const newSessions = [...get().sessions, session]
    persistSessions(newSessions)
    persistCurrentSessionId(id)
    set({
      sessions: newSessions,
      currentSessionId: id,
      storyHistory: [],
      currentSegment: null,
      storyMeta: null,
      wordProgress: {},
    })
    return id
  },

  autoSaveSession: () => {
    const { currentSessionId, storyHistory, storyMeta, wordProgress, sessions } = get()
    if (!currentSessionId) return
    const idx = sessions.findIndex(s => s.id === currentSessionId)
    if (idx === -1) return
    const updated = [...sessions]
    updated[idx] = {
      ...updated[idx],
      storyHistory,
      storyMeta: storyMeta ? { ...storyMeta, totalSegments: storyHistory.length, lastPlayedAt: Date.now() } : null,
      wordProgress,
      updatedAt: Date.now(),
    }
    persistSessions(updated)
    set({ sessions: updated })
  },

  saveCurrentSession: () => {
    get().autoSaveSession()
  },

  loadSession: (id) => {
    const session = get().sessions.find(s => s.id === id)
    if (!session) return
    persistCurrentSessionId(id)
    set({
      currentSessionId: id,
      storyHistory: session.storyHistory,
      currentSegment: session.storyHistory.length > 0 ? session.storyHistory[session.storyHistory.length - 1] : null,
      storyMeta: session.storyMeta,
      wordProgress: session.wordProgress,
    })
  },

  deleteSession: (id) => {
    const { sessions, currentSessionId } = get()
    const filtered = sessions.filter(s => s.id !== id)
    persistSessions(filtered)
    if (currentSessionId === id) {
      persistCurrentSessionId(null)
      set({
        sessions: filtered,
        currentSessionId: null,
        storyHistory: [],
        currentSegment: null,
        storyMeta: null,
        wordProgress: {},
      })
    } else {
      set({ sessions: filtered })
    }
  },

  renameSession: (id, name) => {
    const updated = get().sessions.map(s => s.id === id ? { ...s, name, updatedAt: Date.now() } : s)
    persistSessions(updated)
    set({ sessions: updated })
  },

  // --- 故事状态 ---
  storyHistory: currentSession?.storyHistory ?? [],
  currentSegment: currentSession ? (currentSession.storyHistory.length > 0 ? currentSession.storyHistory[currentSession.storyHistory.length - 1] : null) : null,
  storyMeta: currentSession?.storyMeta ?? null,
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  addSegment: (segment) => {
    const newHistory = [...get().storyHistory, segment]
    saveStoryHistory(newHistory)
    set({ storyHistory: newHistory, currentSegment: segment })
    // 自动保存到当前会话
    setTimeout(() => get().autoSaveSession(), 100)
  },

  setStoryMeta: (meta) => {
    localStorage.setItem('aplus1-story-meta', JSON.stringify(meta))
    set({ storyMeta: meta })
    setTimeout(() => get().autoSaveSession(), 100)
  },

  clearStory: () => {
    localStorage.removeItem('aplus1-story-history')
    localStorage.removeItem('aplus1-story-meta')
    set({ storyHistory: [], currentSegment: null, storyMeta: null })
  },

  // --- 词汇进度 ---
  wordProgress: currentSession?.wordProgress ?? {},

  markWordEncountered: (word) => {
    const key = word.toLowerCase()
    const current = get().wordProgress
    const existing = current[key]
    const newProgress = {
      ...current,
      [key]: {
        word: key,
        encountered: (existing?.encountered ?? 0) + 1,
        lookedUp: existing?.lookedUp ?? 0,
        mastered: existing?.mastered ?? false,
      },
    }
    saveWordProgress(newProgress)
    set({ wordProgress: newProgress })
    setTimeout(() => get().autoSaveSession(), 350)
  },

  markWordsEncountered: (words) => {
    if (words.length === 0) return
    const current = { ...get().wordProgress }
    let changed = false
    for (const word of words) {
      const key = word.toLowerCase()
      const existing = current[key]
      current[key] = {
        word: key,
        encountered: (existing?.encountered ?? 0) + 1,
        lookedUp: existing?.lookedUp ?? 0,
        mastered: existing?.mastered ?? false,
      }
      changed = true
    }
    if (changed) {
      saveWordProgress(current)
      set({ wordProgress: current })
      setTimeout(() => get().autoSaveSession(), 350)
    }
  },

  markWordLookedUp: (word) => {
    const key = word.toLowerCase()
    const current = get().wordProgress
    const existing = current[key]
    const newProgress = {
      ...current,
      [key]: {
        word: key,
        encountered: existing?.encountered ?? 0,
        lookedUp: (existing?.lookedUp ?? 0) + 1,
        mastered: existing?.mastered ?? false,
      },
    }
    saveWordProgress(newProgress)
    set({ wordProgress: newProgress })
    setTimeout(() => get().autoSaveSession(), 350)
  },

  toggleWordMastered: (word) => {
    const key = word.toLowerCase()
    const current = get().wordProgress
    const existing = current[key]
    if (existing) {
      const newProgress = {
        ...current,
        [key]: { ...existing, mastered: !existing.mastered },
      }
      saveWordProgress(newProgress)
      set({ wordProgress: newProgress })
      setTimeout(() => get().autoSaveSession(), 350)
    }
  },

  resetWordProgress: () => {
    localStorage.removeItem('aplus1-word-progress')
    set({ wordProgress: {} })
  },

  // --- UI 状态 ---
  sidebarOpen: false,
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  settingsModalOpen: false,
  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
}))
