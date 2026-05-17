import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

function getApiKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const content = fs.readFileSync(envPath, 'utf-8')
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m)
    return match ? match[1].trim() : ''
  } catch {
    return ''
  }
}

export async function POST(request: Request) {
  const client = new Anthropic({ apiKey: getApiKey() })
  try {
    const data = await request.json()

    const prompt = `你是一位专业游泳教练，正在分析一名高中游泳运动员的数据。

运动员信息：${data.athlete}

比赛成绩：
${JSON.stringify(data.races, null, 2)}

最近训练记录：
${JSON.stringify(data.recentTraining, null, 2)}

请根据以上数据，用中文提供：
1. 当前成绩分析（强项和弱项）
2. 分段数据解读（如有）
3. 最关键的2-3个改进方向
4. 具体的训练建议

语言简洁直接，像教练对运动员说话，不要过于客套。`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const analysis = message.content[0].type === 'text' ? message.content[0].text : ''
    return Response.json({ analysis })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: msg }, { status: 500 })
  }
}
