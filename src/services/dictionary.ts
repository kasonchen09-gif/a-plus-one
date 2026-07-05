import { buildDictionary, presetWordLists } from '../data/wordLists'

// 构建内置词典
const builtInDict = buildDictionary(presetWordLists)

// 简易常用词词典（扩展覆盖）
const commonWords: Record<string, string> = {
  the: '这个；那个（定冠词）',
  a: '一个（不定冠词）',
  an: '一个（不定冠词，用于元音前）',
  is: '是',
  are: '是',
  was: '是（过去式）',
  were: '是（过去式）',
  be: '是；成为',
  been: '是（过去分词）',
  being: '是（现在分词）',
  have: '有',
  has: '有',
  had: '有（过去式）',
  do: '做',
  does: '做',
  did: '做（过去式）',
  will: '将会',
  would: '会（过去式/虚拟）',
  can: '能；可以',
  could: '能（过去式）',
  should: '应该',
  may: '可能；可以',
  might: '可能',
  must: '必须',
  shall: '应当',
  i: '我',
  you: '你；你们',
  he: '他',
  she: '她',
  it: '它',
  we: '我们',
  they: '他们；她们；它们',
  me: '我（宾格）',
  him: '他（宾格）',
  her: '她（宾格）；她的',
  us: '我们（宾格）',
  them: '他们（宾格）',
  my: '我的',
  your: '你的；你们的',
  his: '他的',
  its: '它的',
  our: '我们的',
  their: '他们的',
  this: '这个',
  that: '那个',
  these: '这些',
  those: '那些',
  here: '这里',
  there: '那里',
  what: '什么',
  who: '谁',
  whom: '谁（宾格）',
  which: '哪一个',
  when: '什么时候',
  where: '哪里',
  why: '为什么',
  how: '怎样；如何',
  not: '不；不是',
  no: '不；没有',
  yes: '是的',
  and: '和；并且',
  but: '但是',
  or: '或者',
  so: '所以；如此',
  because: '因为',
  if: '如果',
  then: '然后；那么',
  than: '比',
  too: '也；太',
  very: '非常',
  just: '刚刚；只是',
  now: '现在',
  then: '然后',
  always: '总是',
  never: '从不',
  sometimes: '有时',
  often: '经常',
  usually: '通常',
  really: '真正地',
  still: '仍然',
  already: '已经',
  yet: '还；然而',
  only: '只有；仅仅',
  also: '也',
  even: '甚至',
  again: '再次',
  well: '好地；那么',
  however: '然而',
  therefore: '因此',
  furthermore: '此外',
  moreover: '而且',
  nevertheless: '尽管如此',
  otherwise: '否则',
  meanwhile: '与此同时',
  indeed: '确实',
  perhaps: '也许',
  maybe: '可能',
  probably: '可能',
  certainly: '当然',
  definitely: '肯定地',
  absolutely: '绝对地',
  exactly: '确切地',
  suddenly: '突然地',
  quickly: '快速地',
  slowly: '慢慢地',
  carefully: '小心地',
  easily: '容易地',
  finally: '最终',
  eventually: '最终',
  immediately: '立刻',
  recently: '最近',
  ago: '以前',
  before: '在…之前',
  after: '在…之后',
  during: '在…期间',
  until: '直到',
  since: '自从；因为',
  for: '为了；对于；因为',
  with: '和；用；带有',
  without: '没有',
  about: '关于；大约',
  against: '反对；靠着',
  between: '在…之间',
  among: '在…之中',
  through: '通过；穿过',
  across: '穿过；横过',
  along: '沿着',
  around: '围绕；大约',
  toward: '朝向',
  towards: '朝向',
  behind: '在…后面',
  beyond: '超出',
  above: '在…上方',
  below: '在…下方',
  under: '在…下面',
  over: '在…上方；超过',
  into: '进入',
  out: '出去',
  up: '向上',
  down: '向下',
  on: '在…上；关于',
  off: '离开；关闭',
  at: '在（某处/某时）',
  in: '在…里面；在（时间）',
  by: '由；通过；在…旁边',
  to: '到；向；对于',
  from: '从；来自',
  of: '…的；属于',
  all: '所有；全部',
  some: '一些',
  any: '任何；一些',
  many: '许多',
  much: '许多',
  more: '更多',
  most: '大多数；最',
  few: '很少',
  little: '小的；少的',
  less: '更少',
  least: '最少',
  other: '其他的',
  another: '另一个',
  same: '相同的',
  different: '不同的',
  own: '自己的',
  such: '这样的；如此的',
  each: '每个',
  every: '每一个',
  both: '两者都',
  either: '两者之一',
  neither: '两者都不',
  none: '没有一个',
  nothing: '没有什么',
  something: '某事；某物',
  anything: '任何事物',
  everything: '一切',
  everyone: '每个人',
  someone: '某人',
  anyone: '任何人',
  noone: '没有人',
  thing: '事物；东西',
  things: '事物（复数）',
  time: '时间；次数',
  times: '次数；时代',
  way: '方式；路',
  ways: '方式（复数）',
  day: '天；日子',
  days: '日子（复数）',
  night: '夜晚',
  week: '周',
  month: '月',
  year: '年',
  life: '生活；生命',
  world: '世界',
  people: '人们；人民',
  man: '男人；人',
  woman: '女人',
  child: '孩子',
  children: '孩子们',
  friend: '朋友',
  family: '家庭',
  house: '房子',
  home: '家',
  work: '工作',
  school: '学校',
  place: '地方',
  city: '城市',
  country: '国家',
  water: '水',
  food: '食物',
  hand: '手',
  head: '头',
  eye: '眼睛',
  face: '脸',
  heart: '心；心脏',
  mind: '头脑；想法',
  body: '身体',
  word: '词；单词',
  end: '结束；尽头',
  start: '开始',
  begin: '开始',
  stop: '停止',
  keep: '保持；继续',
  let: '让',
  make: '制造；使',
  get: '得到；变得',
  take: '拿；带；花费',
  give: '给',
  put: '放',
  set: '设置；放置',
  come: '来',
  go: '去',
  run: '跑',
  walk: '走',
  turn: '转；变为',
  move: '移动',
  leave: '离开',
  bring: '带来',
  carry: '携带',
  hold: '握住；保持',
  find: '找到；发现',
  lose: '失去；迷路',
  fall: '落下；跌倒',
  hear: '听见',
  listen: '听',
  see: '看见',
  look: '看',
  watch: '观看',
  feel: '感觉',
  think: '想；认为',
  know: '知道',
  understand: '理解',
  remember: '记住',
  forget: '忘记',
  believe: '相信',
  hope: '希望',
  wish: '希望；祝愿',
  want: '想要',
  need: '需要',
  like: '喜欢；像',
  love: '爱；热爱',
  hate: '讨厌',
  try: '尝试',
  help: '帮助',
  call: '打电话；叫',
  ask: '问；请求',
  tell: '告诉',
  say: '说',
  speak: '说话',
  talk: '谈话',
  read: '阅读',
  write: '写',
  learn: '学习',
  teach: '教',
  show: '展示；表明',
  meet: '遇见；会面',
  follow: '跟随',
  lead: '领导；引导',
  change: '改变',
  build: '建造',
  break: '打破',
  cut: '切；割',
  open: '打开',
  close: '关闭',
  save: '拯救；保存',
  kill: '杀死',
  die: '死',
  live: '生活；居住',
  stay: '停留；保持',
  wait: '等待',
  happen: '发生',
  seem: '似乎；好像',
  appear: '出现；似乎',
  become: '变成',
  grow: '生长；增长',
  rise: '上升',
  reach: '到达；够到',
  return: '返回；归还',
  send: '发送',
  receive: '收到',
  buy: '买',
  sell: '卖',
  pay: '支付',
  cost: '花费',
  spend: '花费；度过',
  stand: '站立',
  sit: '坐',
  lie: '躺；说谎',
  lay: '放置',
  wear: '穿；戴',
  eat: '吃',
  drink: '喝',
  sleep: '睡觉',
  wake: '醒来',
  laugh: '笑',
  smile: '微笑',
  cry: '哭；喊叫',
  shout: '喊叫',
  fight: '战斗；打架',
  win: '赢',
  great: '伟大的；很好的',
  big: '大的',
  large: '大的；大量的',
  small: '小的',
  long: '长的',
  short: '短的；矮的',
  tall: '高的',
  high: '高的',
  low: '低的',
  good: '好的',
  bad: '坏的',
  new: '新的',
  old: '老的；旧的',
  young: '年轻的',
  right: '正确的；右边的；权利',
  left: '左边的；剩下的',
  wrong: '错误的',
  true: '真实的',
  false: '假的',
  real: '真正的',
  beautiful: '美丽的',
  strong: '强壮的',
  weak: '虚弱的',
  happy: '快乐的',
  sad: '悲伤的',
  angry: '生气的',
  afraid: '害怕的',
  tired: '累的',
  cold: '冷的',
  hot: '热的',
  warm: '温暖的',
  dark: '黑暗的',
  light: '光；轻的；浅的',
  bright: '明亮的',
  hard: '硬的；困难的',
  soft: '软的',
  easy: '容易的',
  difficult: '困难的',
  important: '重要的',
  interesting: '有趣的',
  boring: '无聊的',
  possible: '可能的',
  impossible: '不可能的',
  necessary: '必要的',
  ready: '准备好的',
  free: '自由的；免费的',
  full: '满的；完整的',
  empty: '空的',
  open: '开着的',
  alive: '活着的',
  dead: '死的',
  sure: '确定的',
  certain: '确定的',
  clear: '清楚的',
  common: '普通的；共同的',
  special: '特别的',
  strange: '奇怪的',
  wonderful: '精彩的；奇妙的',
  terrible: '可怕的',
  whole: '整个的',
  half: '一半',
  enough: '足够的',
  far: '远的',
  near: '近的',
  early: '早的',
  late: '晚的；迟的',
  fast: '快速的',
  slow: '慢的',
  deep: '深的',
  wide: '宽的',
  narrow: '窄的',
  thick: '厚的',
  thin: '薄的；瘦的',
  rich: '富有的',
  poor: '贫穷的',
  clean: '干净的',
  dirty: '脏的',
  safe: '安全的',
  dangerous: '危险的',
}

