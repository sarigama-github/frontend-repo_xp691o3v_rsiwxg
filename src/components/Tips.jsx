export default function Tips({ tips }) {
  if (!tips || !tips.length) return null
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-3">Health Tips</h3>
      <ul className="list-disc list-inside text-slate-200/90 space-y-1 text-sm">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  )
}
