const express = require('express')
const cors = require('cors')
const { scoreUrl } = require('./auditScorer')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.post('/analyze', (req, res) => {
  const { url } = req.body || {}

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'A valid URL string is required in the request body.',
    })
  }

  try {
    const result = scoreUrl(url.trim())
    return res.json(result)
  } catch {
    return res.status(400).json({
      error: 'Unable to parse URL. Please provide a valid website URL.',
    })
  }
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`AI Readiness Audit API running on http://localhost:${PORT}`)
})
