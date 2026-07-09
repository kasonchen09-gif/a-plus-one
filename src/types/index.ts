// CEFR 英语水平等级
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

// 故事题材
export type StoryGenre =
  | 'medieval-fantasy'
  | 'cyberpunk'
  | 'romance'
  | 'post-apocalyptic'
  | 'mystery-detective'
  | 'space-adventure'
  | 'urban-fantasy'
  | 'historical-fiction'
  | 'survival-adventure'
  | 'comedy-daily'

// 故事段落
export interface StorySegment {
  id: string
  content: string           // 英文故事文本
  choices: Choice[]         // 结尾选项
  targetWordsUsed: string[] // 本段用到的目标词汇
  timestamp: number
}

// 分支选项
export interface Choice {
  id: string
  text: string              // 英文选项文本
  summary: string           // 中文提示/翻译
}

// 用户设置
export interface UserSettings {
  level: CEFRLevel
  genres: StoryGenre[]
  apiKey: string
  apiEndpoint: string
  model: string
  customWordList: string[]
  wordListLabel: string
  hasCompletedSetup: boolean
}

// 词汇掌握进度
export interface WordProgress {
  word: string
  encountered: number       // 故事中遇到次数
  lookedUp: number          // 点击查词次数
  mastered: boolean         // 是否标记为已掌握
}

// 故事元数据
export interface StoryMeta {
  title: string
  genre: StoryGenre
  level: CEFRLevel
  totalSegments: number
  startedAt: number
  lastPlayedAt: number
}

// AI 请求格式
export interface StoryGenerateRequest {
  level: CEFRLevel
  genre: StoryGenre
  targetWords: string[]
  storyHistory: { content: string; choice: string }[]
  previousChoice?: string
}

// AI 响应格式
export interface StoryGenerateResponse {
  content: string
  choices: Choice[]
  targetWordsUsed: string[]
  title?: string
}

// 保存的会话（存档）
export interface SavedSession {
  id: string
  name: string
  storyHistory: StorySegment[]
  storyMeta: StoryMeta | null
  wordProgress: Record<string, WordProgress>
  level: CEFRLevel
  genres: StoryGenre[]
  customWordList: string[]
  wordListLabel: string
  createdAt: number
  updatedAt: number
}

// CE FR 等级描述
export const CEFR_LEVELS: { value: CEFRLevel; label: string; description: string }[] = [
  { value: 'A1', label: 'A1 入门', description: '能理解并使用熟悉的日常表达法和基本词汇' },
  { value: 'A2', label: 'A2 基础', description: '能理解大部分日常生活中常用的句子和表达' },
  { value: 'B1', label: 'B1 进阶', description: '能应对大部分旅途中的英语交流场景' },
  { value: 'B2', label: 'B2 中高级', description: '能理解复杂文本，与母语者流畅交流' },
  { value: 'C1', label: 'C1 高级', description: '能理解长篇复杂文本，灵活运用语言' },
  { value: 'C2', label: 'C2 精通', description: '能轻松理解几乎所有读到或听到的内容' },
]

// 题材标签
export const GENRES: { value: StoryGenre; label: string; emoji: string }[] = [
  { value: 'medieval-fantasy', label: '中世纪奇幻', emoji: '🏰' },
  { value: 'cyberpunk', label: '赛博朋克', emoji: '🤖' },
  { value: 'romance', label: '恋爱喜剧', emoji: '💕' },
  { value: 'post-apocalyptic', label: '末日生存', emoji: '🧟' },
  { value: 'mystery-detective', label: '悬疑侦探', emoji: '🔍' },
  { value: 'space-adventure', label: '太空冒险', emoji: '🚀' },
  { value: 'urban-fantasy', label: '都市奇幻', emoji: '🌃' },
  { value: 'historical-fiction', label: '历史架空', emoji: '📜' },
  { value: 'survival-adventure', label: '荒岛求生', emoji: '🏝️' },
  { value: 'comedy-daily', label: '日常喜剧', emoji: '😄' },
]
