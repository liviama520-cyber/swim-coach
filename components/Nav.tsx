'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '总览' },
  { href: '/training', label: '训练' },
  { href: '/races', label: '比赛' },
  { href: '/recruits', label: '招募库' },
  { href: '/analysis', label: 'AI分析' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="text-blue-400 font-bold mr-4">🏊 韩艺</span>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
