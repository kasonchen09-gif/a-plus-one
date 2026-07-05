import type { CEFRLevel, StoryGenre, StoryGenerateResponse } from '../types'

// 模型 → 默认 API 端点映射
export const MODEL_ENDPOINTS: Record<string, string> = {
  'gpt-4o-mini': 'https://api.openai.com/v1/chat/completions',
  'gpt-4o': 'https://api.openai.com/v1/chat/completions',
  'gpt-3.5-turbo': 'https://api.openai.com/v1/chat/completions',
  'deepseek-chat': 'https://api.deepseek.com/v1/chat/completions',
  'deepseek-reasoner': 'https://api.deepseek.com/v1/chat/completions',
}

// 根据模型获取默认端点
export function getDefaultEndpoint(model: string): string {
  return MODEL_ENDPOINTS[model] || 'https://api.openai.com/v1/chat/completions'
}

// CE FR 等级对应的 i+1 描述
const LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: 'Beginner (A1): Use very simple vocabulary, short sentences (5-10 words), present tense only, basic concrete nouns and verbs. Avoid idioms, phrasal verbs, and complex grammar. Target: 80% of words should be within the most common 500 English words.',
  A2: 'Elementary (A2): Use simple vocabulary and sentence structures (8-15 words). Use mostly present and simple past tense. Include a few simple phrasal verbs. Target: 80% of words within the most common 1000 English words. Occasionally introduce 1-2 slightly challenging words per paragraph.',
  B1: 'Intermediate (B1): Use everyday vocabulary with some less common words. Mix of sentence lengths (10-25 words). Use various tenses naturally. Include some phrasal verbs and idioms that are common in everyday speech. Target: introduce 3-5 challenging words or expressions per segment.',
  B2: 'Upper Intermediate (B2): Use rich vocabulary including some abstract terms. Complex sentence structures with subordinate clauses. Natural use of all tenses, conditionals, passive voice. Include idioms and colloquial expressions. Target: introduce 5-8 advanced words per segment.',
  C1: 'Advanced (C1): Use sophisticated vocabulary and nuanced expressions. Long complex sentences with multiple clauses. Subtle use of tone, register, and rhetorical devices. Include academic vocabulary, rare idioms, and cultural references.',
  C2: 'Proficient (C2): Near-native level. Use of highly sophisticated vocabulary, subtle connotations, complex rhetorical structures, and cultural allusions. No simplification needed — write as for an educated native speaker.',
}

// 题材描述
const GENRE_DESCRIPTIONS: Record<StoryGenre, string> = {
  'medieval-fantasy': 'Medieval fantasy world with magic, knights, dragons, ancient castles, and epic quests. Think Lord of the Rings or Game of Thrones atmosphere.',
  'cyberpunk': 'High-tech dystopian future with megacorporations, hackers, AI, cybernetic implants, neon-lit cityscapes. Think Blade Runner or Cyberpunk 2077.',
  'romance': 'Modern romantic comedy or drama with relatable characters, emotional moments, dating, relationships, and heartwarming interactions.',
  'post-apocalyptic': 'World after a major catastrophe — zombies, nuclear fallout, or environmental collapse. Survival, scavenging, rebuilding society.',
  'mystery-detective': 'Crime investigation, detective work, clues, suspects, plot twists. Think Sherlock Holmes or modern crime thrillers.',
  'space-adventure': 'Space exploration, alien civilizations, starships, interstellar travel, cosmic mysteries. Think Star Trek or The Expanse.',
  'urban-fantasy': 'Magic hidden in modern cities, supernatural beings living among humans, secret societies, witches, vampires, or mythical creatures in contemporary settings.',
  'historical-fiction': 'Stories set in a specific historical period with authentic details, real historical events as backdrop, period-appropriate settings.',
  'survival-adventure': 'Survival in wilderness or hostile environment — deserted island, deep jungle, mountain expedition. Resource management, danger, discovery.',
  'comedy-daily': 'Light-hearted slice-of-life comedy, humorous everyday situations, witty dialogue, relatable modern life scenarios.',
}

