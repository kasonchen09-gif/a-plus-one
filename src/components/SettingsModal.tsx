import { useState } from 'react'
import { useStore } from '../stores/useStore'
import { CEFR_LEVELS, GENRES } from '../types'
import type { CEFRLevel, StoryGenre } from '../types'
import { presetWordLists } from '../data/wordLists'
import { getDefaultEndpoint } from '../services/ai'

// 可用的模型列表
const MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', hint: 'OpenAI · 推荐' },
  { value: 'gpt-4o', label: 'GPT-4o', hint: 'OpenAI · 更高质量' },
  { value: 'deepseek-chat', label: 'DeepSeek V3', hint: 'DeepSeek · 国内推荐' },
  { value: 'deepseek-reasoner', label: 'DeepSeek R1', hint: 'DeepSeek · 推理增强' },
]

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetSettings, clearStory, currentSessionId, deleteSession } = useStore()
  const [level, setLevel] = useState<CEFRLevel>(settings.level)
  const [genres, setGenres] = useState<StoryGenre[]>(settings.genres)
  const [selectedPreset, setSelectedPreset] = useState(() => {
    const match = presetWordLists.find(p => p.label === settings.wordListLabel)
    return match?.id || ''
  })
  const [customWords, setCustomWords] = useState(settings.customWordList.join(', '))
  const [wordLabel, setWordLabel] = useState(settings.wordListLabel)
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [apiEndpoint, setApiEndpoint] = useState(settings.apiEndpoint)
  const [model, setModel] = useState(settings.model)

  const toggleGenre = (g: StoryGenre) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const selectPreset = (id: string) => {
    if (selectedPreset === id) {
      setSelectedPreset('')
      setCustomWords('')
      setWordLabel('')
    } else {
      const preset = presetWordLists.find(p => p.id === id)
      if (preset) {
        setSelectedPreset(id)
        setCustomWords(preset.words.join(', '))
        setWordLabel(preset.label)
      }
    }
  }

  const handleSave = () => {
    const wordList = customWords
      .split(/[,，\s\n]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 1)

    updateSettings({
      level,
      genres: genres.length > 0 ? genres : ['medieval-fantasy'],
      apiKey,
      apiEndpoint,
      model,
      customWordList: wordList,
      wordListLabel: wordLabel || '自定义词库',
    })
    onClose()
  }

  const handleReset = () => {
    if (confirm('确定要清除所有设置和数据吗？此操作不可撤销（包括所有故事进度）。')) {
      // 删除当前会话
      if (currentSessionId) deleteSession(currentSessionId)
      resetSettings()
      clearStory()
      onClose()
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 rounded-t-2xl border-b border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">⚙️ 设置</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Level */}
          <div>
            <h3 className="text-slate-300 font-medium mb-3">英语水平</h3>
            <div className="space-y-2">
              {CEFR_LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    level === l.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span className={level === l.value ? 'text-indigo-300 font-medium' : 'text-slate-300'}>
                    {l.label}
                  </span>
                  <span className="text-slate-500 text-sm ml-2">{l.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-slate-300 font-medium mb-3">故事题材（可多选）</h3>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map(g => (
                <button
                  key={g.value}
                  onClick={() => toggleGenre(g.value)}
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${
                    genres.includes(g.value)
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span className="mr-1">{g.emoji}</span>
                  <span className={genres.includes(g.value) ? 'text-indigo-300' : 'text-slate-400'}>
                    {g.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Word List */}
          <div>
            <h3 className="text-slate-300 font-medium mb-3">词库</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetWordLists.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectPreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedPreset === p.id
                      ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-300'
                      : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <textarea
              value={customWords}
              onChange={e => {
                setCustomWords(e.target.value)
                setSelectedPreset('')
                setWordLabel('')
              }}
              placeholder="自定义词汇，用逗号分隔..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none text-sm font-mono"
            />
          </div>

          {/* API Settings */}
          <div>
            <h3 className="text-slate-300 font-medium mb-3">AI 服务配置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1">模型</label>
                <select
                  value={model}
                  onChange={e => {
                    const newModel = e.target.value
                    setModel(newModel)
                    setApiEndpoint(getDefaultEndpoint(newModel))
                  }}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  {MODEL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.hint}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">API 端点</label>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={e => setApiEndpoint(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none font-mono"
                />
                <p className="text-slate-600 text-xs mt-1">选择模型后自动填入，也可手动修改</p>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                />
                <p className="text-slate-600 text-xs mt-1">🔒 仅保存在本地浏览器中</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 rounded-b-2xl border-t border-slate-700 p-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            重置全部数据
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
