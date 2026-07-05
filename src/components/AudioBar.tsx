import { useState, useCallback, useEffect } from 'react'
import {
  speakSentence, speakFullText, pauseSpeaking, resumeSpeaking,
  stopSpeaking, getTTSState, onTTSStateChange,
} from '../services/tts'
import type { TTSState } from '../services/tts'

interface AudioBarProps {
  text: string
}

export default function AudioBar({ text }: AudioBarProps) {
  const [ttsState, setTtsState] = useState<TTSState>(getTTSState())
  const [rate, setRate] = useState(0.9)
  const [currentSentence, setCurrentSentence] = useState(0)
  const [totalSentences, setTotalSentences] = useState(0)

  useEffect(() => {
    const unsub = onTTSStateChange(setTtsState)
    return unsub
  }, [])

  const handlePlaySentence = useCallback(() => {
    if (ttsState === 'playing') {
      pauseSpeaking()
    } else if (ttsState === 'paused') {
      resumeSpeaking()
    } else {
      speakSentence(text, { rate })
    }
  }, [text, rate, ttsState])

  const handlePlayFull = useCallback(() => {
    if (ttsState === 'playing') {
      stopSpeaking()
      return
    }
    if (ttsState === 'paused') {
      resumeSpeaking()
      return
    }
    speakFullText(text, {
      rate,
      onSentenceStart: (index, total) => {
        setCurrentSentence(index)
        setTotalSentences(total)
      },
      onAllEnd: () => {
        setCurrentSentence(0)
        setTotalSentences(0)
      },
    })
  }, [text, rate, ttsState])

  const handleStop = useCallback(() => {
    stopSpeaking()
    setCurrentSentence(0)
  }, [])

  return (
    <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-700/50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Play Sentence */}
        <button
          onClick={handlePlaySentence}
          className={`p-2.5 rounded-xl transition-all ${
            ttsState === 'playing'
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title="朗读当前段落"
        >
          {ttsState === 'playing' ? '⏸' : '▶'}
        </button>

        {/* Play Full Text */}
        <button
          onClick={handlePlayFull}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            ttsState === 'playing'
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title="全文朗读"
        >
          {ttsState === 'playing' ? '⏸ 暂停' : '📖 全文朗读'}
        </button>

        {/* Stop */}
        <button
          onClick={handleStop}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          title="停止朗读"
        >
          ⏹
        </button>

        {/* Rate Control */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-slate-500 text-xs">语速</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={rate}
            onChange={e => setRate(parseFloat(e.target.value))}
            className="w-20 accent-indigo-500"
          />
          <span className="text-slate-400 text-xs w-8">{rate}x</span>
        </div>

        {/* Progress indicator */}
        {totalSentences > 0 && (
          <span className="text-slate-500 text-xs">
            {currentSentence + 1}/{totalSentences}
          </span>
        )}
      </div>
    </div>
  )
}
