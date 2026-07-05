import type { Choice } from '../types'

interface ChoicePanelProps {
  choices: Choice[]
  onChoice: (id: string, text: string) => void
  selectedId: string | null
}

export default function ChoicePanel({ choices, onChoice, selectedId }: ChoicePanelProps) {
  if (choices.length === 0) return null

  return (
    <div className="mt-8 space-y-3">
      <p className="text-slate-500 text-sm font-medium mb-2">
        📍 选择你的下一步行动：
      </p>
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          onClick={() => onChoice(choice.id, choice.text)}
          disabled={selectedId !== null}
          className={`choice-enter w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group ${
            selectedId === choice.id
              ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
              : selectedId !== null
              ? 'border-slate-700/50 bg-slate-800/30 opacity-50'
              : 'border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-indigo-500/5'
          }`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start gap-3">
            <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
              selectedId === choice.id
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-700 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
            }`}>
              {String.fromCharCode(65 + index)}
            </span>
            <div className="flex-1">
              <p className={`font-medium ${
                selectedId === choice.id ? 'text-indigo-300' : 'text-slate-200 group-hover:text-white'
              }`}>
                {choice.text}
              </p>
              {choice.summary && (
                <p className="text-slate-500 text-sm mt-1">{choice.summary}</p>
              )}
            </div>
            <span className={`flex-shrink-0 text-lg transition-opacity ${
              selectedId === choice.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              →
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
