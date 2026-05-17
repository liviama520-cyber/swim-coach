'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRaces, getSessions } from '@/lib/store'
import { formatTime } from '@/lib/format'
import { RaceResult, TrainingSession } from '@/lib/types'

export default function Dashboard() {
  const [races, setRaces] = useState<RaceResult[]>([])
  const [sessions, setSessions] = useState<TrainingSession[]>([])

  useEffect(() => {
    getRaces().then(setRaces)
    getSessions().then(setSessions)
  }, [])

  const pb100y = races
    .filter(r => r.distance === 100 && r.stroke === 'freestyle' && r.poolType === 'SCY')
    .sort((a, b) => a.time - b.time)[0]

  const pb50m = races
    .filter(r => r.distance === 50 && r.stroke === 'freestyle' && r.poolType === 'LCM')
    .sort((a, b) => a.time - b.time)[0]

  const pb200m = races
    .filter(r => r.distance === 200 && r.stroke === 'freestyle' && r.poolType === 'LCM')
    .sort((a, b) => a.time - b.time)[0]

  const totalYards = sessions.reduce((sum, s) =>
    sum + s.sets.reduce((ss, set) => ss + set.reps * set.distance, 0), 0)

  const recentRaces = races.slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">韩艺 · 赛博游泳教练</h1>
        <p className="text-gray-400 text-sm mt-1">9年级 · Varsity · Beach Cities</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '100y 自由泳 SCY', value: pb100y ? formatTime(pb100y.time) : '—', target: '50.00' },
          { label: '50m 自由泳 LCM', value: pb50m ? formatTime(pb50m.time) : '—', target: null },
          { label: '200m 自由泳 LCM', value: pb200m ? formatTime(pb200m.time) : '—', target: null },
        ].map(card => (
          <div key={card.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">{card.label}</div>
            <div className="text-3xl font-mono font-bold text-blue-400">{card.value}</div>
            {card.target && (
              <div className="text-xs text-gray-500 mt-1">目标 {card.target}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="text-xs text-gray-500 mb-1">累计训练量</div>
          <div className="text-2xl font-bold">
            {totalYards.toLocaleString()} <span className="text-base text-gray-400">yards</span>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="text-xs text-gray-500 mb-1">训练次数</div>
          <div className="text-2xl font-bold">
            {sessions.length} <span className="text-base text-gray-400">次</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <span className="font-semibold text-sm">最近比赛</span>
          <Link href="/races" className="text-xs text-blue-400 hover:underline">全部</Link>
        </div>
        {recentRaces.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-600 text-sm">
            还没有比赛记录 ·{' '}
            <Link href="/races" className="text-blue-400 hover:underline">去添加</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentRaces.map(race => (
              <div key={race.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{race.event}</div>
                  <div className="text-xs text-gray-500">{race.date} · {race.meet} · {race.poolType}</div>
                </div>
                <div className="text-xl font-mono font-bold text-blue-400">{formatTime(race.time)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {races.length === 0 && sessions.length === 0 && (
        <div className="bg-blue-950 border border-blue-800 rounded-xl p-4 text-sm text-blue-300">
          欢迎！先去{' '}
          <Link href="/races" className="underline">比赛</Link> 页面录入成绩，
          或去{' '}
          <Link href="/training" className="underline">训练</Link> 页面记录今天的训练。
        </div>
      )}
    </div>
  )
}