export function buildSystemPrompt(
  level: CEFRLevel,
  genre: StoryGenre,
  targetWords: string[]
): string {
  const levelDesc = LEVEL_DESCRIPTIONS[level]
  const genreDesc = GENRE_DESCRIPTIONS[genre]
  const wordsInstruction = targetWords.length > 0
    ? `\n\nIMPORTANT - Target vocabulary to naturally weave into the story: ${targetWords.join(', ')}. Use these words naturally in context — never list them or explain them. They should appear organically as part of the narrative. Try to include at least 3-5 of these words in each segment. Mark each target word with ** around it, like **word**. Do NOT mark non-target words with **.`
    : ''

  return `You are an interactive English story generator designed for Chinese learners of English. Your goal is to create an immersive, engaging story that helps the reader acquire English naturally through comprehensible input (Krashen's i+1 theory).

## Language Level
${levelDesc}

## Genre & Setting
${genreDesc}

## Story Structure
1. Generate ONE story segment of 180-350 words (shorter for A1-A2, longer for B2+)
2. End the segment at a decision point with 2-4 choices for the reader
3. Each choice should be written in English with a brief Chinese hint in parentheses
4. The choices should meaningfully branch the story in different directions

## Writing Guidelines
- Write natural, engaging English — never "textbook English"
- Show, don't tell; use dialogue and action
- Create suspense, emotion, or curiosity to keep the reader engaged
- The reader should care about what happens next
- NEVER include vocabulary lists, word explanations, or "teaching" content — the learning happens through immersion${wordsInstruction}

## Output Format
You MUST respond in valid JSON format only, no other text:
{
  "content": "The story segment text with **targetWords** marked...",
  "choices": [
    { "id": "1", "text": "English choice text", "summary": "中文提示" }
  ],
  "targetWordsUsed": ["word1", "word2"],
  "title": "Story title (only on first segment)"
}`
}

export function buildUserPrompt(
  storyHistory: { content: string; choice: string }[],
  previousChoice?: string
): string {
  if (storyHistory.length === 0) {
    return 'Start a brand new interactive English story. Generate the opening segment that sets up the world, introduces the protagonist, and presents the first choices.'
  }

  const lastFew = storyHistory.slice(-3).map((s, i) =>
    `[Segment ${storyHistory.length - 3 + i + 1}]: ${s.content}\n[Reader chose]: ${s.choice}`
  ).join('\n\n')

  let prompt = `Continue the story based on the reader's choice. Here are the recent story segments for context:\n\n${lastFew}`

  if (previousChoice) {
    prompt += `\n\nThe reader just chose: "${previousChoice}". Continue the story following this choice.`
  }

  prompt += '\n\nGenerate the next segment now. Remember to end with new choices. Output in the specified JSON format only.'

  return prompt
}

export async function generateStorySegment(
  apiEndpoint: string,
  apiKey: string,
  model: string,
  level: CEFRLevel,
  genre: StoryGenre,
  targetWords: string[],
  storyHistory: { content: string; choice: string }[],
  previousChoice?: string
): Promise<StoryGenerateResponse> {
  const systemPrompt = buildSystemPrompt(level, genre, targetWords)
  const userPrompt = buildUserPrompt(storyHistory, previousChoice)

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let hint = ''
    if (response.status === 404) {
      hint = `\n\n💡 提示：404 通常是 API 端点地址不对。\n   当前端点：${apiEndpoint}\n   当前模型：${model}\n   请检查：模型和端点是否匹配？（如 deepseek-chat 需要 api.deepseek.com 的端点）`
    } else if (response.status === 401 || response.status === 403) {
      hint = `\n\n💡 提示：认证失败，请检查 API Key 是否正确。`
    } else if (response.status === 429) {
      hint = `\n\n💡 提示：请求过于频繁或余额不足，请稍后再试。`
    }
    throw new Error(`AI API error (${response.status}): ${errorText}${hint}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  // 尝试解析 JSON 响应
  try {
    // 处理可能的 markdown 代码块包裹
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr)
    return {
      content: parsed.content || '',
      choices: parsed.choices || [],
      targetWordsUsed: parsed.targetWordsUsed || [],
      title: parsed.title,
    }
  } catch {
    // 如果 AI 没有返回合法的 JSON，尝试从文本中提取
    console.warn('Failed to parse AI response as JSON, using raw content')
    return {
      content: content,
      choices: [
        { id: '1', text: 'Continue forward', summary: '继续前进' },
        { id: '2', text: 'Look around carefully', summary: '仔细观察周围' },
        { id: '3', text: 'Talk to someone nearby', summary: '和附近的人交谈' },
      ],
      targetWordsUsed: [],
    }
  }
}