// 合并词典
const allDict = new Map([...Object.entries(commonWords), ...builtInDict])

// 查词缓存
const lookupCache = new Map<string, string>()

export async function lookupWord(word: string): Promise<string> {
  const key = word.toLowerCase().replace(/[^a-z-]/g, '')
  if (!key) return ''

  // 1. 检查缓存
  if (lookupCache.has(key)) {
    return lookupCache.get(key)!
  }

  // 2. 检查本地词典（含中文释义）
  if (allDict.has(key)) {
    const meaning = allDict.get(key)!
    lookupCache.set(key, meaning)
    return meaning
  }

  // 3. 尝试 AI 翻译为中文（优先，因为词典 API 只返回英文释义）
  try {
    const settings = JSON.parse(localStorage.getItem('aplus1-settings') || '{}')
    if (settings.apiKey && settings.apiEndpoint) {
      const response = await fetch(settings.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: '你是一个英汉词典。将给定的英文单词翻译成中文。只回复中文翻译，不要解释。如果一个单词有多个含义，用中文分号；分隔。例如：bank → 银行；河岸。如果单词是变形（复数、过去式等），还原后翻译。',
            },
            { role: 'user', content: key },
          ],
          temperature: 0.1,
          max_tokens: 80,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const translation = data.choices?.[0]?.message?.content?.trim() || ''
        if (translation && !translation.match(/^[A-Za-z\s]+$/)) {
          // 确保返回的是中文（而非英文）
          lookupCache.set(key, translation)
          return translation
        }
        // 如果 AI 返回了纯英文，再试一次并强调要中文
        if (translation) {
          const retryResponse = await fetch(settings.apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${settings.apiKey}`,
            },
            body: JSON.stringify({
              model: settings.model || 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'Translate this English word to Chinese. Reply ONLY in Chinese characters. No English, no pinyin, no explanation.' },
                { role: 'user', content: key },
              ],
              temperature: 0.1,
              max_tokens: 30,
            }),
          })
          if (retryResponse.ok) {
            const retryData = await retryResponse.json()
            const retryTranslation = retryData.choices?.[0]?.message?.content?.trim() || ''
            if (retryTranslation) {
              lookupCache.set(key, retryTranslation)
              return retryTranslation
            }
          }
        }
      }
    }
  } catch {
    // AI 翻译失败，继续尝试在线词典
  }

  // 4. 最后回退：在线词典 API（英文释义，加中文标注说明）
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`
    )
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        const meanings = data[0].meanings
        if (meanings && meanings.length > 0) {
          const defs = meanings[0].definitions
          if (defs && defs.length > 0) {
            const result = defs.slice(0, 3).map((d: { definition: string }) => d.definition).join('；')
            const marked = `[英] ${result}`
            lookupCache.set(key, marked)
            return marked
          }
        }
      }
    }
  } catch {
    // 忽略
  }

  const fallback = '（暂无中文释义，可尝试导入词库）'
  lookupCache.set(key, fallback)
  return fallback
}

