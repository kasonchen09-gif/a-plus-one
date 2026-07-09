import { useState, useCallback, useEffect, useRef } from 'react'
import { useStore } from '../stores/useStore'
import { generateStorySegment } from '../services/ai'
import type { StorySegment } from '../types'
import StoryText from './StoryText'
import ChoicePanel from './ChoicePanel'
import AudioBar from './AudioBar'
import WordPanel from './WordPanel'
import SettingsModal from './SettingsModal'
import SessionManager from './SessionManager'

export default function StoryReader() {
  const {
    settings, storyHistory, currentSegment, storyMeta,
    isLoading, setLoading, addSegment, setStoryMeta,
    sidebarOpen, toggleSidebar, settingsModalOpen, setSettingsModalOpen,
  } = useStore()

  const [error, setError] = useState('')
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [sessionManagerOpen, setSessionManagerOpen] = useState(false)
  const [newStoryMode, setNewStoryMode] = useState(false)
  const [saveToast, setSaveToast] = useState(false)
  const storyEndRef = useRef<HTMLDivElement>(null)

  const currentSession = useStore(s => s.sessions.find(x => x.id === s.currentSessionId))
  const saveCurrentSession = useStore(s => s.saveCurrentSession)

  // 首次加载时自动生成故事
  useEffect(() => {
    if (storyHistory.length === 0 && !isLoading) {
      generateNextSegment()
    }
  }, [])

  // 自动滚动到最新内容
  useEffect(() => {
    if (storyEndRef.current) {
      storyEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentSegment, isLoading])

  const generateNextSegment = useCallback(async (_choice?: string, choiceText?: string) => {
    setError('')
    setLoading(true)

    try {
      const history = storyHistory.map(s => ({
        content: s.content,
        choice: '',
      }))

      // 更新最后一段的选择
      if (storyHistory.length > 0 && choiceText) {
        history[history.length - 1].choice = choiceText
      }

      const response = await generateStorySegment(
        settings.apiEndpoint,
        settings.apiKey,
        settings.model,
        settings.level,
        settings.genres[0], // 使用第一个题材
        settings.customWordList,
        history,
        choiceText
      )

      const segment: StorySegment = {
        id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content: response.content,
        choices: response.choices,
        targetWordsUsed: response.targetWordsUsed,
        timestamp: Date.now(),
      }

      addSegment(segment)

      // 设置故事元数据（第一段时）
      if (storyHistory.length === 0 && response.title) {
        setStoryMeta({
          title: response.title,
          genre: settings.genres[0],
          level: settings.level,
          totalSegments: 1,
          startedAt: Date.now(),
          lastPlayedAt: Date.now(),
        })
      } else if (storyMeta) {
        setStoryMeta({
          ...storyMeta,
          totalSegments: storyHistory.length + 1,
          lastPlayedAt: Date.now(),
        })
      }

      setSelectedChoice(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误'
      setError(`生成故事失败：${message}`)
      console.error('Story generation error:', err)
    } finally {
      setLoading(false)
    }
  }, [storyHistory, settings, addSegment, setStoryMeta, storyMeta, setLoading])

  const handleChoice = (choiceId: string, choiceText: string) => {
    setSelectedChoice(choiceId)
    generateNextSegment(choiceId, choiceText)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all ${sidebarOpen ? 'mr-80' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-700/50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">
                <span className="text-indigo-400">A</span>
                <span className="text-amber-400">+1</span>
                <span className="text-white"> 快</span>
              </h1>
              {storyMeta && (
                <span className="text-slate-500 text-sm hidden sm:inline">
                  {storyMeta.title}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Segment count */}
              {storyHistory.length > 0 && (
                <span className="text-slate-500 text-sm bg-slate-800 px-3 py-1 rounded-full">
                  第 {storyHistory.length} 段
                </span>
              )}

              {/* Word panel toggle */}
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-colors ${
                  sidebarOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="词汇面板"
              >
                📖
              </button>

              {/* Settings */}
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="设置"
              >
                ⚙️
              </button>

              {/* Session name (non-interactive label) */}
              {currentSession && (
                <span className="text-slate-500 text-xs bg-slate-800/50 px-2 py-1 rounded-full max-w-[120px] truncate hidden md:inline">
                  {currentSession.name}
                </span>
              )}

              {/* Save */}
              <button
                onClick={() => {
                  saveCurrentSession()
                  setSaveToast(true)
                  setTimeout(() => setSaveToast(false), 2000)
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
                title="保存当前进度"
              >
                💾
              </button>

              {/* Session Manager */}
              <button
                onClick={() => {
                  setNewStoryMode(false)
                  setSessionManagerOpen(true)
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
                title="故事进度管理"
              >
                📂
              </button>

              {/* New Story */}
              <button
                onClick={() => {
                  setNewStoryMode(true)
                  setSessionManagerOpen(true)
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
                title="开始新故事"
              >
                🆕
              </button>
            </div>
          </div>
        </header>

        {/* Story Area */}
        <main className="flex-1 overflow-y-auto story-scroll">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <p className="mb-2">{error}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => generateNextSegment()}
                    className="underline hover:text-red-300"
                  >
                    重试
                  </button>
                  <button
                    onClick={() => setSettingsModalOpen(true)}
                    className="underline hover:text-amber-300 text-amber-400"
                  >
                    ⚙️ 检查 API 设置
                  </button>
                </div>
              </div>
            )}

            {/* Story history */}
            {storyHistory.map((segment, index) => (
              <div key={segment.id} className="mb-8 page-enter">
                {/* Segment indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-slate-700/50" />
                  <span className="text-slate-600 text-xs font-mono">
                    Part {index + 1}
                  </span>
                  <div className="h-px flex-1 bg-slate-700/50" />
                </div>

                {/* Story text */}
                <StoryText
                  content={segment.content}
                  targetWords={segment.targetWordsUsed}
                />

                {/* Choices for the last segment only */}
                {index === storyHistory.length - 1 && segment.choices.length > 0 && !isLoading && (
                  <ChoicePanel
                    choices={segment.choices}
                    onChoice={handleChoice}
                    selectedId={selectedChoice}
                  />
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="mb-8 page-enter">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-slate-700/50" />
                  <span className="text-slate-600 text-xs font-mono">
                    Part {storyHistory.length + 1}
                  </span>
                  <div className="h-px flex-1 bg-slate-700/50" />
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">AI 正在为你编织故事...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={storyEndRef} />
          </div>
        </main>

        {/* Audio Bar */}
        {currentSegment && (
          <AudioBar text={currentSegment.content} />
        )}
      </div>

      {/* Word Panel Sidebar */}
      {sidebarOpen && <WordPanel />}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <SettingsModal onClose={() => setSettingsModalOpen(false)} />
      )}

      {/* Session Manager */}
      {sessionManagerOpen && (
        <SessionManager
          onClose={() => { setSessionManagerOpen(false); setNewStoryMode(false) }}
          newStoryMode={newStoryMode}
        />
      )}

      {/* Save Toast */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium animate-pulse pointer-events-none">
          ✅ 进度已保存
        </div>
      )}
    </div>
  )
}
