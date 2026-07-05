import { create } from 'zustand'
import type { UserSettings, StorySegment, WordProgress, StoryMeta, CEFRLevel, StoryGenre } from '../types'

interface AppState {
  // 设置
  settings: UserSettings
  updateSettings: (partial: Partial<UserSettings>) => void
  resetSettings: () => void

  // 故事状态
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

// ============ localStorage 持久化辅助 ============

// 防抖定时器
let wordProgressSaveTimer: ReturnType<typeof setTimeout> | null = null
let storyHistorySaveTimer: ReturnType<typeof setTimeout> | null = null

function saveWordProgress(progress: Record<string, WordProgress>) {
  if (wordProgressSaveTimer) clearTimeout(wordProgressSaveTimer)
  wordProgressSaveTimer = setTimeout(() => {
    try {
      localStorage.setItem('aplus1-word-progress', JSON.stringify(progress))
    } catch { /* quota exceeded, ignore */ }
  }, 300)
}

function saveStoryHistory(history: StorySegment[]) {
  if (storyHistorySaveTimer) clearTimeout(storyHistorySaveTimer)
  storyHistorySaveTimer = setTimeout(() => {
    try {
      localStorage.setItem('aplus1-story-history', JSON.stringify(history))
    } catch { /* ignore */ }
  }, 300)
}

// ============ 数据加载 ============

function loadSettings(): UserSettings {
  try {
    const saved = localStorage.getItem('aplus1-settings')
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) }
  } catch { /* ignore */ }
  return { ...defaultSettings }
}

function loadWordProgress(): Record<string, WordProgress> {
  try {
    const saved = localStorage.getItem('aplus1-word-progress')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return {}
}

function loadStoryHistory(): StorySegment[] {
  try {
    const saved = localStorage.getItem('aplus1-story-history')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

function loadStoryMeta(): StoryMeta | null {
  try {
    const saved = localStorage.getItem('aplus1-story-meta')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return null
}

// ============ Store ============

export const useStore = create<AppState>((set, get) => ({
  settings: loadSettings(),
  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial }
    localStorage.setItem('aplus1-settings', JSON.stringify(newSettings))
    set({ settings: newSettings })
  },
  resetSettings: () => {
    localStorage.removeItem('aplus1-settings')
    set({ settings: { ...defaultSettings } })
  },

  storyHistory: loadStoryHistory(),
  currentSegment: loadStoryHistory().length > 0 ? loadStoryHistory()[loadStoryHistory().length - 1] : null,
  storyMeta: loadStoryMeta(),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  addSegment: (segment) => {
    const newHistory = [...get().storyHistory, segment]
    saveStoryHistory(newHistory)
    set({ storyHistory: newHistory, currentSegment: segment })
  },
  setStoryMeta: (meta) => {
    localStorage.setItem('aplus1-story-meta', JSON.stringify(meta))
    set({ storyMeta: meta })
  },
  clearStory: () => {
    localStorage.removeItem('aplus1-story-history')
    localStorage.removeItem('aplus1-story-meta')
    set({ storyHistory: [], currentSegment: null, storyMeta: null })
  },

  wordProgress: loadWordProgress(),
  markWordEncountered: (word) => {
    const key = word.toLowerCase()
    const current = get().wordProgress
    // 浅比较优化：如果 key 不存在或 encountered 为 0 才更新
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
    }
  },
  resetWordProgress: () => {
    localStorage.removeItem('aplus1-word-progress')
    set({ wordProgress: {} })
  },

  sidebarOpen: false,
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  settingsModalOpen: false,
  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
}))