// ============ 音标 & 发音 ============

export interface WordPhonetics {
  word: string
  phonetic?: string        // 通用音标
  ukPhonetic?: string      // 英式音标
  usPhonetic?: string      // 美式音标
  ukAudio?: string         // 英式发音音频 URL
  usAudio?: string         // 美式发音音频 URL
}

// 音标缓存
const phoneticsCache = new Map<string, WordPhonetics>()

/**
 * 获取单词的音标和发音音频 URL
 * 数据来源：Free Dictionary API (https://dictionaryapi.dev)
 */
export async function fetchWordPhonetics(word: string): Promise<WordPhonetics | null> {
  const key = word.toLowerCase().replace(/[^a-z-]/g, '')
  if (!key) return null

  // 检查缓存
  if (phoneticsCache.has(key)) {
    return phoneticsCache.get(key)!
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`
    )
    if (!response.ok) {
      phoneticsCache.set(key, null as unknown as WordPhonetics)
      return null
    }

    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      phoneticsCache.set(key, null as unknown as WordPhonetics)
      return null
    }

    const entry = data[0]
    const phoneticsList = entry.phonetics || []

    // 分离英式和美式发音
    let ukAudio: string | undefined
    let usAudio: string | undefined
    let ukPhonetic: string | undefined
    let usPhonetic: string | undefined

    for (const p of phoneticsList) {
      const audio: string = p.audio || ''
      const text: string = p.text || ''

      if (!ukAudio && (audio.includes('-uk') || audio.includes('-gb') || audio.includes('_uk') || audio.includes('_gb'))) {
        ukAudio = audio
        if (text) ukPhonetic = text
      } else if (!usAudio && (audio.includes('-us') || audio.includes('_us'))) {
        usAudio = audio
        if (text) usPhonetic = text
      }
    }

    // 如果上面没匹配到，按顺序分配（通常第一个是英式，也可能第一个是美式）
    for (const p of phoneticsList) {
      const audio: string = p.audio || ''
      const text: string = p.text || ''
      if (!ukAudio && audio) {
        ukAudio = audio
        if (text && !ukPhonetic) ukPhonetic = text
      } else if (!usAudio && audio) {
        usAudio = audio
        if (text && !usPhonetic) usPhonetic = text
      }
      // 补充音标
      if (text && !ukPhonetic && !usPhonetic) {
        ukPhonetic = text
        usPhonetic = text
      }
    }

    // 从 entry.phonetic 取通用音标
    const generalPhonetic = entry.phonetic || ''

    const result: WordPhonetics = {
      word: key,
      phonetic: generalPhonetic || ukPhonetic || usPhonetic || '',
      ukPhonetic: ukPhonetic || generalPhonetic || '',
      usPhonetic: usPhonetic || generalPhonetic || '',
      ukAudio,
      usAudio,
    }

    phoneticsCache.set(key, result)
    return result
  } catch {
    phoneticsCache.set(key, null as unknown as WordPhonetics)
    return null
  }
}

/**
 * 用 Web Speech API 朗读单词（指定口音）
 */
export function speakWordViaTTS(word: string, accent: 'uk' | 'us' = 'us'): void {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(word)
  utterance.rate = 0.8
  utterance.pitch = 1
  utterance.volume = 1

  // 查找匹配口音的英语语音
  const voices = window.speechSynthesis.getVoices()
  const targetLang = accent === 'uk' ? 'en-GB' : 'en-US'

  // 精确匹配
  let voice = voices.find(v => v.lang.startsWith(targetLang) && v.name.includes('Google'))
  if (!voice) voice = voices.find(v => v.lang.startsWith(targetLang))
  if (!voice) voice = voices.find(v => v.lang.startsWith('en-'))

  if (voice) utterance.voice = voice

  window.speechSynthesis.speak(utterance)
}

// 批量预加载释义
export async function preloadWordMeanings(words: string[]): Promise<void> {
  const uncached = words.filter(w => !lookupCache.has(w.toLowerCase()))
  // 批量处理，每批 5 个
  for (let i = 0; i < uncached.length; i += 5) {
    const batch = uncached.slice(i, i + 5)
    await Promise.all(batch.map(w => lookupWord(w)))
  }
}
