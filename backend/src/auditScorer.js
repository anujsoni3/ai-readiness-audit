const PENALTY_RULES = [
  {
    id: 'long-form-content',
    penalty: 15,
    keywords: ['blog', 'docs', 'learn', 'guides', 'resources', 'academy'],
    issue:
      'No long-form content signal detected in the URL (blog/docs/learn). Add a docs or insights section to improve semantic depth for LLM retrieval.',
  },
  {
    id: 'qna-support-content',
    penalty: 20,
    keywords: ['faq', 'help', 'support', 'knowledge-base', 'kb'],
    issue:
      'No FAQ/help/support signal detected. Publish structured Q&A pages so AI systems can map common user intents and direct answers.',
  },
  {
    id: 'url-depth',
    penalty: 10,
    check: (url) => {
      const pathSegments = url.pathname.split('/').filter(Boolean)
      return !(pathSegments.length < 2 && url.pathname.length <= 1)
    },
    issue:
      'URL structure appears too shallow. Introduce clear content paths (for example /learn/, /docs/, /use-cases/) so knowledge can be segmented and retrieved reliably.',
  },
  {
    id: 'information-architecture',
    penalty: 15,
    keywords: ['products', 'solutions', 'features', 'pricing', 'platform', 'use-cases'],
    issue:
      'No structured section signal detected (products/solutions/features). Add explicit content hubs to improve chunking and topic routing for AI systems.',
  },
  {
    id: 'developer-readiness',
    penalty: 10,
    keywords: ['api', 'developer', 'developers', 'sdk', 'reference', 'changelog'],
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
    parsed = new URL(rawUrl)
  } catch {
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

function buildIssues(url, searchableText, failedRules) {
  const issues = failedRules.map((rule) => rule.issue)

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

function scoreUrl(urlInput) {
  const normalizedUrl = normalizeUrl(urlInput)
  const searchableText = `${normalizedUrl.hostname}${normalizedUrl.pathname}`.toLowerCase()

  const failedRules = PENALTY_RULES.filter(
    (rule) => !evaluateRule(normalizedUrl, searchableText, rule),
  )

  const penalty = failedRules.reduce((sum, rule) => sum + rule.penalty, 0)
  const rawScore = 100 - penalty
  const score = Math.max(0, Math.min(100, rawScore))
  const issues = buildIssues(normalizedUrl, searchableText, failedRules)

  return {
    score,
    issues,
  }
}

module.exports = {
  scoreUrl,
}
