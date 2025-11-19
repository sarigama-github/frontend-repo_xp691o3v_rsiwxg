import { useState } from 'react'

const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function GeoAQI() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })

  const fetchAQI = async () => {
    setLoading(true)
    setError('')
    try {
      const { lat, lon } = await getLocation()
      const res = await fetch(`${backend}/api/estimate/geo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon })
      })
      if (!res.ok) throw new Error('Failed to fetch AQI')
      const data = await res.json()
      setResult({ ...data, lat, lon })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-3">Nearby AQI (via Geolocation)</h3>
      <button onClick={fetchAQI} disabled={loading} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white">
        {loading ? 'Locating...' : 'Use My Location'}
      </button>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      {result && (
        <div className="mt-3 text-slate-200">
          <p className="text-2xl font-bold">AQI: {result.aqi ?? 'N/A'}</p>
          <p className="text-sm opacity-80">Category: {result.category}</p>
          {result.metrics?.pm25 !== undefined && (
            <p className="text-xs opacity-80 mt-1">PM2.5: {result.metrics.pm25.toFixed ? result.metrics.pm25.toFixed(1) : result.metrics.pm25} µg/m³</p>
          )}
          {result.note && <p className="mt-2 text-xs italic opacity-70">{result.note}</p>}
          <p className="text-xs opacity-60 mt-1">Lat {result.lat.toFixed(3)}, Lon {result.lon.toFixed(3)}</p>
        </div>
      )}
    </div>
  )
}
