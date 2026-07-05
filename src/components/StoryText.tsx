import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useStore } from '../stores/useStore'
import WordTooltip from './WordTooltip'

interface StoryTextProps {
  content: string
  targetWords: string[]
}

export default function StoryText({ content, targetWords }: StoryTextProps) {
  // 只订阅需要的 action（稳定引用，不会触发额外渲染）
  const markWordsEncountered = useStore(s => s.markWordsEncountered)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  // 追踪已经标记过的词汇，避免重复触发
  const markedRef = useRef<Set<string>>(new Set())

  // 当 content 变化时，提取目标词汇并标记一次（只运行一次，不会无限循环）
  useEffect(() => {
    const targetSet = new Set(targetWords.map(w => w.toLowerCase()))
    const newWords: string[] = []

    const matches = content.match(/\*\*(.*?)\*\*/g)
    if (matches) {
      matches.forEach(m => {
        const raw = m.slice(2, -2)
        const word = raw.replace(/[^a-zA-Z-']/g, '').toLowerCase()
        if (targetSet.has(word) && !markedRef.current.has(word)) {
          markedRef.current.add(word)
          newWords.push(word)
        }
      })
    }

    // 批量标记（一次 store 更新，而非每个词一次）
    if (newWords.length > 0) {
      requestAnimationFrame(() => {
        markWordsEncountered(newWords)
      })
    }

    // content 改变时重置 markedRef（开始新段落）
    return () => {
      // 仅在组件卸载时清理，不在 content 变化时清理
      // 因为同一故事的不同段落可能包含相同目标词汇，应该累计计数
    }
  }, [content, targetWords, markWordsEncountered])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      markedRef.current.clear()
    }
  }, [])

  const handleWordClick = useCallback((word: string, event: React.MouseEvent) => {
    const cleanWord = word.replace(/[^a-zA-Z-']/g, '').toLowerCase()
    if (!cleanWord || cleanWord.length <= 1) return

    setSelectedWord(cleanWord)

    // 计算 tooltip 位置（相对于视口）
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    })
  }, [])

  // 用 useMemo 缓存渲染结果，避免 content 未变时重新计算
  const renderedContent = useMemo(() => {
    const parts: React.ReactNode[] = []

    const segments = content.split(/(\*\*.*?\*\*)/g)

    segments.forEach((segment, segIndex) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        const word = segment.slice(2, -2)

        parts.push(
          <span
            key={`target-${segIndex}`}
            className="word-target text-amber-300 font-medium cursor-pointer"
            onClick={(e) => handleWordClick(word, e)}
            title="目标词汇 — 点击查看释义"
          >
            {word}
          </span>
        )
      } else {
        const words = segment.split(/(\s+)/)
        words.forEach((word, wordIndex) => {
          if (/^\s+$/.test(word)) {
            parts.push(<span key={`space-${segIndex}-${wordIndex}`}>{word}</span>)
          } else if (word.length > 0) {
            const match = word.match(/^([a-zA-Z'-]+)([.,!?;:'")\]}]*)$/)
            if (match) {
              parts.push(
                <span
                  key={`word-${segIndex}-${wordIndex}`}
                  className="word-clickable"
                  onClick={(e) => handleWordClick(match[1], e)}
                >
                  {match[1]}
                </span>
              )
              if (match[2]) {
                parts.push(<span key={`punct-${segIndex}-${wordIndex}`}>{match[2]}</span>)
              }
            } else {
              parts.push(<span key={`text-${segIndex}-${wordIndex}`}>{word}</span>)
            }
          }
        })
      }
    })

    return parts
  }, [content, handleWordClick])

  return (
    <div ref={containerRef} className="relative">
      <div className="text-lg leading-relaxed text-slate-200 font-serif tracking-wide selection:bg-indigo-500/30">
        {renderedContent}
      </div>

      {selectedWord && (
        <WordTooltip
          word={selectedWord}
          position={tooltipPos}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  )
}
