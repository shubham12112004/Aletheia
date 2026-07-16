import { useCallback, useEffect, useRef, useState } from 'react';
import { postResearch, postChatQuery } from '@/lib/api'; // âœ… Real chat query API integration replaces mockData
import type {
  ArchStep,
  ArchStepStatus,
  ChatMessage,
  MacroScenario,
  ResearchResult,
  ResearchPhase,
  TimelineEntry,
} from '@/lib/types';

type Status = 'idle' | 'running' | 'complete';

const GRAPH_STEPS: Omit<ArchStep, 'status'>[] = [
  { id: 'search', index: 1, title: 'Searching Company', subtitle: 'Step 1', description: 'Finding company basic identification parameters', detail: 'Searching universe...' },
  { id: 'profile', index: 2, title: 'Loading Company Profile', subtitle: 'Step 2', description: 'Fetching structural company profile details', detail: 'Loading...' },
  { id: 'news', index: 3, title: 'Collecting News', subtitle: 'Step 3', description: 'Fetching latest news indexing records', detail: 'Loading news items...' },
  { id: 'tavily', index: 4, title: 'Web Research', subtitle: 'Step 4', description: 'Searching external web sources via Tavily', detail: 'Searching...' },
  { id: 'groq', index: 5, title: 'Generating AI Report', subtitle: 'Step 5', description: 'Groq LLM engine preparing comprehensive investment brief', detail: 'Thinking...' },
];

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function freshSteps(): ArchStep[] {
  return GRAPH_STEPS.map((s) => ({ ...s, status: 'pending' as ArchStepStatus }));
}

// âœ… Professional Financial Formatter for Trillions and Billions
const formatMarketCap = (v: number) => {
  if (v >= 1000) {
    return `$${(v / 1000).toFixed(2)} T`;
  }
  return `$${v.toFixed(2)} B`;
};

