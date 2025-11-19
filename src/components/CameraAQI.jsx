import { useEffect, useRef, useState } from 'react'

const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function CameraAQI() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach((t) => t.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setStreaming(true)
    } catch (e) {
      setError('Camera access denied or unavailable')
    }
  }

  const captureAndEstimate = async () => {
    if (!videoRef.current) return
    setLoading(true)
    setError('')
    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))

      const form = new FormData()
      form.append('file', blob, 'frame.jpg')

      const res = await fetch(`${backend}/api/estimate/camera`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Failed to estimate')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Camera AQI Estimator</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-black rounded-lg overflow-hidden aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted></video>
        </div>
        <div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2 mb-3">
            {!streaming ? (
              <button onClick={startCamera} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white">Enable Camera</button>
            ) : (
              <button onClick={captureAndEstimate} disabled={loading} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white">{loading ? 'Analyzing...' : 'Estimate from Frame'}</button>
            )}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {result && (
            <div className="mt-3 text-slate-200">
              <p className="text-2xl font-bold">AQI: {result.aqi ?? 'N/A'}</p>
              <p className="text-sm opacity-80">Category: {result.category}</p>
              {result.metrics && (
                <div className="mt-2 text-xs opacity-80">
                  <p>Mean Saturation: {result.metrics.mean_saturation}</p>
                  <p>Contrast: {result.metrics.contrast}</p>
                  <p>Haze Index: {result.metrics.haze_index}</p>
                </div>
              )}
              {result.note && <p className="mt-2 text-xs italic opacity-70">{result.note}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
