import { useState } from 'react'
import { useStore } from '../stores/useStore'
import { CEFR_LEVELS, GENRES } from '../types'
import type { CEFRLevel, StoryGenre } from '../types'
import { presetWordLists } from '../data/wordLists'
import { getDefaultEndpoint } from '../services/ai'

type Step = 1 | 2 | 3 | 4

// 可用的模型列表
const MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', hint: 'OpenAI · 推荐' },
  { value: 'gpt-4o', label: 'GPT-4o', hint: 'OpenAI · 更高质量' },
  { value: 'deepseek-chat', label: 'DeepSeek V3', hint: 'DeepSeek · 国内推荐' },
  { value: 'deepseek-reasoner', label: 'DeepSeek R1', hint: 'DeepSeek · 推理增强' },
]

export default function SetupWizard() {
  const { settings, updateSettings, createSession } = useStore()
  const [step, setStep] = useState<Step>(1)
  const [level, setLevel] = useState<CEFRLevel>(settings.level)
  const [genres, setGenres] = useState<StoryGenre[]>(settings.genres)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
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

  const handleComplete = () => {
    const wordList = customWords
      .split(/[,，\s\n]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 1)

    // 保存全局设置（API key 等跨会话共享）
    updateSettings({
      apiKey,
      apiEndpoint,
      model,
      hasCompletedSetup: true,
    })

    // 创建首个会话（level、genre、wordList 为会话级）
    const finalGenres: StoryGenre[] = genres.length > 0 ? genres : ['medieval-fantasy']
    const genreLabel = GENRES.find(g => g.value === finalGenres[0])?.label || '故事'
    createSession(
      `${genreLabel} - ${new Date().toLocaleDateString('zh-CN')}`,
      level,
      finalGenres,
      wordList,
      wordLabel || '自定义词库',
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-indigo-400">A</span>
            <span className="text-amber-400">+1</span>
            <span className="text-white"> 快</span>
          </h1>
          <p className="text-slate-400 text-lg">
            基于克拉申 i+1 理论 · 交互式英文故事学习
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-indigo-500 w-12' : 'bg-slate-700 w-8'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-8 shadow-2xl">
          {/* Step 1: Level */}
          {step === 1 && (
            <div className="page-enter">
              <h2 className="text-2xl font-semibold text-white mb-2">选择你的英语水平</h2>
              <p className="text-slate-400 mb-6">AI 会根据你的水平生成难度恰好的故事（i+1 原则）</p>
              <div className="space-y-3">
                {CEFR_LEVELS.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      level === l.value
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-lg ${
                        level === l.value ? 'text-indigo-300' : 'text-slate-300'
                      }`}>{l.label}</span>
                      {level === l.value && (
                        <span className="text-indigo-400 text-sm">✓ 已选择</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{l.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Genre */}
          {step === 2 && (
            <div className="page-enter">
              <h2 className="text-2xl font-semibold text-white mb-2">选择你感兴趣的故事题材</h2>
              <p className="text-slate-400 mb-6">可多选，AI 会融合你选择的题材来生成故事</p>
              <div className="grid grid-cols-2 gap-3">
                {GENRES.map(g => (
                  <button
                    key={g.value}
                    onClick={() => toggleGenre(g.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      genres.includes(g.value)
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl mr-2">{g.emoji}</span>
                    <span className={`font-medium ${
                      genres.includes(g.value) ? 'text-indigo-300' : 'text-slate-300'
                    }`}>{g.label}</span>
                  </button>
                ))}
              </div>
              {genres.length === 0 && (
                <p className="text-amber-400 text-sm mt-3">请至少选择一个题材</p>
              )}
            </div>
          )}

          {/* Step 3: Word List */}
          {step === 3 && (
            <div className="page-enter">
              <h2 className="text-2xl font-semibold text-white mb-2">导入你想掌握的词汇</h2>
              <p className="text-slate-400 mb-6">
                AI 会在故事中自然地反复使用这些词汇，让你在阅读中不知不觉记住它们
              </p>

              {/* Presets */}
              <div className="mb-6">
                <p className="text-slate-300 text-sm font-medium mb-3">📚 预设词库（一键导入）</p>
                <div className="flex flex-wrap gap-2">
                  {presetWordLists.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectPreset(p.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPreset === p.id
                          ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-300'
                          : 'bg-slate-700/50 border-2 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Words */}
              <div>
                <p className="text-slate-300 text-sm font-medium mb-2">✏️ 自定义词库（用逗号或空格分隔）</p>
                <textarea
                  value={customWords}
                  onChange={e => {
                    setCustomWords(e.target.value)
                    setSelectedPreset('')
                    setWordLabel('')
                  }}
                  placeholder="例如：abandon, achieve, brilliant, challenge..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none font-mono text-sm"
                />
                <p className="text-slate-500 text-xs mt-1">
                  已输入 {customWords.split(/[,，\s\n]+/).filter(w => w.trim().length > 1).length} 个词汇
                </p>
              </div>
            </div>
          )}

          {/* Step 4: API Key */}
          {step === 4 && (
            <div className="page-enter">
              <h2 className="text-2xl font-semibold text-white mb-2">配置 AI 服务</h2>
              <p className="text-slate-400 mb-6">
                需要 OpenAI 兼容的 API Key 来驱动故事生成。Key 仅保存在你的浏览器本地。
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">模型</label>
                  <select
                    value={model}
                    onChange={e => {
                      const newModel = e.target.value
                      setModel(newModel)
                      setApiEndpoint(getDefaultEndpoint(newModel))
                    }}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {MODEL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — {opt.hint}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">API 端点</label>
                  <input
                    type="text"
                    value={apiEndpoint}
                    onChange={e => setApiEndpoint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    选择模型后自动填入对应端点，也可手动修改
                  </p>
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    🔒 Key 仅保存在浏览器 localStorage，不会上传到任何服务器
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1) as Step)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              step === 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            disabled={step === 1}
          >
            ← 上一步
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(prev => Math.min(4, prev + 1) as Step)}
              disabled={step === 2 && genres.length === 0}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${
                step === 2 && genres.length === 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
              }`}
            >
              下一步 →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!apiKey.trim()}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                !apiKey.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-amber-600 text-white hover:from-indigo-500 hover:to-amber-500 shadow-lg shadow-indigo-500/25'
              }`}
            >
              🚀 开始阅读故事
            </button>
          )}
        </div>

        {/* Skip hint on step 3 */}
        {step === 3 && (
          <p className="text-center text-slate-600 text-sm mt-3">
            可以跳过此步骤，后续在设置中随时添加词库
          </p>
        )}
      </div>
    </div>
  )
}
