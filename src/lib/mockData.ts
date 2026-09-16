import type {
  ArchStep,
  Citation,
  MacroScenario,
  Metric,
  ProCon,
  ResearchResult,
} from './types';

export const MACRO_SCENARIOS: MacroScenario[] = [
  {
    id: 'recession',
    label: 'Deep Recession',
    short: 'Recession',
    description: 'GDP -2.5%, unemployment 7.5%, credit spreads wide',
    tone: 'negative',
    multiplier: 0.72,
  },
  {
    id: 'bear',
    label: 'Mild Bear',
    short: 'Mild Bear',
    description: 'GDP +0.4%, soft demand, multiple compression',
    tone: 'caution',
    multiplier: 0.86,
  },
  {
    id: 'baseline',
    label: 'Baseline 2026',
    short: 'Baseline',
    description: 'GDP +2.1%, CPI cooling, stable rates',
    tone: 'neutral',
    multiplier: 1.0,
  },
  {
    id: 'bull',
    label: 'Bull Market',
    short: 'Bull',
    description: 'GDP +3.4%, risk-on, multiple expansion',
    tone: 'positive',
    multiplier: 1.12,
  },
];

export const ARCH_STEPS: Omit<ArchStep, 'status'>[] = [
  {
    id: 'aggregator',
    index: 1,
    title: 'Data Aggregator Engine',
    subtitle: 'Node: data_ingest',
    description: 'Pulls filings, pricing, and news via Tavily + EDGAR',
    detail: 'Aggregating 10-K, 10-Q, transcripts, and real-time market data',
  },
  {
    id: 'multiagent',
    index: 2,
    title: 'Multi-Agent Analysis Framework',
    subtitle: 'Node: analyst_swarm',
    description: 'Parallel specialist agents score fundamentals, moat, sentiment',
    detail: 'Fundamental, Moat, Sentiment, and Macro agents running in parallel',
  },
  {
    id: 'critic',
    index: 3,
    title: 'Critic & Hallucination Guardrail',
    subtitle: 'Node: self_reflection',
    description: 'Self-reflection loop cross-checks claims against sources',
    detail: 'Critic agent verifying every claim against primary sources',
  },
  {
    id: 'verdict',
    index: 4,
    title: 'Final Verdict Finalization',
    subtitle: 'Node: verdict_compile',
    description: 'Aggregates scores into INVEST / PASS with confidence',
    detail: 'Compiling weighted scores into final verdict and confidence',
  },
];

const TICKER_MAP: Record<string, string> = {
  apple: 'AAPL',
  tesla: 'TSLA',
  nvidia: 'NVDA',
  microsoft: 'MSFT',
  amazon: 'AMZN',
  google: 'GOOGL',
  alphabet: 'GOOGL',
  meta: 'META',
  netflix: 'NFLX',
  jpmorgan: 'JPM',
  berkshire: 'BRK.B',
  costco: 'COST',
  amd: 'AMD',
  shopify: 'SHOP',
  palantir: 'PLTR',
};

