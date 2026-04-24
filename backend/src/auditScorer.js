const BASE_SCORE = 50

const SCORING_RULES = [
  {
    id: 'long-form-content',
    title: 'Blog/docs/learn content signal',
    keywords: ['blog', 'docs', 'learn', 'guides', 'resources', 'academy'],
    positive: 15,
    negative: 5,
    signalLabel: 'Blog or documentation content',
    issue:
      'No long-form content signal detected in the URL (blog/docs/learn). Add a docs or insights section to improve semantic depth for LLM retrieval.',
  },
  {
    id: 'qna-support-content',
    title: 'FAQ/help/support signal',
    keywords: ['faq', 'help', 'support', 'knowledge-base', 'kb'],
    positive: 10,
    negative: 20,
    signalLabel: 'FAQ/help/support section',
    issue:
      'No FAQ/help/support signal detected. Publish structured Q&A pages so AI systems can map common user intents and direct answers.',
  },
  {
    id: 'url-depth',
    title: 'URL depth signal',
    check: (url) => {
      const pathSegments = url.pathname.split('/').filter(Boolean)
      return !(pathSegments.length < 2 && url.pathname.length <= 1)
    },
    positive: 5,
    negative: 5,
    signalLabel: 'Deeper URL structure',
    issue:
      'URL structure appears too shallow. Introduce clear content paths (for example /learn/, /docs/, /use-cases/) so knowledge can be segmented and retrieved reliably.',
  },
  {
    id: 'information-architecture',
    title: 'Structured sections signal',
    keywords: ['products', 'solutions', 'features', 'pricing', 'platform', 'use-cases'],
    positive: 10,
    negative: 5,
    signalLabel: 'Clearly defined product/solution sections',
    issue:
      'No clearly defined content sections (e.g., product or solution pages), making it harder for AI to segment information.',
  },
  {
    id: 'developer-readiness',
    title: 'Developer docs signal',
    keywords: ['api', 'developer', 'developers', 'sdk', 'reference', 'changelog'],
    positive: 10,
    negative: 10,
    signalLabel: 'Developer docs/API references',
    issue:
      'No developer-focused content signal detected. Add API/reference/changelog pages to improve machine-usable context and technical grounding.',
  },
]

const ADVISORY_ISSUES = [
  {
    id: 'tutorial-examples',
    keywords: ['tutorial', 'examples', 'case-study', 'playbook'],
    issue:
      'No tutorial or example-oriented section signal detected. Add practical examples/case studies to make your content easier for AI systems to reuse in answers.',
  },
  {
    id: 'glossary-definitions',
    keywords: ['glossary', 'terms', 'definitions'],
    issue:
      'No glossary/terms signal detected. A definitions page improves entity clarity and reduces ambiguity in AI-generated responses.',
  },
  {
    id: 'trust-governance',
    keywords: ['security', 'privacy', 'compliance', 'trust'],
    issue:
      'No trust/governance section signal detected. Add privacy/security/compliance docs so AI can surface policy-safe and enterprise-relevant answers.',
  },
  {
    id: 'release-health',
    keywords: ['release-notes', 'status', 'updates'],
    issue:
      'No release/status signal detected. Publish changelogs or status updates so AI systems can prioritize current and accurate information.',
  },
]

function containsAny(haystack, keywords) {
  return keywords.some((keyword) => haystack.includes(keyword))
}

function normalizeUrl(rawUrl) {
  let parsed

  try {
    // Accept fully-qualified URLs first.
    parsed = new URL(rawUrl)
  } catch {
    // Fallback so users can submit values like "example.com".
    parsed = new URL(`https://${rawUrl}`)
  }

  return parsed
}

function evaluateRule(url, searchableText, rule) {
  if (rule.check) {
    return rule.check(url)
  }

  return containsAny(searchableText, rule.keywords)
}

function buildIssues(searchableText, failedEvaluations) {
  const issues = failedEvaluations.map(({ rule }) => rule.issue)

  if (issues.length >= 4) {
    return issues.slice(0, 5)
  }

  for (const advisory of ADVISORY_ISSUES) {
    if (issues.length >= 4) {
      break
    }

    const hasSignal = containsAny(searchableText, advisory.keywords)
    if (!hasSignal) {
      issues.push(advisory.issue)
    }
  }

  return issues.slice(0, 5)
}

function buildBreakdown(evaluations) {
  return evaluations.map(({ rule, matched }) => ({
    label: rule.title,
    impact: matched ? rule.positive : -rule.negative,
  }))
}

function buildDetectedSignals(evaluations) {
  return evaluations.map(({ rule, matched }) => ({
    label: rule.signalLabel,
    found: matched,
  }))
}

function scoreUrl(urlInput) {
  const normalizedUrl = normalizeUrl(urlInput)
  const searchableText = `${normalizedUrl.hostname}${normalizedUrl.pathname}`.toLowerCase()

  const evaluations = SCORING_RULES.map((rule) => ({
    rule,
    matched: evaluateRule(normalizedUrl, searchableText, rule),
  }))
  const failedEvaluations = evaluations.filter(({ matched }) => !matched)

  // Start from a neutral baseline, then add or subtract deterministic impacts.
  const rawScore = evaluations.reduce((total, { rule, matched }) => {
    return total + (matched ? rule.positive : -rule.negative)
  }, BASE_SCORE)
  const score = Math.max(0, Math.min(100, rawScore))

  // Always return actionable issues and a transparent breakdown.
  const issues = buildIssues(searchableText, failedEvaluations)
  const breakdown = buildBreakdown(evaluations)
  const detectedSignals = buildDetectedSignals(evaluations)

  return {
    score,
    issues,
    breakdown,
    detectedSignals,
  }
}

module.exports = {
  scoreUrl,
}
