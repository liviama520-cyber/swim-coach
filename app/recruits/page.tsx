'use client'
import { useEffect, useMemo, useState } from 'react'

type Recruit = {
  div: string        // D1 / D2 / D3 / NAIA ...
  conf: string       // conference
  college: string
  g: string          // M / W
  rk: string         // SwimSwam ranking tag (B-01.. / G-.. / hm / botr)
  name: string
  st: string         // home state
  hs: string         // high school or club
  club: string       // USAS club
  lsc: string
  tr: number         // transfer (1/0)
}

const GENDER_LABEL: Record<string, string> = { M: '男子', W: '女子' }

type SortKey = 'name' | 'college' | 'conf' | 'st' | 'g'

export default function RecruitsPage() {
  const [all, setAll] = useState<Recruit[]>([])
  const [loading, setLoading] = useState(true)

  // filters
  const [div, setDiv] = useState('D3')
  const [conf, setConf] = useState('')
  const [college, setCollege] = useState('')
  const [gender, setGender] = useState('')
  const [state, setState] = useState('')
  const [q, setQ] = useState('')
  const [rankedOnly, setRankedOnly] = useState(false)
  const [transfersOnly, setTransfersOnly] = useState(false)

  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'college', dir: 1 })

  useEffect(() => {
    fetch('/recruits-2026.json')
      .then(r => r.json())
      .then((d: Recruit[]) => setAll(d))
      .finally(() => setLoading(false))
  }, [])

  // division is the top-level scope for every other filter
  const inDiv = useMemo(() => all.filter(r => r.div === div), [all, div])

  const divisions = useMemo(
    () => Array.from(new Set(all.map(r => r.div))).sort((a, b) => {
      const order = ['D1', 'D2', 'D3', 'NAIA', 'NJCAA', 'CCCAA', 'U Sports']
      return order.indexOf(a) - order.indexOf(b)
    }),
    [all],
  )
  const conferences = useMemo(
    () => Array.from(new Set(inDiv.map(r => r.conf).filter(Boolean))).sort(),
    [inDiv],
  )
  const colleges = useMemo(
    () => Array.from(new Set(
      inDiv.filter(r => !conf || r.conf === conf).map(r => r.college),
    )).sort(),
    [inDiv, conf],
  )
  const states = useMemo(
    () => Array.from(new Set(inDiv.map(r => r.st).filter(Boolean))).sort(),
    [inDiv],
  )

  // reset dependent filters when division changes
  function changeDiv(v: string) {
    setDiv(v); setConf(''); setCollege(''); setState('')
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = inDiv.filter(r =>
      (!conf || r.conf === conf) &&
      (!college || r.college === college) &&
      (!gender || r.g === gender) &&
      (!state || r.st === state) &&
      (!rankedOnly || !!r.rk) &&
      (!transfersOnly || r.tr === 1) &&
      (!needle ||
        r.name.toLowerCase().includes(needle) ||
        r.college.toLowerCase().includes(needle) ||
        r.hs.toLowerCase().includes(needle) ||
        r.club.toLowerCase().includes(needle)),
    )
    const { key, dir } = sort
    return [...list].sort((a, b) => {
      const av = (a[key] || '').toString()
      const bv = (b[key] || '').toString()
      return av.localeCompare(bv) * dir
    })
  }, [inDiv, conf, college, gender, state, q, rankedOnly, transfersOnly, sort])

  const stats = useMemo(() => ({
    total: filtered.length,
    schools: new Set(filtered.map(r => r.college)).size,
    confs: new Set(filtered.map(r => r.conf).filter(Boolean)).size,
    men: filtered.filter(r => r.g === 'M').length,
    women: filtered.filter(r => r.g === 'W').length,
  }), [filtered])

  const activeFilters = !!(conf || college || gender || state || q || rankedOnly || transfersOnly)

  function resetFilters() {
    setConf(''); setCollege(''); setGender(''); setState('')
    setQ(''); setRankedOnly(false); setTransfersOnly(false)
  }

  function toggleSort(key: SortKey) {
    setSort(s => s.key === key ? { key, dir: (s.dir === 1 ? -1 : 1) } : { key, dir: 1 })
  }

  const selectCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">2026 大学招募库</h1>
        <p className="text-gray-400 text-sm mt-1">
          SwimSwam High School Class of 2026 承诺数据库 · 按学校 / 性别 / 联盟 / 州筛选
        </p>
      </div>

      {/* division tabs */}
      <div className="flex flex-wrap gap-1">
        {divisions.map(d => (
          <button
            key={d}
            onClick={() => changeDiv(d)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              div === d ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {d === 'D1' ? 'NCAA D1' : d === 'D2' ? 'NCAA D2' : d === 'D3' ? 'NCAA D3' : d}
          </button>
        ))}
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="承诺人数" value={stats.total} accent />
        <Stat label="学校数" value={stats.schools} />
        <Stat label="联盟数" value={stats.confs} />
        <Stat label="男 / 女" value={`${stats.men} / ${stats.women}`} />
      </div>

      {/* filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-gray-400">联盟 (Conference)</span>
            <select value={conf} onChange={e => { setConf(e.target.value); setCollege('') }}
              className={`mt-1 w-full ${selectCls}`}>
              <option value="">全部联盟</option>
              {conferences.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-gray-400">学校 (College)</span>
            <select value={college} onChange={e => setCollege(e.target.value)}
              className={`mt-1 w-full ${selectCls}`}>
              <option value="">全部学校</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-gray-400">性别 (Gender)</span>
            <select value={gender} onChange={e => setGender(e.target.value)}
              className={`mt-1 w-full ${selectCls}`}>
              <option value="">男 + 女</option>
              <option value="M">男子</option>
              <option value="W">女子</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-gray-400">生源州 (Home State)</span>
            <select value={state} onChange={e => setState(e.target.value)}
              className={`mt-1 w-full ${selectCls}`}>
              <option value="">全部州</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-400">搜索（姓名 / 学校 / 高中）</span>
            <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="输入关键字…"
              className={`mt-1 w-full ${selectCls}`} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" checked={rankedOnly} onChange={e => setRankedOnly(e.target.checked)} />
            仅 SwimSwam 排名选手
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" checked={transfersOnly} onChange={e => setTransfersOnly(e.target.checked)} />
            仅转学生 (Transfer)
          </label>
          {activeFilters && (
            <button onClick={resetFilters} className="text-blue-400 hover:text-blue-300 ml-auto">
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* results */}
      {loading ? (
        <div className="text-center py-12 text-gray-600">加载中…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-600">没有符合条件的记录</div>
      ) : (
        <div className="border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400">
                <tr>
                  <Th onClick={() => toggleSort('name')} sort={sort} k="name">姓名</Th>
                  <Th onClick={() => toggleSort('g')} sort={sort} k="g">性别</Th>
                  <Th onClick={() => toggleSort('college')} sort={sort} k="college">学校</Th>
                  <Th onClick={() => toggleSort('conf')} sort={sort} k="conf">联盟</Th>
                  <Th onClick={() => toggleSort('st')} sort={sort} k="st">生源州</Th>
                  <th className="text-left px-3 py-2 font-medium">高中 / 俱乐部</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-t border-gray-800 hover:bg-gray-900/60">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.name}
                      {r.rk && <RankBadge rk={r.rk} />}
                      {r.tr === 1 && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300">转学</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{GENDER_LABEL[r.g] || r.g}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.college}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-400">{r.conf}</td>
                    <td className="px-3 py-2">{r.st}</td>
                    <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                      {r.hs || r.club || <span className="text-gray-700">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600">
        数据来源：SwimSwam 2026 Recruiting Database（Anne Lepesant 维护）。仅供参考，可能存在录入误差。
      </p>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
      <div className={`text-2xl font-bold ${accent ? 'text-blue-400' : ''}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function Th({ children, onClick, sort, k }: {
  children: React.ReactNode; onClick: () => void; sort: { key: SortKey; dir: 1 | -1 }; k: SortKey
}) {
  const active = sort.key === k
  return (
    <th onClick={onClick}
      className="text-left px-3 py-2 font-medium cursor-pointer select-none hover:text-white whitespace-nowrap">
      {children}
      <span className="ml-1 text-[10px]">{active ? (sort.dir === 1 ? '▲' : '▼') : ''}</span>
    </th>
  )
}

function RankBadge({ rk }: { rk: string }) {
  // B-01..B-20 / G-01..G-20 => top recruit; hm => honorable mention; botr => best of the rest
  const m = rk.match(/-(\d+)/)
  let label = rk
  if (m) label = `Top ${parseInt(m[1], 10)}`
  else if (rk.includes('hm')) label = 'HM'
  else if (rk.includes('botr')) label = 'BOTR'
  return (
    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">{label}</span>
  )
}