function resolveTicker(company: string): string {
  const key = company.trim().toLowerCase();
  return TICKER_MAP[key] ?? key.slice(0, 4).toUpperCase();
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const POSITIVE_METRICS: Metric[] = [
  {
    label: 'Revenue',
    value: '+18.4% YoY',
    delta: 'Accelerating',
    tone: 'positive',
    description: 'Revenue growth has accelerated for 3 consecutive quarters, beating consensus.',
  },
  {
    label: 'Debt Profile',
    value: '0.42 D/E',
    delta: 'Below sector',
    tone: 'positive',
    description: 'Leverage conservative; ample dry powder for buybacks or R&D.',
  },
  {
    label: 'Moat Score',
    value: '8.6 / 10',
    delta: 'Wide moat',
    tone: 'positive',
    description: 'Switching costs and network effects reinforce durable pricing power.',
  },
  {
    label: 'Risk Factor',
    value: 'Low-Moderate',
    delta: 'Stable',
    tone: 'positive',
    description: 'Diversified revenue base; no material regulatory overhang identified.',
  },
];

const MIXED_METRICS: Metric[] = [
  {
    label: 'Revenue',
    value: '+6.2% YoY',
    delta: 'Decelerating',
    tone: 'neutral',
    description: 'Top-line growth cooling as the category matures; guidance trimmed.',
  },
  {
    label: 'Debt Profile',
    value: '1.18 D/E',
    delta: 'Above sector',
    tone: 'negative',
    description: 'Leverage elevated post-acquisition; interest coverage tightening.',
  },
  {
    label: 'Moat Score',
    value: '6.1 / 10',
    delta: 'Narrowing',
    tone: 'neutral',
    description: 'Competitive pressure eroding pricing power in core segment.',
  },
  {
    label: 'Risk Factor',
    value: 'Moderate',
    delta: 'Elevating',
    tone: 'neutral',
    description: 'Competitive pressure rising; FX exposure a secondary concern.',
  },
];

const NEGATIVE_METRICS: Metric[] = [
  {
    label: 'Revenue',
    value: '-9.1% YoY',
    delta: 'Contracting',
    tone: 'negative',
    description: 'Revenue declining for 2 consecutive quarters; guidance withdrawn.',
  },
  {
    label: 'Debt Profile',
    value: '2.34 D/E',
    delta: 'Well above sector',
    tone: 'negative',
    description: 'Highly levered balance sheet; covenant headroom narrowing.',
  },
  {
    label: 'Moat Score',
    value: '3.4 / 10',
    delta: 'Eroding',
    tone: 'negative',
    description: 'Core advantage commoditizing; new entrants gaining share.',
  },
  {
    label: 'Risk Factor',
    value: 'High',
    delta: 'Deteriorating',
    tone: 'negative',
    description: 'SEC inquiry disclosed; cash runway under 12 months at current burn.',
  },
];

const PROS_INVEST: ProCon[] = [
  { text: 'Expanding gross margins (62.1% → 64.8%) over the last 4 quarters', weight: 'high' },
  { text: 'Net cash position of $48B provides strategic optionality', weight: 'high' },
  { text: 'Buyback program renewed at $90B, signaling management confidence', weight: 'medium' },
  { text: 'Services revenue growing 22% YoY with 78% gross margin', weight: 'high' },
  { text: 'Dominant installed-base moat drives recurring upgrade cycle', weight: 'medium' },
];

const CONS_INVEST: ProCon[] = [
  { text: 'Geographic concentration risk in China (~18% of revenue)', weight: 'medium' },
  { text: 'Valuation premium leaves little room for execution missteps', weight: 'low' },
  { text: 'Regulatory scrutiny on App Store economics ongoing', weight: 'low' },
];

const PROS_PASS: ProCon[] = [
  { text: 'Recognized brand with loyal core customer base', weight: 'low' },
  { text: 'IP portfolio could unlock licensing upside', weight: 'low' },
];

const CONS_PASS: ProCon[] = [
  { text: 'Revenue contracting 9% YoY with no clear inflection point', weight: 'high' },
  { text: 'Debt-to-equity at 2.34x — covenant headroom narrowing', weight: 'high' },
  { text: 'Cash runway under 12 months at current burn rate', weight: 'high' },
  { text: 'Active SEC inquiry disclosed in latest 10-Q', weight: 'medium' },
  { text: 'C-suite turnover: 3 CFOs in the last 18 months', weight: 'medium' },
  { text: 'Short interest up 40% month-over-month', weight: 'low' },
];

const CITATIONS: Citation[] = [
  {
    title: 'Form 10-K Annual Report',
    source: 'SEC EDGAR',
    url: 'https://www.sec.gov/cgi-bin/browse-edgar',
    timestamp: '2026-02-28 09:14 UTC',
    snippet: 'Audited consolidated financial statements for the most recent fiscal year.',
  },
  {
    title: 'Q3 Earnings Call Transcript',
    source: 'Investor Relations',
    url: 'https://investor.example.com/events',
    timestamp: '2026-05-04 20:05 UTC',
    snippet: 'Management commentary on guidance, capital allocation, and product roadmap.',
  },
  {
    title: 'Equity Research Initiation',
    source: 'Morgan Stanley',
    url: 'https://www.morganstanley.com/research',
    timestamp: '2026-06-12 13:30 UTC',
    snippet: 'Analyst initiation with Overweight rating and 12-month price target.',
  },
  {
    title: 'Real-time Market Data',
    source: 'Tavily API',
    url: 'https://tavily.com',
    timestamp: '2026-07-08 14:02 UTC',
    snippet: 'Live pricing, volume, and intraday sentiment pulled via Tavily search.',
  },
  {
    title: 'Industry Outlook 2026',
    source: 'McKinsey & Company',
    url: 'https://www.mckinsey.com/industries',
    timestamp: '2026-04-19 11:00 UTC',
    snippet: 'Sector-level trends, TAM sizing, and competitive landscape analysis.',
  },
];

function buildRevenueSeries(seed: number, positive: boolean) {
  const base = positive ? 80 : 100;
  const drift = positive ? 1.06 : 0.94;
  const noise = (n: number) => ((Math.sin(seed + n) * 1000) % 7) / 100;
  const quarters = ["Q1 '24", "Q2 '24", "Q3 '24", "Q4 '24", "Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25"];
  return quarters.map((q, i) => {
    const revenue = +(base * Math.pow(drift, i) + noise(i)).toFixed(2);
    const profit = +(revenue * (positive ? 0.28 - i * 0.005 : 0.18 - i * 0.012)).toFixed(2);
    return { quarter: q, revenue, profit };
  });
}

const REGULATORY_NOTES = [
  'Antitrust review pending in EU and UK jurisdictions — outcome expected H2 2026.',
  'New data-privacy rules (CPRA successor) may raise compliance costs by ~4% of opex.',
  'Sector-specific licensing requirements tightening in two key markets.',
];

const INSIDER_NOTES = [
  'CEO sold 18% of vested holdings over the trailing 90 days (10b5-1 plan).',
  'CFO and General Counsel exercised options and disposed in the open market.',
  'Three independent directors purchased shares on the open market last quarter — net insider sentiment mixed.',
];

export function generateResult(
  company: string,
  scenario: MacroScenario,
  regulatory: boolean,
  insider: boolean
): ResearchResult {
  const seed = hashString(company.toLowerCase());
  const baseBias = (seed % 10) + (scenario.multiplier - 0.86) * 14;
  const isInvest = baseBias >= 5;
  const focusPenalty = (regulatory ? 3 : 0) + (insider ? 2 : 0);
  const confidence = Math.min(
    96,
    Math.max(
      38,
      Math.round(
        (isInvest ? 72 + (seed % 23) : 58 + (seed % 30)) *
          (0.85 + scenario.multiplier * 0.12)
      ) - focusPenalty
    )
  );

  const metrics = isInvest
    ? POSITIVE_METRICS
    : seed % 3 === 0
      ? MIXED_METRICS
      : NEGATIVE_METRICS;

  const ticker = resolveTicker(company);

  const executiveSummary = isInvest
    ? [
        `Under the ${scenario.label} macro regime, ${company} presents a compelling risk-adjusted opportunity. The business is firing on multiple cylinders — revenue acceleration, margin expansion, and a fortress balance sheet — while management continues to execute against a credible multi-year roadmap.`,
        'Our agent scored the opportunity favorably across Market, Team, Product, and Financial axes. The installed-base moat and services attach dynamics create a durable compounding engine that we believe is underpriced by the market.',
        'Key watch-items include geographic concentration and a full valuation that demands continued execution. On balance, the asymmetry favors accumulation on pullbacks.',
      ]
    : [
        `Under the ${scenario.label} macro regime, ${company} currently fails our risk-adjusted hurdle. Multiple structural headwinds — revenue contraction, elevated leverage, and a deteriorating sentiment backdrop — outweigh the optionality from brand equity and IP portfolio.`,
        'The agent flagged deteriorating fundamentals across two of four scoring axes. Cash runway and covenant headroom are the binding constraints; without a credible refinancing or strategic action, the equity is priced for a turnaround that the data does not yet support.',
        'We recommend monitoring for a de-risking catalyst (capital raise, asset sale, or guidance reset) before revisiting. Until then, capital is better deployed elsewhere.',
      ];

  return {
    company: company.trim(),
    ticker,
    verdict: isInvest ? 'INVEST' : 'PASS',
    confidence,
    scenarioId: scenario.id,
    executiveSummary,
    metrics,
    pros: isInvest ? PROS_INVEST : PROS_PASS,
    cons: isInvest ? CONS_INVEST : CONS_PASS,
    citations: CITATIONS,
    revenueSeries: buildRevenueSeries(seed, isInvest),
    regulatoryNotes: REGULATORY_NOTES,
    insiderNotes: INSIDER_NOTES,
  };
}

const CHAT_INTRO =
  "I've completed the deep research pass. Ask me anything about the verdict, metrics, macro assumptions, or cited evidence.";

export function getChatIntro(): string {
  return CHAT_INTRO;
}

export function answerQuestion(
  question: string,
  result: ResearchResult | null,
  scenario: MacroScenario
): string {
  if (!result) {
    return "I haven't generated a report yet. Run a deep research pass on a company first, then I can answer questions about it.";
  }
  const q = question.toLowerCase();
  const invest = result.verdict === 'INVEST';

  if (/regulat/.test(q)) {
    return result.regulatoryNotes.length
      ? `On regulatory risk: ${result.regulatoryNotes.join(' ')} This was a material input to the Risk Factor score.`
      : 'No material regulatory items were flagged for this name.';
  }
  if (/insider/.test(q)) {
    return result.insiderNotes.length
      ? `Insider activity: ${result.insiderNotes.join(' ')}`
      : 'No notable insider transactions detected in the trailing 90 days.';
  }
  if (/macro|recession|bear|bull|baseline|economy|scenario|stress/.test(q)) {
    return `Under the ${scenario.label} regime (${scenario.description}), I applied a ${scenario.multiplier.toFixed(2)}x adjustment to forward estimates. A more adverse scenario would compress the confidence score and could flip a borderline INVEST to PASS.`;
  }
  if (/confidence|score|sure/.test(q)) {
    return `The confidence score of ${result.confidence}% blends four weighted axes — Market (30%), Team (15%), Product/Moat (25%), and Financials (30%) — then applies the macro multiplier from your selected scenario. The critic agent verified each axis against primary sources.`;
  }
  if (/why|reason|justif/.test(q)) {
    return invest
      ? `I landed on INVEST because three of four axes scored above threshold: accelerating revenue, conservative leverage, and a wide moat. The macro regime (${scenario.label}) supports the call. The main risk to the thesis is geographic concentration.`
      : `I landed on PASS because two axes failed threshold: deteriorating fundamentals and elevated leverage. The ${scenario.label} regime further pressures the runway. I'd revisit if a de-risking catalyst (capital raise or guidance reset) emerges.`;
  }
  if (/moat/.test(q)) {
    return result.metrics.find((m) => m.label === 'Moat Score')?.description ??
      'Moat analysis combines switching costs, network effects, intangible assets, and cost advantages.';
  }
  if (/debt|leverage|balance sheet/.test(q)) {
    return result.metrics.find((m) => m.label === 'Debt Profile')?.description ??
      'Debt profile assesses leverage, coverage, and refinancing risk.';
  }
  if (/revenue|growth|top.?line/.test(q)) {
    return result.metrics.find((m) => m.label === 'Revenue')?.description ??
      'Revenue trend tracks YoY growth and acceleration/deceleration across recent quarters.';
  }
  if (/risk/.test(q)) {
    return result.metrics.find((m) => m.label === 'Risk Factor')?.description ??
      'Risk factor aggregates regulatory, competitive, macro, and balance-sheet risk.';
  }
  if (/source|cit|evidence|where/.test(q)) {
    return `I cited ${result.citations.length} primary sources including the latest 10-K, the Q3 earnings transcript, a Morgan Stanley initiation note, real-time Tavily market data, and a McKinsey industry outlook. See the "Cited Data Sources" tab for links and timestamps.`;
  }
  if (/pro|con|bull|bear/.test(q)) {
    return `Bull case has ${result.pros.length} factors and the bear case has ${result.cons.length}. The highest-weight bear item is: "${result.cons[0]?.text ?? 'n/a'}".`;
  }
  return `Based on the ${scenario.label} scenario, my verdict is ${result.verdict} at ${result.confidence}% confidence. You can ask me about regulatory risk, insider activity, the macro assumption, confidence scoring, any specific metric, or the cited sources.`;
}