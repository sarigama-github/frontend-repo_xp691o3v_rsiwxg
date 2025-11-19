import { useEffect, useMemo, useState } from 'react'

const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function HazardTab() {
  const [aqi, setAqi] = useState(null)
  const [category, setCategory] = useState('')
  const [recs, setRecs] = useState([])

  // Quick selector to fetch advice for hazardous/very unhealthy immediately
  const fetchAdvice = async (cat) => {
    try {
      const res = await fetch(`${backend}/api/recommendations?category=${encodeURIComponent(cat)}`)
      const data = await res.json()
      setRecs(data.recommendations || [])
      setCategory(data.category)
    } catch (e) {
      setRecs([])
    }
  }

  useEffect(() => {
    fetchAdvice('Hazardous')
  }, [])

  const catBadge = useMemo(() => {
    const c = (category || '').toLowerCase()
    const color = c.includes('hazard')
      ? 'bg-red-600/20 text-red-300 border-red-600/40'
      : c.includes('very')
      ? 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-600/40'
      : 'bg-yellow-600/20 text-yellow-300 border-yellow-600/40'
    return `inline-block px-2 py-1 text-xs rounded border ${color}`
  }, [category])

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">Immediate Measures</h3>
        <span className={catBadge}>{category || 'Hazardous'}</span>
      </div>
      <p className="text-slate-300 text-sm mb-3">Instant guidance for dangerous air quality levels.</p>
      <div className="space-y-2 text-slate-200/90 text-sm">
        {recs.map((r, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400" />
            <p>{r}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-slate-400">Tip: You can switch categories to see what to do as conditions improve:</div>
      <div className="mt-2 flex gap-2 flex-wrap">
        {['Hazardous','Very Unhealthy','Unhealthy','Unhealthy for Sensitive','Moderate','Good'].map((c) => (
          <button key={c} onClick={() => fetchAdvice(c)} className="px-3 py-1 rounded border border-slate-600 hover:border-slate-500 text-slate-200/90 text-xs">
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
