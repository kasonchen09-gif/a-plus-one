import { useStore } from '../stores/useStore'

export default function WordPanel() {
  const { wordProgress, settings, toggleWordMastered } = useStore()
  const entries = Object.values(wordProgress)

  // 统计
  const total = settings.customWordList.length
  const encountered = entries.filter(e => e.encountered > 0).length
  const mastered = entries.filter(e => e.mastered).length
  const notSeen = settings.customWordList.filter(
    w => !wordProgress[w.toLowerCase()] || wordProgress[w.toLowerCase()].encountered === 0
  )

  const sortedEntries = entries.sort((a, b) => b.encountered - a.encountered)

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700/50 overflow-y-auto z-20 shadow-2xl">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">📖 词汇面板</h3>
          <span className="text-slate-500 text-xs bg-slate-800 px-2 py-1 rounded-full">
            {settings.wordListLabel || '自定义词库'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-indigo-400">{total}</div>
            <div className="text-slate-500 text-xs mt-1">目标词</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{encountered}</div>
            <div className="text-slate-500 text-xs mt-1">已遇见</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{mastered}</div>
            <div className="text-slate-500 text-xs mt-1">已掌握</div>
          </div>
        </div>

        {/* Progress Bar */}
        {total > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>学习进度</span>
              <span>{Math.round((encountered / total) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(encountered / total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Encountered Words */}
        {sortedEntries.length > 0 && (
          <div className="mb-6">
            <h4 className="text-slate-400 text-sm font-medium mb-3">
              已遇见的词汇 ({encountered})
            </h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sortedEntries.filter(e => e.encountered > 0).map(entry => (
                <div
                  key={entry.word}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    entry.mastered
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-slate-800/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      entry.mastered ? 'text-green-400 line-through' : 'text-slate-200'
                    }`}>
                      {entry.word}
                    </span>
                    <span className="text-slate-600 text-xs">
                      ×{entry.encountered}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleWordMastered(entry.word)}
                    className={`text-xs px-2 py-0.5 rounded transition-colors ${
                      entry.mastered
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-slate-600 hover:text-amber-400'
                    }`}
                    title={entry.mastered ? '取消掌握' : '标记掌握'}
                  >
                    {entry.mastered ? '✓' : '○'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not Seen Yet */}
        {notSeen.length > 0 && (
          <div>
            <h4 className="text-slate-500 text-sm font-medium mb-3">
              尚未遇见 ({notSeen.length})
            </h4>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {notSeen.slice(0, 50).map(word => (
                <span
                  key={word}
                  className="text-xs text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded"
                >
                  {word}
                </span>
              ))}
              {notSeen.length > 50 && (
                <span className="text-xs text-slate-600">
                  ...还有 {notSeen.length - 50} 个
                </span>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {entries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-600 text-sm">
              还没有导入词库？
            </p>
            <p className="text-slate-700 text-xs mt-1">
              在设置中添加 CET-4/6、雅思、托福词表
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
