const express = require('express')
const cors = require('cors')
const { scoreUrl } = require('./auditScorer')

const app = express()
const PORT = process.env.PORT || 5000

// Allow frontend calls and JSON request bodies.
app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  // Keep root path healthy for uptime tools that check '/'.
  res.json({ status: 'ok', service: 'ai-readiness-audit-api' })
})

app.post('/analyze', (req, res) => {
  const { url } = req.body || {}

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'A valid URL string is required in the request body.',
    })
  }

  try {
    // Delegate all scoring logic to a single pure function.
    const result = scoreUrl(url.trim())
    return res.json(result)
  } catch {
    return res.status(400).json({
      error: 'Unable to parse URL. Please provide a valid website URL.',
    })
  }
})

app.get('/health', (_req, res) => {
  // Simple uptime check for deployment platforms.
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`AI Readiness Audit API running on http://localhost:${PORT}`)
})
