import { useCallback, useEffect, useRef, useState } from 'react';
import { postResearch } from '@/lib/api';
import { answerQuestion } from '@/lib/mockData';
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

/**
 * Parses out verdict structural values dynamically from AI Markdown text
 */
function parseVerdictFromMarkdown(markdown: string): 'INVEST' | 'PASS' {
  const upperText = markdown.toUpperCase();
  
  const recommendationSection = upperText.match(/(?:VERDICT|RECOMMENDATION|FINAL ACTION)\s*[:\-*]*\s*([A-Z]+)/);
  
  if (recommendationSection && recommendationSection[1]) {
    const verdictWord = recommendationSection[1].trim();
    if (['PASS', 'SELL', 'HOLD'].includes(verdictWord)) {
      return 'PASS';
    }
    if (['INVEST', 'BUY', 'BULLISH'].includes(verdictWord)) {
      return 'INVEST';
    }
  }

  if (
    upperText.includes('VERDICT: PASS') || 
    upperText.includes('RECOMMENDATION: PASS') ||
    upperText.includes('RECOMMENDATION: SELL') ||
    upperText.includes('RECOMMENDATION: HOLD')
  ) {
    return 'PASS';
  }
  
  return 'INVEST';
}

/**
 * Dynamic parameter extractor targeting percentage patterns or numbers near score keywords
 */
function parseConfidenceFromMarkdown(markdown: string): number {
  const confidenceRegex = /(?:CONFIDENCE SCORE|CONFIDENCE|INVESTMENT SCORE)\s*[:\-*]*\s*(\d{1,3})(?:%|\b)/i;
  const match = markdown.match(confidenceRegex);
  
  if (match && match[1]) {
    const value = parseInt(match[1], 10);
    if (value >= 0 && value <= 100) return value;
  }
  
  return 85;
}

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
        
        setRawMarkdown(response.report);
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

        const markdownContent = typeof response?.report === 'string' 
          ? response.report 
          : JSON.stringify(response?.report ?? 'No report found.');

        const calculatedVerdict = parseVerdictFromMarkdown(markdownContent);
        const calculatedConfidence = parseConfidenceFromMarkdown(markdownContent);

        // Explicitly structural metrics construction mapping
        const syntheticReport: ResearchResult = {
          company: response.profile?.name || company || 'Unknown Company',
          ticker: response.profile?.ticker || 'N/A',
          verdict: calculatedVerdict,
          confidence: calculatedConfidence,
          scenarioId: scenario.id,
          executiveSummary: [markdownContent], 
          metrics: [
            {
              label: "Revenue",
              value: String(response.financials?.metric?.revenuePerShareTTM ?? "N/A"),
              delta: "",
              tone: "neutral",
              description: "Revenue per share"
            },
            {
              label: "P/E Ratio",
              value: String(response.financials?.metric?.peTTM ?? "N/A"),
              delta: "",
              tone: "neutral",
              description: "Price to Earnings"
            },
            {
              label: "EPS",
              value: String(response.financials?.metric?.epsTTM ?? "N/A"),
              delta: "",
              tone: "neutral",
              description: "Earnings Per Share"
            },
            {
              label: "Dividend",
              value: String(response.financials?.metric?.dividendYieldIndicatedAnnual ?? "N/A"),
              delta: "",
              tone: "neutral",
              description: "Dividend Yield"
            },
            {
              label: "Beta",
              value: String(response.financials?.metric?.beta ?? "N/A"),
              delta: "",
              tone: "neutral",
              description: "Volatility"
            }
          ],
          pros: [],
          cons: [],
          citations: Array.isArray(response.news) ? response.news.map((item: any) => ({
            title: item.title,
            snippet: item.description || '',
            source: item.source?.name || 'News API',
            timestamp: item.publishedAt || '',
            url: item.url || '#'
          })) : [],
          revenueSeries: [],
          regulatoryNotes: [],
          insiderNotes: [],
        };
        setResult(syntheticReport);

        setStreamedSections([
          { section: 'AI Generated Report', content: markdownContent },
          { section: 'Executive Summary', content: markdownContent }
        ]);

        setTimeline((prev) => [
          ...prev,
          { id: timelineIdRef.current++, label: 'Analysis Complete', detail: 'Groq Markdown report loaded immediately', timestamp: nowStamp(), state: 'done' }
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

  const ask = useCallback((text: string, scenario: MacroScenario) => {
    const userMsg: ChatMessage = { id: msgIdRef.current++, role: 'user', text, timestamp: nowStamp() };
    setMessages((prev) => [...prev, userMsg]);

    const answer = answerQuestion(text, result, scenario);
    setMessages((prev) => [
      ...prev,
      { id: msgIdRef.current++, role: 'agent', text: answer, timestamp: nowStamp() },
    ]);
  }, [result]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

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
    socketId: undefined, 
    logs,
    streamedSections,
    profile,
    quote,
    financials,
    news,
    run,
    reset,
    ask,
    replay: () => {}, 
    canReplay: false,
  };
}