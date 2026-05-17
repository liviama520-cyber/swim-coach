'use client'
import { useEffect, useState } from 'react'
import { getSessions, saveSession, deleteSession } from '@/lib/store'
import { formatTime, parseTime, avg } from '@/lib/format'
import { TrainingSession, TrainingSet, Stroke } from '@/lib/types'

const STROKE_LABELS: Record<Stroke, string> = {
  freestyle: '自由泳', backstroke: '仰泳', breaststroke: '蛙泳',
  butterfly: '蝶泳', IM: '个人混合泳',
}

function blankSet(): TrainingSet {
  return { reps: 8, distance: 100, stroke: 'freestyle', times: [] }
}

export default function TrainingPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [sets, setSets] = useState<TrainingSet[]>([blankSet()])
  const [timesInputs, setTimesInputs] = useState<string[]>([''])
  const [notes, setNotes] = useState('')

  useEffect(() => { getSessions().then(setSessions) }, [])

  function updateSet(i: number, patch: Partial<TrainingSet>) {
    const next = sets.map((s, idx) => idx === i ? { ...s, ...patch } : s)
    setSets(next)
    if (patch.reps !== undefined) {
      const newTimes = [...timesInputs]
      newTimes[i] = ''
      setTimesInputs(newTimes)
    }
  }

  async function submit() {
    const parsedSets = sets.map((set, i) => {
      const raw = timesInputs[i] ?? ''
      const times = raw.split(/[,\s]+/).filter(Boolean).map(parseTime)
      return { ...set, times }
    })
    const session: TrainingSession = {
      id: crypto.randomUUID(),
      date,
      sets: parsedSets,
      notes,
    }
    await saveSession(session)
    setSessions(await getSessions())
    setShowForm(false)
    setSets([blankSet()])
    setTimesInputs([''])
    setNotes('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">训练日志</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          {showForm ? '取消' : '+ 记录训练'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">今天的训练</h2>
          <label className="block">
            <span className="text-xs text-gray-400">日期</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
          </label>

          {sets.map((set, i) => (
            <div key={i} className="border border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">第 {i + 1} 组</span>
                {sets.length > 1 && (
                  <button onClick={() => setSets(sets.filter((_, idx) => idx !== i))}
                    className="text-xs text-gray-600 hover:text-red-400">删除</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-xs text-gray-400">组数</span>
                  <input type="number" value={set.reps} min={1}
                    onChange={e => updateSet(i, { reps: Number(e.target.value) })}
                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-400">距离(y/m)</span>
                  <input type="number" value={set.distance} min={25}
                    onChange={e => updateSet(i, { distance: Number(e.target.value) })}
                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-400">泳姿</span>
                  <select value={set.stroke}
                    onChange={e => updateSet(i, { stroke: e.target.value as Stroke })}
                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                    {Object.entries(STROKE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-gray-400">
                  每组时间（用逗号或空格分隔，如：1:04 1:06 1:06 1:05）
                </span>
                <input type="text"
                  placeholder={`${set.reps}个时间`}
                  value={timesInputs[i] ?? ''}
                  onChange={e => {
                    const next = [...timesInputs]
                    next[i] = e.target.value
                    setTimesInputs(next)
                  }}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono" />
              </label>
            </div>
          ))}

          <button onClick={() => { setSets([...sets, blankSet()]); setTimesInputs([...timesInputs, '']) }}
            className="text-sm text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-600 rounded-lg px-4 py-2 transition-colors">
            + 添加训练组
          </button>

          <label className="block">
            <span className="text-xs text-gray-400">备注</span>
            <input type="text" placeholder="可选" value={notes}
              onChange={e => setNotes(e.target.value)}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
          </label>

          <button onClick={submit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            保存
          </button>
        </div>
      )}

      <div className="space-y-3">
        {sessions.length === 0 && (
          <div className="text-center py-12 text-gray-600">还没有训练记录</div>
        )}
        {sessions.map(session => {
          const totalYards = session.sets.reduce((s, set) => s + set.reps * set.distance, 0)
          return (
            <div key={session.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">{session.date}</div>
                  <div className="text-xs text-gray-500">
                    {totalYards.toLocaleString()} yards · {session.sets.length} 组训练
                  </div>
                </div>
                <button onClick={async () => { await deleteSession(session.id); setSessions(await getSessions()) }}
                  className="text-gray-600 hover:text-red-400 text-xs transition-colors">删除</button>
              </div>
              <div className="space-y-2">
                {session.sets.map((set, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-gray-300">
                      {set.reps}×{set.distance} {STROKE_LABELS[set.stroke]}
                    </span>
                    {set.times.length > 0 && (
                      <span className="text-gray-500 ml-2 font-mono text-xs">
                        {set.times.map(formatTime).join(' / ')}
                        <span className="text-blue-400 ml-2">
                          均 {formatTime(avg(set.times))}
                        </span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {session.notes && (
                <div className="text-xs text-gray-500 mt-2">{session.notes}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
