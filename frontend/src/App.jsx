import { useState } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleAnalyze(event) {
    event.preventDefault()

    if (!url.trim()) {
      setError('Please enter a website URL to analyze.')
      setResult(null)
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      // Simulate processing latency to reflect an audit pipeline.
      await new Promise((resolve) => setTimeout(resolve, 1400))

      const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Audit failed. Please try another URL.')
      }

      setResult(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const scoreValue = result?.score ?? 0

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
                  className="h-3 rounded-full bg-cyan-700 transition-all duration-500"
                  style={{ width: `${scoreValue}%` }}
                />
              </div>

              <p className="mt-6 text-sm leading-relaxed text-slate-600">
                This score reflects how easily AI systems (like LLMs) can
                understand, retrieve, and reuse your content.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h2 className="text-xl font-bold">Actionable Issues</h2>
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
