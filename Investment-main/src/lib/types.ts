export type Verdict = 'INVEST' | 'PASS';

export type MacroScenario = {
  id: 'recession' | 'bear' | 'baseline' | 'bull';
  label: string;
  short: string;
  description: string;
  tone: 'negative' | 'caution' | 'neutral' | 'positive';
  multiplier: number;
};

export type FocusFilters = {
  regulatory: boolean;
  insider: boolean;
};

export type ResearchSettings = {
  quickScan: boolean;
  deepDive: boolean;
  sentiment: boolean;
  risk: boolean;
};

export type LogLine = {
  id: number;
  text: string;
  level: 'info' | 'success' | 'warn' | 'system';
  timestamp: string;
};

export type ArchStepStatus = 'pending' | 'active' | 'done' | 'failed';

export type ResearchPhase =
  | 'idle'
  | 'initializing'
  | 'building-agent'
  | 'loading-graph'
  | 'connecting-llm'
  | 'collecting-evidence'
  | 'analyzing'
  | 'generating-report'
  | 'complete';

export type TimelineEntry = {
  id: number;
  label: string;
  detail: string;
  timestamp: string;
  state: 'live' | 'done' | 'pending';
};

export type ArchStep = {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  status: ArchStepStatus;
  detail: string;
};

export type MetricTone = 'positive' | 'negative' | 'neutral';

export type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: MetricTone;
  description: string;
};

export type ProCon = {
  text: string;
  weight: 'high' | 'medium' | 'low';
};

export type Citation = {
  title: string;
  source: string;
  url: string;
  timestamp: string;
  snippet: string;
};

export type ChatRole = 'user' | 'agent';

export type ChatMessage = {
  id: number;
  role: ChatRole;
  text: string;
  timestamp: string;
};

export type ResearchResult = {
  company: string;
  ticker: string;
  verdict: Verdict;
  confidence: number;
  scenarioId: MacroScenario['id'];
  executiveSummary: string[];
  metrics: Metric[];
  pros: ProCon[];
  cons: ProCon[];
  citations: Citation[];
  revenueSeries: { quarter: string; revenue: number; profit: number }[];
  regulatoryNotes: string[];
  insiderNotes: string[];
  suggestedQuestions?: string[];
};
