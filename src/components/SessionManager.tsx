import { useState } from 'react'
import { useStore } from '../stores/useStore'
import { GENRES } from '../types'
import type { StoryGenre } from '../types'

interface SessionManagerProps {
  onClose: () => void
  /** If true, "save then start new" mode */
  newStoryMode?: boolean
}

export default function SessionManager({ onClose, newStoryMode }: SessionManagerProps) {
  const {
    sessions, currentSessionId,
    loadSession, deleteSession, renameSession, saveCurrentSession, createSession,
    settings,
  } = useStore()

  const [showNewForm, setShowNewForm] = useState(!!newStoryMode)
  const [newName, setNewName] = useState('')
  const [newGenres, setNewGenres] = useState<StoryGenre[]>(settings.genres)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [savedToast, setSavedToast] = useState(false)
  const [apiMissing, setApiMissing] = useState(false)

  const hasApiConfigured = !!(settings.apiKey && settings.apiEndpoint)

  // 排序：最近更新的在前
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  const currentSession = sessions.find(s => s.id === currentSessionId)

  const handleLoad = (id: string) => {
    saveCurrentSession() // 先保存当前
    loadSession(id)
    onClose()
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`确定要删除「${name}」吗？此操作不可撤销。`)) return
    deleteSession(id)
    if (id === currentSessionId && sessions.length <= 1) {
      onClose()
    }
  }

  const handleRename = (id: string) => {
    if (renameValue.trim()) {
      renameSession(id, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleCreate = () => {
    if (!newName.trim() || newGenres.length === 0) return

    // 检查 API 是否已配置
    if (!hasApiConfigured) {
      setApiMissing(true)
      return
    }

    saveCurrentSession()
    // 使用当前全局设置 + 新选题材
    const currentSessionData = currentSession
    const level = currentSessionData?.level || settings.level || 'B1'
    const wordList = currentSessionData?.customWordList || settings.customWordList || []
    const wordLabel = currentSessionData?.wordListLabel || settings.wordListLabel || ''
    createSession(newName.trim(), level, newGenres, wordList, wordLabel)
    setShowNewForm(false)
    setNewName('')
    onClose()
  }

  const handleManualSave = () => {
    saveCurrentSession()
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60_000) return '刚刚'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const getGenreInfo = (genres?: StoryGenre[]) => {
    if (!genres || genres.length === 0) return { emoji: '📖', label: '未设定' }
    const g = GENRES.find(x => x.value === genres[0])
    return g || { emoji: '📖', label: genres[0] }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-slate-850 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        style={{ backgroundColor: '#1e293b' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-white text-lg font-semibold">
            {showNewForm ? '🆕 新建故事' : '📂 故事进度'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {/* Saved Toast */}
          {savedToast && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-2 text-center animate-pulse">
              ✅ 已保存
            </div>
          )}

          {/* New Session Form */}
          {showNewForm ? (
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">故事名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="例如：中世纪奇幻冒险"
                  autoFocus
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">故事题材</label>
                <div className="grid grid-cols-2 gap-2">
                  {GENRES.map(g => (
                    <button
                      key={g.value}
                      onClick={() => setNewGenres(prev =>
                        prev.includes(g.value) ? prev.filter(x => x !== g.value) : [...prev, g.value]
                      )}
                      className={`p-2.5 rounded-lg border-2 text-left text-sm transition-all ${
                        newGenres.includes(g.value)
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="mr-1">{g.emoji}</span> {g.label}
                    </button>
                  ))}
                </div>
                {newGenres.length === 0 && (
                  <p className="text-amber-400 text-xs mt-2">请至少选一个题材</p>
                )}
              </div>
              {/* API Missing Warning */}
              {apiMissing && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-400 text-sm mb-2">⚠️ 尚未配置 AI 服务，无法生成故事</p>
                  <p className="text-slate-400 text-xs mb-3">
                    请先完成初始设置，配置 API Key 和端点后再创建故事
                  </p>
                  <button
                    onClick={() => { onClose() }}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-500 transition-colors"
                  >
                    返回首页进行设置 →
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowNewForm(false); setApiMissing(false) }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || newGenres.length === 0}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    !newName.trim() || newGenres.length === 0
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  创建并开始
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* API 未配置警告 */}
              {!hasApiConfigured && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                  <p className="text-amber-400 text-sm mb-1">⚠️ AI 服务未配置</p>
                  <p className="text-slate-400 text-xs">
                    请先在设置中配置 API Key 和端点，才能生成故事。当前页面为空壳，故事无法生成。
                  </p>
                </div>
              )}

              {/* Current Session */}
              {currentSession && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-2">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs mb-1">
                    <span className="bg-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium">当前</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium text-sm">
                        {currentSession.name}
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {getGenreInfo(currentSession.genres).emoji} {getGenreInfo(currentSession.genres).label}
                        {' · '}{currentSession.storyHistory.length} 段
                        {' · '}更新于 {formatTime(currentSession.updatedAt)}
                      </div>
                    </div>
                    <button
                      onClick={handleManualSave}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
                    >
                      💾 立即保存
                    </button>
                  </div>
                </div>
              )}

              {/* Session List */}
              {sorted.length === 0 && !currentSession ? (
                <div className="text-center py-10">
                  <p className="text-5xl mb-4">📭</p>
                  <p className="text-slate-500 text-sm">还没有保存的故事</p>
                  <p className="text-slate-600 text-xs mt-1">点击下方按钮开始第一个故事</p>
                </div>
              ) : (
                sorted.map(session => {
                  const isCurrent = session.id === currentSessionId
                  const genreInfo = getGenreInfo(session.genres)
                  const isRenaming = renamingId === session.id

                  return (
                    <div
                      key={session.id}
                      className={`rounded-xl border-2 p-4 transition-all ${
                        isCurrent
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      {isRenaming ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            autoFocus
                            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRename(session.id)
                              if (e.key === 'Escape') setRenamingId(null)
                            }}
                            onBlur={() => handleRename(session.id)}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium text-sm">{session.name}</span>
                              {isCurrent && (
                                <span className="bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                  当前
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <span>{genreInfo.emoji} {genreInfo.label}</span>
                            <span>📝 {session.storyHistory.length} 段</span>
                            <span>🕐 {formatTime(session.updatedAt)}</span>
                          </div>
                          <div className="flex gap-2">
                            {!isCurrent && (
                              <button
                                onClick={() => handleLoad(session.id)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
                              >
                                📂 继续
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setRenamingId(session.id)
                                setRenameValue(session.name)
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-400 text-xs hover:text-white hover:bg-slate-600 transition-colors"
                            >
                              ✏️ 重命名
                            </button>
                            <button
                              onClick={() => handleDelete(session.id, session.name)}
                              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-500 text-xs hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              🗑️ 删除
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              )}

              {/* Create New */}
              {!showNewForm && (
                <button
                  onClick={() => {
                    setShowNewForm(true)
                    setNewName('')
                    setNewGenres(settings.genres)
                  }}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-slate-600 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all text-sm font-medium"
                >
                  ➕ 新建故事
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!showNewForm && (
          <div className="px-5 py-3 border-t border-slate-700">
            <p className="text-slate-600 text-xs text-center">
              💡 所有数据存储在浏览器本地，不会上传到服务器
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
