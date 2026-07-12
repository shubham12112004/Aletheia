const axios = require("axios");

const OpenAI = require("openai");

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});
console.log("Groq Key Loaded:", !!process.env.GROQ_API_KEY);
console.log("Groq Key Prefix:", process.env.GROQ_API_KEY?.substring(0, 8));
const TAVILY_KEY = process.env.TAVILY_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const NEWS_KEY = process.env.NEWS_API_KEY;

/*
=========================================
Search Company Symbol
=========================================
*/

exports.searchCompany = async (company) => {
    try {

        const { data } = await axios.get(
            "https://finnhub.io/api/v1/search",
            {
                params: {
                    q: company,
                    token: FINNHUB_KEY
                }
            }
        );

        if (data.result && data.result.length > 0) {
            return data.result[0];
        }

        return null;

    } catch (err) {

        console.error(
            "Finnhub Search Error:",
            err.response?.status,
            err.response?.data || err.message
        );

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

        console.log("Using Symbol:", symbol);

        const { data } = await axios.get(
            "https://finnhub.io/api/v1/stock/profile2",
            {
                params: {
                    symbol,
                    token: FINNHUB_KEY
                }
            }
        );

        return data;

    } catch (err) {

        console.error(
            "Finnhub Profile Error:",
            err.response?.status,
            err.response?.data || err.message
        );

        return {};
    }
};

/*
=========================================
Company News
=========================================
*/

exports.getCompanyNews = async (company) => {

    try {

        const { data } = await axios.get(
            "https://newsapi.org/v2/everything",
            {
                params: {
                    q: company,
                    pageSize: 10,
                    sortBy: "publishedAt",
                    language: "en",
                    apiKey: NEWS_KEY
                }
            }
        );

        return data.articles || [];

    } catch (err) {

        console.error(
            "NewsAPI Error:",
            err.response?.status,
            err.response?.data || err.message
        );

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

        console.error(
            "Tavily Error:",
            err.response?.status,
            err.response?.data || err.message
        );

        return [];
    }
};

/*
=========================================
Gemini Report
=========================================
*/

exports.generateGroqReport = async ({ profile, news, web }) => {

    try {

        const latestNews = news
            .slice(0, 5)
            .map((n) => `Title: ${n.title}\nDescription: ${n.description || "No description available."}`)
            .join("\n\n");

        const webResults = web
            .slice(0, 5)
            .map((r) => `Title: ${r.title}\nContent: ${r.content || "No content available."}`)
            .join("\n\n");

        const prompt = `
You are a CFA Level III Investment Research Analyst.

Analyze the following company and prepare a professional investment report.

==============================
Company Profile
==============================

${JSON.stringify(profile, null, 2)}

==============================
Latest News
==============================

${latestNews}

==============================
Web Research
==============================

${webResults}

Generate a detailed report containing:

1. Executive Summary
2. Company Overview
3. Industry Analysis
4. Financial Health
5. SWOT Analysis
6. Growth Opportunities
7. Risk Analysis
8. Latest News Impact
9. Buy / Hold / Sell Recommendation
10. Confidence Score (0-100)

Return ONLY markdown.
`;

        console.log("================================");
        console.log("Calling Groq...");
        console.log("Model: llama-3.3-70b-versatile");
        console.log("================================");

        const response = await Promise.race([

            groq.chat.completions.create({

                model: "llama-3.3-70b-versatile",

                messages: [

                    {
                        role: "system",
                        content: "You are an expert financial investment analyst."
                    },

                    {
                        role: "user",
                        content: prompt
                    }

                ],

                temperature: 0.5,
                max_tokens: 4096

            }),

            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Groq Timeout")), 30000)
            )

        ]);

        console.log("================================");
        console.log("Groq Success");
        console.log("================================");

        if (
            !response ||
            !response.choices ||
            !response.choices.length === 0
        ) {
            throw new Error("Groq returned an empty response.");
        }

        return response.choices[0].message.content;

    } catch (err) {

        console.log("================================");
        console.error("Groq Error");
        console.log("================================");

        console.error(err);

        if (err.response) {
            console.error("Status:", err.response.status);
            console.error(err.response.data);
        }

        return "Unable to generate investment report.";
    }
};

/*
=========================================
New Functions: Finnhub Pricing & Financial Metrics APIs
=========================================
*/

exports.getQuote = async (symbol) => {
    try {
        const { data } = await axios.get(
            "https://finnhub.io/api/v1/quote",
            {
                params: {
                    symbol,
                    token: FINNHUB_KEY
                }
            }
        );
        return data;
    } catch (err) {
        console.error(
            "Finnhub Quote Error:",
            err.response?.status,
            err.response?.data || err.message
        );
        return null;
    }
};

exports.getBasicFinancials = async (symbol) => {
    try {
        const { data } = await axios.get(
            "https://finnhub.io/api/v1/stock/metric",
            {
                params: {
                    symbol,
                    metric: "all",
                    token: FINNHUB_KEY
                }
            }
        );
        return data;
    } catch (err) {
        console.error(
            "Finnhub Basic Financials Error:",
            err.response?.status,
            err.response?.data || err.message
        );
        return null;
    }
};

exports.getCompanyMetrics = async (symbol) => {
    try {
        const { data } = await axios.get(
            "https://finnhub.io/api/v1/stock/financials-reported",
            {
                params: {
                    symbol,
                    token: FINNHUB_KEY
                }
            }
        );
        return data;
    } catch (err) {
        console.error(
            "Finnhub Reported Metrics Error:",
            err.response?.status,
            err.response?.data || err.message
        );
        return null;
    }
};