// TTS (Text-to-Speech) 服务 — 基于 Web Speech API

let speechSynth: SpeechSynthesis | null = null

// 播放状态
export type TTSState = 'idle' | 'playing' | 'paused'

let state: TTSState = 'idle'
let listeners: Set<(s: TTSState) => void> = new Set()

export function getTTSState(): TTSState {
  return state
}

export function onTTSStateChange(fn: (s: TTSState) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function setState(s: TTSState) {
  state = s
  listeners.forEach(fn => fn(s))
}

function getSynth(): SpeechSynthesis {
  if (!speechSynth) {
    speechSynth = window.speechSynthesis
  }
  return speechSynth
}

// 获取可用语音列表
export function getVoices(): SpeechSynthesisVoice[] {
  return getSynth().getVoices()
}

// 获取最佳英语语音
export function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = getVoices()
  // 优先选择英语母语语音
  const preferred = voices.filter(v =>
    v.lang.startsWith('en-') && (
      v.name.includes('Google') ||
      v.name.includes('Microsoft') ||
      v.name.includes('Samantha') ||
      v.name.includes('Daniel') ||
      v.name.includes('Karen') ||
      v.name.includes('Alex')
    )
  )
  if (preferred.length > 0) return preferred[0]

  // 回退到任意英语语音
  const anyEnglish = voices.filter(v => v.lang.startsWith('en-'))
  if (anyEnglish.length > 0) return anyEnglish[0]

  return null
}

// 朗读单句
export function speakSentence(
  text: string,
  options?: {
    rate?: number       // 语速 0.1-10, 默认 0.9
    pitch?: number      // 音调 0-2, 默认 1
    voice?: SpeechSynthesisVoice
    onEnd?: () => void
    onError?: (e: Error) => void
  }
): void {
  const synth = getSynth()
  synth.cancel() // 停止当前朗读

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = options?.rate ?? 0.9
  utterance.pitch = options?.pitch ?? 1
  utterance.volume = 1

  if (options?.voice) {
    utterance.voice = options.voice
  } else {
    const bestVoice = getBestEnglishVoice()
    if (bestVoice) utterance.voice = bestVoice
  }

  utterance.onstart = () => setState('playing')
  utterance.onend = () => {
    setState('idle')
    options?.onEnd?.()
  }
  utterance.onerror = (e) => {
    setState('idle')
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      options?.onError?.(new Error(`TTS error: ${e.error}`))
    }
  }

  synth.speak(utterance)
}

// 朗读全文（逐句依次朗读）
let sentenceQueue: string[] = []
let queueIndex = 0
let queueOptions: {
  rate?: number
  pitch?: number
  voice?: SpeechSynthesisVoice
  onSentenceStart?: (index: number) => void
  onAllEnd?: () => void
} | null = null

export function speakFullText(
  text: string,
  options?: {
    rate?: number
    pitch?: number
    voice?: SpeechSynthesisVoice
    onSentenceStart?: (index: number, total: number) => void
    onAllEnd?: () => void
  }
): void {
  stopSpeaking()

  // 按句子拆分（英文句号、问号、感叹号后跟空格或结尾）
  const sentences = text.match(/[^.!?\n]+[.!?]+(\s|$)|[^.!?\n]+$/g)
  if (!sentences || sentences.length === 0) {
    speakSentence(text, { ...options, onEnd: options?.onAllEnd })
    return
  }

  sentenceQueue = sentences.map(s => s.trim()).filter(s => s.length > 0)
  queueIndex = 0
  queueOptions = {
    rate: options?.rate,
    pitch: options?.pitch,
    voice: options?.voice,
    onSentenceStart: (i: number) => options?.onSentenceStart?.(i, sentenceQueue.length),
    onAllEnd: options?.onAllEnd,
  }

  playNextInQueue()
}

function playNextInQueue(): void {
  if (queueIndex >= sentenceQueue.length) {
    setState('idle')
    queueOptions?.onAllEnd?.()
    sentenceQueue = []
    queueIndex = 0
    queueOptions = null
    return
  }

  queueOptions?.onSentenceStart?.(queueIndex)

  const sentence = sentenceQueue[queueIndex]
  speakSentence(sentence, {
    rate: queueOptions?.rate,
    pitch: queueOptions?.pitch,
    voice: queueOptions?.voice,
    onEnd: () => {
      queueIndex++
      // 句子间短暂停顿 300ms
      setTimeout(() => playNextInQueue(), 300)
    },
    onError: (e) => {
      console.warn('TTS sentence error:', e)
      queueIndex++
      setTimeout(() => playNextInQueue(), 300)
    },
  })
}

// 暂停朗读
export function pauseSpeaking(): void {
  const synth = getSynth()
  if (state === 'playing') {
    synth.pause()
    setState('paused')
  }
}

// 恢复朗读
export function resumeSpeaking(): void {
  const synth = getSynth()
  if (state === 'paused') {
    synth.resume()
    setState('playing')
  }
}

// 停止朗读
export function stopSpeaking(): void {
  const synth = getSynth()
  synth.cancel()
  sentenceQueue = []
  queueIndex = 0
  queueOptions = null
  setState('idle')
}

// 获取当前朗读的句子索引
export function getCurrentSentenceIndex(): number {
  return queueIndex
}

export function getTotalSentences(): number {
  return sentenceQueue.length
}
