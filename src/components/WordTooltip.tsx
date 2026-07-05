import { useState, useEffect, useRef, useCallback } from 'react'
import { lookupWord, fetchWordPhonetics, speakWordViaTTS } from '../services/dictionary'
import type { WordPhonetics } from '../services/dictionary'
import { useStore } from '../stores/useStore'

interface WordTooltipProps {
  word: string
  position: { x: number; y: number }
  onClose: () => void
}

export default function WordTooltip({ word, position, onClose }: WordTooltipProps) {
  const [meaning, setMeaning] = useState<string>('查询中...')
  const [loading, setLoading] = useState(true)
  const [phonetics, setPhonetics] = useState<WordPhonetics | null>(null)
  const [playing, setPlaying] = useState<'uk' | 'us' | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { markWordLookedUp, wordProgress, toggleWordMastered } = useStore()

  const cleanWord = word.replace(/[^a-zA-Z-']/g, '').toLowerCase()
  const progress = wordProgress[cleanWord]

  // 查词 + 获取音标
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      lookupWord(cleanWord),
      fetchWordPhonetics(cleanWord),
    ]).then(([result, phoneticsData]) => {
      if (!cancelled) {
        setMeaning(result)
        setPhonetics(phoneticsData)
        setLoading(false)
        markWordLookedUp(cleanWord)
      }
    })

    return () => { cancelled = true }
  }, [cleanWord])

  // 点击外部关闭
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.word-tooltip')) {
        onClose()
      }
    }
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  }, [onClose])

  // 清理 audio 元素
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.speechSynthesis.cancel()
    }
  }, [])

  // 播放发音
  const playPronunciation = useCallback((accent: 'uk' | 'us') => {
    // 如果正在播放同一口音，停止
    if (playing === accent) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.speechSynthesis.cancel()
      setPlaying(null)
      return
    }

    // 停止当前播放
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis.cancel()

    const audioUrl = accent === 'uk' ? phonetics?.ukAudio : phonetics?.usAudio

    if (audioUrl && audioUrl.startsWith('https://')) {
      // 使用词典 API 提供的真实发音音频
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      setPlaying(accent)
      audio.onended = () => {
        setPlaying(null)
        audioRef.current = null
      }
      audio.onerror = () => {
        // 音频加载失败，回退到 TTS
        audioRef.current = null
        speakWordViaTTS(cleanWord, accent)
        setPlaying(null)
      }
      audio.play().catch(() => {
        // 播放失败，回退到 TTS
        audioRef.current = null
        speakWordViaTTS(cleanWord, accent)
        setPlaying(null)
      })
    } else {
      // 无音频 URL，使用 Web Speech API TTS
      setPlaying(accent)
      speakWordViaTTS(cleanWord, accent)
      // TTS 时长估算：~500ms/单词
      setTimeout(() => setPlaying(null), Math.max(800, cleanWord.length * 150))
    }
  }, [cleanWord, phonetics, playing])

  // 音标显示文本（优先英式）
  const phoneticText = phonetics?.ukPhonetic || phonetics?.usPhonetic || phonetics?.phonetic || ''

  return (
    <div
      className="word-tooltip fixed z-50 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 min-w-[220px] max-w-[340px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Arrow */}
      <div
        className="absolute left-1/2 -bottom-2 w-4 h-4 bg-slate-800 border-r border-b border-slate-600 rotate-45"
        style={{ marginLeft: '-8px' }}
      />

      {/* Word + Close */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-bold text-lg">{cleanWord}</span>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white text-sm leading-none px-1"
        >
          ✕
        </button>
      </div>

      {/* Phonetic + Pronunciation Buttons */}
      <div className="flex items-center gap-2 mb-3">
        {/* Phonetic text */}
        {phoneticText && (
          <span className="text-slate-400 text-sm font-mono">
            {phoneticText}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* UK Button */}
        <button
          onClick={() => playPronunciation('uk')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            playing === 'uk'
              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
              : 'bg-slate-700/70 text-slate-400 hover:text-white hover:bg-slate-600 border border-slate-600'
          }`}
          title="英式发音"
        >
          🇬🇧 {playing === 'uk' ? '⏹' : '🔊'}
        </button>

        {/* US Button */}
        <button
          onClick={() => playPronunciation('us')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            playing === 'us'
              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
              : 'bg-slate-700/70 text-slate-400 hover:text-white hover:bg-slate-600 border border-slate-600'
          }`}
          title="美式发音"
        >
          🇺🇸 {playing === 'us' ? '⏹' : '🔊'}
        </button>
      </div>

      {/* Meaning */}
      <div className="text-slate-300 text-sm mb-3 bg-slate-700/30 rounded-lg px-3 py-2">
        {loading ? (
          <span className="text-slate-500">查询中...</span>
        ) : (
          <span>{meaning}</span>
        )}
      </div>

      {/* Progress & Actions */}
      {progress && (
        <div className="border-t border-slate-700 pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>故事中出现 {progress.encountered} 次</span>
            <span>查阅 {progress.lookedUp} 次</span>
          </div>
          <button
            onClick={() => toggleWordMastered(cleanWord)}
            className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
              progress.mastered
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 border border-slate-600'
            }`}
          >
            {progress.mastered ? '✓ 已掌握' : '标记为已掌握'}
          </button>
        </div>
      )}
    </div>
  )
}
