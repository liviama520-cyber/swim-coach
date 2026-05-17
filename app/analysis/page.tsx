'use client'
import { useEffect, useState } from 'react'
import { getRaces, getSessions } from '@/lib/store'
import { formatTime, avg } from '@/lib/format'

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [races, setRaces] = useState(getRaces())
  const [sessions, setSessions] = useState(getSessions())

  useEffect(() => {
    setRaces(getRaces())
    setSessions(getSessions())
  }, [])

  async function analyze() {
    if (races.length === 0 && sessions.length === 0) return
    setLoading(true)
    setResult('')

    const summary = {
      athlete: '韩艺，9年级，主项自由泳，Varsity + Beach Cities游泳俱乐部',
      races: races.map(r => ({
        event: r.event,
        date: r.date,
        time: formatTime(r.time),
        splits: r.splits.map(formatTime),
        poolType: r.poolType,
      })),
      recentTraining: sessions.slice(0, 5).map(s => ({
        date: s.date,
        sets: s.sets.map(set => ({
          desc: `${set.reps}×${set.distance} ${set.stroke}`,
          avgTime: set.times.length > 0 ? formatTime(avg(set.times)) : null,
        })),
      })),
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      })
      const data = await res.json()
      setResult(data.analysis || data.error || '分析失败')
    } catch {
      setResult('连接失败，请检查 API 配置')
    }
    setLoading(false)
  }

  const hasData = races.length > 0 || sessions.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">AI 教练分析</h1>
        <p className="text-gray-400 text-sm mt-1">基于训练和比赛数据，生成个性化建议</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-500 mb-1">已录入比赛</div>
          <div className="text-2xl font-bold">{races.length} 场</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-500 mb-1">已录入训练</div>
          <div className="text-2xl font-bold">{sessions.length} 次</div>
        </div>
      </div>

      {!hasData && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center text-gray-500 text-sm">
          先录入一些比赛成绩或训练数据，AI 才能做有意义的分析
        </div>
      )}

      {hasData && (
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
        >
          {loading ? '分析中...' : '🤖 生成教练分析报告'}
        </button>
      )}

      {result && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <div className="text-sm font-semibold text-blue-400 mb-3">教练分析报告</div>
          <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{result}</div>
        </div>
      )}
    </div>
  )
}
