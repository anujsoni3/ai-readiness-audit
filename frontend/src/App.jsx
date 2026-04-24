import { useState } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, '')

  function isValidUrl(input) {
    try {
      const parsed = new URL(input)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  async function handleAnalyze(event) {
    event.preventDefault()
    const trimmedUrl = url.trim()

    if (!trimmedUrl) {
      setError('Please enter a website URL to analyze.')
      setResult(null)
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com).')
      setResult(null)
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      // Simulate audit processing time for a realistic UI flow.
      await new Promise((resolve) => setTimeout(resolve, 1400))

      // Call backend endpoint that returns score, issues, and breakdown.
      const response = await fetch(`${normalizedApiBaseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmedUrl }),
      })

      const rawBody = await response.text()
      let data = null

      try {
        data = rawBody ? JSON.parse(rawBody) : null
      } catch {
        data = null
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Backend request failed (${response.status}). Check VITE_API_BASE_URL and confirm backend has POST /analyze.`,
        )
      }

      if (!data) {
        throw new Error('Backend returned an invalid response. Please try again.')
      }

      setResult(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const scoreValue = result?.score ?? 0
  const scoreBandClasses =
    scoreValue < 40
      ? 'bg-rose-600'
      : scoreValue < 70
        ? 'bg-amber-500'
        : 'bg-emerald-600'

  const breakdown = result?.breakdown ?? []
  const detectedSignals = result?.detectedSignals ?? []

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
            AI Readiness Audit Tool
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Evaluate how understandable your site is for LLMs
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            This simulated audit uses deterministic URL heuristics to estimate how
            easily AI systems can retrieve and reuse your website content.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <form className="flex flex-col gap-4 sm:flex-row" onSubmit={handleAnalyze}>
            <label className="sr-only" htmlFor="url-input">
              Website URL
            </label>
            <input
              id="url-input"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-w-36 items-center justify-center rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-500"
            >
              Analyze
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          {isLoading && (
            <div className="mt-6 flex items-center gap-3 text-slate-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-700 border-t-transparent" />
              <p>Analyzing...</p>
            </div>
          )}
        </section>

        {result && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                AI Readiness Score
              </p>
              <p className="mt-4 text-6xl font-bold text-cyan-700">{scoreValue}</p>
              <p className="text-lg text-slate-500">/ 100</p>

              <div className="mt-6 h-3 w-full rounded-full bg-slate-200">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${scoreBandClasses}`}
                  style={{ width: `${scoreValue}%` }}
                />
              </div>

              <p className="mt-6 text-sm leading-relaxed text-slate-600">
                This score reflects how easily AI systems (like LLMs) can
                understand, retrieve, and reuse your content.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                This audit uses heuristic signals like URL patterns, content depth
                indicators, and structured sections to estimate AI readability.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Score Breakdown
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  {/* Scoring now starts from a neutral baseline. */}
                  <div className="flex items-start justify-between gap-4 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
                    <span>Base score</span>
                    <span className="font-semibold text-slate-900">50</span>
                  </div>
                  {breakdown.map((item) => (
                    <div
                      key={`${item.label}-${item.impact}`}
                      className="flex items-start justify-between gap-4 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200"
                    >
                      <span>{item.label}</span>
                      <span
                        className={`font-semibold ${item.impact >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                      >
                        {item.impact >= 0 ? `+${item.impact}` : item.impact}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-900 px-3 py-2 text-white">
                    <span>Final score</span>
                    <span className="font-semibold">{scoreValue}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Red: 0-40  |  Yellow: 40-70  |  Green: 70+
                </p>
              </div>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h2 className="text-xl font-bold">Detected Signals</h2>
              <ul className="mt-4 space-y-3">
                {detectedSignals.map((signal, index) => (
                  <li
                    key={`${signal.label}-${index}`}
                    className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${signal.found ? 'border border-emerald-200 bg-emerald-50 text-emerald-900' : 'border border-rose-200 bg-rose-50 text-rose-900'}`}
                  >
                    {signal.found ? 'Found:' : 'Not found:'} {signal.label}
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 text-xl font-bold">Actionable Issues</h2>
              <ul className="mt-4 space-y-3">
                {result.issues.map((issue, index) => (
                  <li
                    key={`${index}-${issue.slice(0, 24)}`}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}
      </div>
    </main>
  )
}

export default App
