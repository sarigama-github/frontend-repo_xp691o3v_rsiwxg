import { useEffect, useState } from 'react'
import CameraAQI from './components/CameraAQI'
import GeoAQI from './components/GeoAQI'
import Tips from './components/Tips'
import HazardTab from './components/HazardTab'

const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [tips, setTips] = useState([])

  useEffect(() => {
    fetch(`${backend}/api/tips`).then(r => r.json()).then(d => setTips(d.tips || [])).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]"></div>

      <header className="relative">
        <nav className="max-w-6xl mx-auto flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <img src="/flame-icon.svg" alt="logo" className="w-8 h-8" />
            <span className="text-white font-semibold">AQI Vision</span>
          </div>
          <div className="text-slate-300 text-sm opacity-80">Real-time insights from your camera and location</div>
        </nav>
      </header>

      <main className="relative max-w-6xl mx-auto p-6 space-y-8">
        <section className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Check Air Quality Instantly</h1>
          <p className="text-slate-300 mt-3">Estimate AQI from a camera frame and fetch official readings near you.</p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <CameraAQI />
          <GeoAQI />
        </div>

        <section className="grid md:grid-cols-2 gap-6">
          <HazardTab />
          <Tips tips={tips} />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 text-slate-200">
            <h3 className="text-white font-semibold text-lg mb-3">About</h3>
            <p className="text-sm opacity-90">This app provides a heuristic estimate from the camera alongside nearby official readings. Camera-based AQI is an approximation based on image characteristics like contrast and saturation and should not be used for medical decisions.</p>
            <a href="/test" className="inline-block mt-4 text-xs text-blue-300 hover:text-blue-200 underline">System status</a>
          </div>

          <HistoryPanel />
        </section>
      </main>

      <footer className="relative border-t border-slate-800 mt-10">
        <div className="max-w-6xl mx-auto p-6 text-center text-slate-400 text-xs">
          Built with love • Educational purposes only
        </div>
      </footer>
    </div>
  )
}

function HistoryPanel(){
  const [items, setItems] = useState([])
  useEffect(() => {
    fetch(`${backend}/api/history`).then(r=>r.json()).then(d=> setItems(d.items||[])).catch(()=>{})
  }, [])
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 text-slate-200">
      <h3 className="text-white font-semibold text-lg mb-3">Recent Checks</h3>
      <div className="space-y-2 text-sm">
        {items.length === 0 && <p className="text-slate-400">No history yet</p>}
        {items.map((it)=> (
          <div key={it._id} className="flex items-center justify-between border border-slate-700/60 rounded px-3 py-2">
            <div>
              <p className="font-medium">{it.source} • {it.category || 'Unknown'}</p>
              {it.metrics?.pm25 !== undefined && (
                <p className="text-xs opacity-70">PM2.5: {it.metrics.pm25}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{it.aqi ?? '—'}</p>
              <p className="text-xs opacity-60">{new Date(it.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
