const axios = require("axios");
const OpenAI = require("openai");

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const TAVILY_KEY = process.env.TAVILY_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const NEWS_KEY = process.env.NEWS_API_KEY;

/*
=========================================
Search Company Symbol with Weighted Ranking
=========================================
*/
exports.searchCompany = async (query) => {
    try {
        const { data } = await axios.get(
            "https://finnhub.io/api/v1/search",
            {
                params: {
                    q: query,
                    token: FINNHUB_KEY
                }
            }
        );

        if (!data.result || data.result.length === 0) return null;

        const normalizedQuery = query.trim().toUpperCase();

        const ranked = data.result.map(item => {
            let score = 0;
            const symbol = (item.symbol || "").toUpperCase();
            const description = (item.description || "").toUpperCase();

            if (symbol === normalizedQuery) score += 100;
            if (description === normalizedQuery) score += 50;
            if (item.type === "Common Stock") score += 30;
            if (symbol.length <= 4) score += 10;
            if (description.includes(normalizedQuery)) score += 5;

            return { item, score };
        });

        ranked.sort((a, b) => b.score - a.score);
        return ranked[0].item;

    } catch (err) {
        console.error("Finnhub Search Error:", err.message);
        return null;
    }
};

/*
=========================================
Company Profile
=========================================
*/
exports.getCompanyProfile = async (company) => {
    try {
        let symbol = company;

        if (!company.match(/^[A-Z]{1,5}$/i)) {
            const search = await exports.searchCompany(company);
            if (search && search.symbol) {
                symbol = search.symbol;
            }
        }

        const { data } = await axios.get(
            "https://finnhub.io/api/v1/stock/profile2",
            {
                params: {
                    symbol,
                    token: FINNHUB_KEY
                }
            }
        );

        if (data) {
            data.ticker = symbol;
        }

        return data;
    } catch (err) {
        console.error("Finnhub Profile Error:", err.message);
        return {};
    }
};

/*
=========================================
Company News
=========================================
*/
exports.getCompanyNews = async (searchString) => {
    try {
        const { data } = await axios.get(
            "https://newsapi.org/v2/everything",
            {
                params: {
                    q: searchString,
                    pageSize: 20,
                    sortBy: "publishedAt",
                    language: "en",
                    apiKey: NEWS_KEY
                }
            }
        );
        return data.articles || [];
    } catch (err) {
        console.error("NewsAPI Error:", err.message);
        return [];
    }
};

/*
=========================================
Tavily Search
=========================================
*/
exports.tavilySearch = async (company) => {
    try {
        const { data } = await axios.post(
            "https://api.tavily.com/search",
            {
                api_key: TAVILY_KEY,
                query: `${company} investment analysis latest news SWOT`,
                search_depth: "advanced",
                include_answer: true,
                max_results: 5
            }
        );
        return data.results || [];
    } catch (err) {
        console.error("Tavily Error:", err.message);
        return [];
    }
};

/*
=========================================
Groq Structured Report Generation Engine
=========================================
*/
exports.generateGroqReport = async ({ profile, quote, financials, news, web }) => {
    let response; // ✅ Lifted declaration allows safe validation fallback across code blocks
    
    try {
        const latestNews = (news || [])
            .slice(0, 5)
            .map((n) => `Title: ${n.title}\nDescription: ${n.description || "No description available."}`)
            .join("\n\n");

        const webResults = (web || [])
            .slice(0, 5)
            .map((r) => `Title: ${r.title}\nContent: ${r.content || "No content available."}`)
            .join("\n\n");

        const prompt = `
You are a CFA Level III Investment Research Analyst.
Analyze the following asset vectors comprehensively and return a professional evaluation.

==============================
Company Profile
==============================
${JSON.stringify(profile, null, 2)}

==============================
Live Market Quote
==============================
${JSON.stringify(quote || {}, null, 2)}

==============================
Financial Metrics
==============================
${JSON.stringify(financials?.metric || {}, null, 2)}

==============================
Latest News
==============================
${latestNews}

==============================
Web Research
==============================
${webResults}

Generate a detailed report. Your final answer must be a valid JSON object matching the schema below. Do not wrap it in markdown code fences or add additional commentary blocks.

Expected JSON schema format:
{
  "company": "Company Name",
  "ticker": "TICKER",
  "verdict": "INVEST" or "PASS",
  "confidence": 92,
  "executiveSummary": [
    "Primary summary investment thesis statement.",
    "Macro risk evaluation statement."
  ],
  "pros": [
    { "text": "Detail description of strength factor.", "weight": "high" }
  ],
  "cons": [
    { "text": "Detail description of bottleneck constraint factor.", "weight": "medium" }
  ],
  "report": "Provide the comprehensive long-form technical report rendered here in valid Markdown syntax covering: Executive Summary, Business Model, Competitive Advantage, Industry Analysis, Financial Health, Market Position, Valuation, News Impact, SWOT Analysis, Risks, Growth Catalysts, and Outlook."
}
`;

        response = await Promise.race([
            groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }, 
                messages: [
                    {
                        role: "system",
                        content: "You are an expert financial investment analyst who outputs only strict, structured JSON matching the requested schema exactly."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 4096 
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Groq processing pipeline timed out.")), 45000)
            )
        ]);

        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error("Groq returned an empty choice matrix.");
        }

        const content = response.choices[0].message.content;
        
        // ✅ Sanitize fenced markdown representations before executing parsing logic
        const cleaned = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
            
        return JSON.parse(cleaned);

    } catch (jsonErr) {
        console.warn("JSON resolution fallback mounted:", jsonErr.message);
        
        // Safe context recovery without causing ReferenceErrors
        const rawContentFallback = typeof response !== 'undefined' 
            ? response?.choices?.[0]?.message?.content || "" 
            : "";

        return {
            company: profile?.name || "Unknown Company",
            ticker: profile?.ticker || "N/A",
            verdict: "PASS",
            confidence: 75,
            executiveSummary: ["Fallback dataset loaded due to pipeline structure exceptions."],
            pros: [],
            cons: [],
            news: [],
            revenueSeries: [],
            regulatoryNotes: [],
            insiderNotes: [],
            report: rawContentFallback || "Unable to format target summary text blocks."
        };
    }
};

exports.getQuote = async (symbol) => {
    try {
        const { data } = await axios.get("https://finnhub.io/api/v1/quote", { params: { symbol, token: FINNHUB_KEY } });
        return data;
    } catch (err) { return null; }
};

exports.getBasicFinancials = async (symbol) => {
    try {
        const { data } = await axios.get("https://finnhub.io/api/v1/stock/metric", { params: { symbol, metric: "all", token: FINNHUB_KEY } });
        return data;
    } catch (err) { return null; }
};