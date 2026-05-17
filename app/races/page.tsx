'use client'
import { useEffect, useState } from 'react'
import { getRaces, saveRace, deleteRace } from '@/lib/store'
import { formatTime, parseTime } from '@/lib/format'
import { RaceResult, Stroke, PoolType } from '@/lib/types'

const STROKE_LABELS: Record<Stroke, string> = {
  freestyle: '自由泳', backstroke: '仰泳', breaststroke: '蛙泳',
  butterfly: '蝶泳', IM: '个人混合泳',
}

function blank(): Omit<RaceResult, 'id'> {
  return {
    date: new Date().toISOString().slice(0, 10),
    meet: '',
    event: '',
    distance: 100,
    stroke: 'freestyle',
    poolType: 'SCY',
    time: 0,
    splits: [],
    notes: '',
  }
}

export default function RacesPage() {
  const [races, setRaces] = useState<RaceResult[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [timeInput, setTimeInput] = useState('')
  const [splitInputs, setSplitInputs] = useState<string[]>(['', ''])

  useEffect(() => { setRaces(getRaces()) }, [])

  function numSplits() {
    if (form.distance <= 50) return 0
    if (form.distance === 100) return 2
    if (form.distance === 200) return 4
    return 2
  }

  function submit() {
    if (!form.meet || !timeInput) return
    const time = parseTime(timeInput)
    const splits = splitInputs.slice(0, numSplits()).map(s => s ? parseTime(s) : 0).filter(Boolean)
    const event = `${form.distance}${form.poolType === 'SCY' ? 'y' : 'm'} ${STROKE_LABELS[form.stroke]}`
    const race: RaceResult = {
      ...form,
      id: crypto.randomUUID(),
      event,
      time,
      splits,
    }
    saveRace(race)
    setRaces(getRaces())
    setShowForm(false)
    setForm(blank())
    setTimeInput('')
    setSplitInputs(['', ''])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">比赛成绩</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? '取消' : '+ 添加比赛'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">录入比赛成绩</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-gray-400">日期</span>
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">赛事名称</span>
              <input type="text" placeholder="e.g. CIF Prelims" value={form.meet}
                onChange={e => setForm({ ...form, meet: e.target.value })}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">距离</span>
              <select value={form.distance}
                onChange={e => setForm({ ...form, distance: Number(e.target.value) })}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                {[50, 100, 200, 400, 500, 1000, 1500, 1650].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">泳姿</span>
              <select value={form.stroke}
                onChange={e => setForm({ ...form, stroke: e.target.value as Stroke })}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                {Object.entries(STROKE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">泳池类型</span>
              <select value={form.poolType}
                onChange={e => setForm({ ...form, poolType: e.target.value as PoolType })}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                <option value="SCY">短池码（SCY）</option>
                <option value="LCM">长池米（LCM）</option>
                <option value="SCM">短池米（SCM）</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">总成绩</span>
              <input type="text" placeholder="如 53.66 或 1:04.30" value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono" />
            </label>
          </div>

          {numSplits() > 0 && (
            <div>
              <span className="text-xs text-gray-400">分段成绩（可选）</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {Array.from({ length: numSplits() }).map((_, i) => (
                  <input key={i} type="text"
                    placeholder={`第${i + 1}段`}
                    value={splitInputs[i] ?? ''}
                    onChange={e => {
                      const next = [...splitInputs]
                      next[i] = e.target.value
                      setSplitInputs(next)
                    }}
                    className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono" />
                ))}
              </div>
            </div>
          )}

          <label className="block">
            <span className="text-xs text-gray-400">备注</span>
            <input type="text" placeholder="可选" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
          </label>

          <button onClick={submit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            保存
          </button>
        </div>
      )}

      <div className="space-y-3">
        {races.length === 0 && (
          <div className="text-center py-12 text-gray-600">还没有比赛记录</div>
        )}
        {races.map(race => (
          <div key={race.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{race.event}</div>
                <div className="text-xs text-gray-500 mt-0.5">{race.date} · {race.meet} · {race.poolType}</div>
                {race.splits.length > 0 && (
                  <div className="text-xs text-gray-400 mt-2 font-mono">
                    分段：{race.splits.map(formatTime).join(' / ')}
                    {race.splits.length === 2 && (
                      <span className="text-yellow-500 ml-2">
                        掉速 {formatTime(race.splits[1] - race.splits[0])}
                      </span>
                    )}
                  </div>
                )}
                {race.notes && <div className="text-xs text-gray-500 mt-1">{race.notes}</div>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-mono font-bold text-blue-400">{formatTime(race.time)}</div>
                <button onClick={() => { deleteRace(race.id); setRaces(getRaces()) }}
                  className="text-gray-600 hover:text-red-400 text-xs transition-colors">删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