export function useResearchAgent() {
  const [status, setStatus] = useState<Status>('idle');
  const [phase, setPhase] = useState<ResearchPhase>('idle');
  const [steps, setSteps] = useState<ArchStep[]>(freshSteps);
  const [result, setResult] = useState<ResearchResult | null>(null); 
  const [rawMarkdown, setRawMarkdown] = useState<string>(''); 
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [thinking, setThinking] = useState<string[]>([]);
  const [logs, setLogs] = useState<{ id: number; timestamp: string; message: string }[]>([]);
  const [streamedSections, setStreamedSections] = useState<{ section: string; content: string }[]>([]);

  // Finnhub API parallel request data states
  const [profile, setProfile] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);

  const msgIdRef = useRef(0);
  const timelineIdRef = useRef(0);
  const logsIdRef = useRef(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateStepsAndPhase = useCallback((currentProgress: number) => {
    const totalSteps = GRAPH_STEPS.length;
    const activeIndex = Math.floor((currentProgress / 100) * totalSteps);

    setSteps((prev) =>
      prev.map((step, idx) => {
        if (idx < activeIndex) return { ...step, status: 'done' };
        if (idx === activeIndex && currentProgress < 100) return { ...step, status: 'active' };
        return { ...step, status: 'pending' };
      })
    );

    if (currentProgress <= 20) setPhase('initializing');
    else if (currentProgress <= 40) setPhase('building-agent');
    else if (currentProgress <= 60) setPhase('collecting-evidence');
    else if (currentProgress <= 80) setPhase('analyzing');
    else if (currentProgress < 100) setPhase('generating-report');
    else setPhase('complete');
  }, []);

  const run = useCallback(
    async (company: string, scenario: MacroScenario, regulatory: boolean, insider: boolean) => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setSteps(freshSteps());
      setResult(null);
      setRawMarkdown('');
      setProfile(null);
      setQuote(null);
      setFinancials(null);
      setNews([]);
      setProgress(10);
      setMessages([]);
      setTimeline([
        { id: timelineIdRef.current++, label: 'Research Request Sent', detail: `Initiating API pipeline processing for ${company}`, timestamp: nowStamp(), state: 'live' }
      ]);
      setThinking(['Initializing context modules...']);
      setLogs([
        { id: logsIdRef.current++, timestamp: nowStamp(), message: `HTTP POST request dispatched targeting entity: ${company}` }
      ]);
      setStreamedSections([]);
      msgIdRef.current = 0;
      setStatus('running');
      setPhase('initializing');
      updateStepsAndPhase(10);

      const milestones = [30, 60, 90];
      let milestoneIndex = 0;

      progressIntervalRef.current = setInterval(() => {
        if (milestoneIndex < milestones.length) {
          const nextProgress = milestones[milestoneIndex];
          setProgress(nextProgress);
          updateStepsAndPhase(nextProgress);

          setTimeline((prev) => [
            ...prev,
            { id: timelineIdRef.current++, label: 'Processing Data Matrices', detail: `Simulating milestone check step ${milestoneIndex + 1}`, timestamp: nowStamp(), state: 'live' }
          ]);
          setThinking((prev) => [...prev, `Retrieving company metrics... (${nextProgress}%)`]);
          setLogs((prev) => [
            ...prev,
            { id: logsIdRef.current++, timestamp: nowStamp(), message: `Pipeline status calculated state at ${nextProgress}%` }
          ]);

          milestoneIndex++;
        }
      }, 1200);

      try {
        const response = await postResearch({
          company,
          scenario: scenario.id,
          focus: { regulatory, insider },
        });
        
        // âœ… Handle failed states immediately before allocating downstream parameters
        if (response.success === false) {
          throw new Error(response.message || 'The research server rejected this operation.');
        }

        // âœ… Resilient markdown content string extraction strategy
        const markdownContent = typeof response.report === 'string'
          ? response.report
          : response.report?.report || JSON.stringify(response.report || 'No report found.');

        setRawMarkdown(markdownContent);
        setProfile(response.profile);
        setQuote(response.quote);
        setFinancials(response.financials);
        setNews(response.news || []);

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        setProgress(100);
        setSteps((prev) => prev.map((step) => ({ ...step, status: 'done' })));
        setPhase('complete');
        setStatus('complete');

        const formatQuoteVal = (val: any, prefix = '', suffix = '') => {
          return val !== undefined && val !== null ? `${prefix}${Number(val).toFixed(2)}${suffix}` : 'N/A';
        };

        // âœ… All fields are mapped directly from the flat response root object
        const cleanResult: ResearchResult = {
          company: response.company || response.profile?.name || company || 'Unknown Company',
          ticker: response.ticker || response.profile?.ticker || 'N/A',
          verdict: response.verdict || 'INVEST',
          confidence: typeof response.confidence === 'number' ? response.confidence : 0,
          scenarioId: scenario.id,
          executiveSummary: Array.isArray(response.executiveSummary) 
            ? response.executiveSummary 
            : [markdownContent], 
          metrics: [
            {
              label: "Current Price",
              value: response.quote?.c ? `$${Number(response.quote.c).toLocaleString()}` : "N/A",
              // âœ… Swapped dynamic change parameter to use percentage updates (dp)
              delta: response.quote?.dp ? `${response.quote.dp >= 0 ? '+' : ''}${response.quote.dp.toFixed(2)}%` : "",
              tone: response.quote?.dp ? (response.quote.dp >= 0 ? 'positive' : 'negative') : 'neutral',
              description: "Current market price index",
            },
            {
              label: "Market Cap",
              value: response.profile?.marketCapitalization ? formatMarketCap(Number(response.profile.marketCapitalization)) : "N/A",
              delta: "",
              tone: "neutral",
              description: "Market Capitalization size",
            },
            {
              label: "52 Week High",
              value: formatQuoteVal(response.financials?.metric?.['52WeekHigh'] ?? response.quote?.h, '$'),
              delta: "",
              tone: "neutral",
              description: "Yearly maximum price range index",
            },
            {
              label: "52 Week Low",
              value: formatQuoteVal(response.financials?.metric?.['52WeekLow'] ?? response.quote?.l, '$'),
              delta: "",
              tone: "neutral",
              description: "Yearly minimum price range index",
            },
            {
              label: "P/E Ratio",
              value: String(response.financials?.metric?.peBasicExclExtraTTM ?? response.financials?.metric?.peTTM ?? "N/A"),
              delta: "",
              tone: "neutral",
              description: "Price to Earnings multi-factor",
            },
            {
              label: "EPS",
              value: String(response.financials?.metric?.epsBasicExclExtraItemsTTM ?? response.financials?.metric?.epsTTM ?? "N/A"),
              delta: "",
              tone: "neutral",
              description: "Earnings Per Share tracking index",
            },
            {
              label: "Beta",
              value: String(response.financials?.metric?.beta ?? "N/A"),
              delta: "",
              tone: "neutral",
              description: "Systemic market volatility index",
            },
            {
              label: "Dividend Yield",
              value: response.financials?.metric?.dividendYieldIndicatedAnnual 
                ? `${Number(response.financials.metric.dividendYieldIndicatedAnnual).toFixed(2)}%` 
                : "N/A",
              delta: "",
              tone: "neutral",
              description: "Indicated annual dividend distribution yield metrics",
            },
          ],
          pros: Array.isArray(response.pros) ? response.pros.map((item: any) =>
            typeof item === 'string' ? { text: item, weight: 'medium' as const } : item
          ) : [],
          cons: Array.isArray(response.cons) ? response.cons.map((item: any) =>
            typeof item === 'string' ? { text: item, weight: 'medium' as const } : item
          ) : [],
          citations: Array.isArray(response.news) ? response.news.map((item: any) => ({
            title: item.title,
            snippet: item.description || '',
            source: item.source?.name || 'News API',
            timestamp: item.publishedAt || '',
            url: item.url || '#'
          })) : (Array.isArray(response.citations) ? response.citations : []),
          // âœ… Map real arrays downstream directly from server payload
          revenueSeries: Array.isArray(response.revenueSeries) ? response.revenueSeries : [],
          regulatoryNotes: Array.isArray(response.regulatoryNotes) ? response.regulatoryNotes : [],
          insiderNotes: Array.isArray(response.insiderNotes) ? response.insiderNotes : [],
        };
        
        setResult(cleanResult);

        setStreamedSections([
          { section: 'AI Generated Report', content: markdownContent },
          { section: 'Executive Summary', content: markdownContent }
        ]);

        setTimeline((prev) => [
          ...prev,
          { id: timelineIdRef.current++, label: 'Analysis Complete', detail: 'Structured analytics dashboard mounted successfully', timestamp: nowStamp(), state: 'done' }
        ]);
        setThinking((prev) => [...prev, 'Report compiled successfully.']);
        setLogs((prev) => [
          ...prev,
          { id: logsIdRef.current++, timestamp: nowStamp(), message: 'API Response payload mounted to dashboard interface.' }
        ]);

      } catch (error) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        
        setStatus('idle');
        setPhase('idle');
        setSteps((prev) => prev.map((step) => step.status === 'active' ? { ...step, status: 'failed' } : step));
        setThinking((prev) => [...prev, error instanceof Error ? error.message : 'Research failed']);
        setLogs((prev) => [
          ...prev,
          { id: logsIdRef.current++, timestamp: nowStamp(), message: `Error encountered processing response: ${error instanceof Error ? error.message : 'Server rejection'}` }
        ]);
      }
    },
    [updateStepsAndPhase]
  );

  const reset = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setStatus('idle');
    setPhase('idle');
    setSteps(freshSteps());
    setResult(null);
    setRawMarkdown('');
    setProfile(null);
    setQuote(null);
    setFinancials(null);
    setNews([]);
    setProgress(0);
    setMessages([]);
    setTimeline([]);
    setThinking([]);
    setLogs([]);
    setStreamedSections([]);
    logsIdRef.current = 0;
    timelineIdRef.current = 0;
  }, []);

  // âœ… Async backend integration strategy cleanly executing Groq updates dynamically
  const ask = useCallback(async (text: string, scenario: MacroScenario) => {
    const userMsg: ChatMessage = { id: msgIdRef.current++, role: 'user', text, timestamp: nowStamp() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await postChatQuery({
        question: text,
        context: result,
        scenario: scenario.id
      });

      setMessages((prev) => [
        ...prev,
        { 
          id: msgIdRef.current++, 
          role: 'agent', 
          text: response.answer || "No response received from agent pipeline.", 
          timestamp: nowStamp() 
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { 
          id: msgIdRef.current++, 
          role: 'agent', 
          text: "Communication timeout error checking context strings.", 
          timestamp: nowStamp() 
        },
      ]);
    }
  }, [result]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Note: Unused socketId, replay, and canReplay variables removed from type bindings return signature
  return {
    status,
    phase,
    steps,
    result,
    rawMarkdown, 
    progress,
    messages,
    timeline,
    thinking,
    logs,
    streamedSections,
    profile,
    quote,
    financials,
    news,
    run,
    reset,
    ask,
  };
}