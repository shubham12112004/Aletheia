const axios = require("axios");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { generateWithFallback } = require('../utils/geminiHelper');


const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const NEWS_KEY = process.env.NEWS_API_KEY;
const TAVILY_KEY = process.env.TAVILY_API_KEY;


/*
====================================================
SEARCH COMPANY NAME -> SYMBOL
====================================================
*/

exports.searchCompany = async (query) => {

    try {

        console.log("Searching company:", query);
        console.log("Finnhub key:", !!FINNHUB_KEY);


        const { data } = await axios.get(
            "https://finnhub.io/api/v1/search",
            {
                params:{
                    q:query,
                    token:FINNHUB_KEY
                }
            }
        );


        console.log(
            "Finnhub Search:",
            data.result?.slice(0,3)
        );


        if(
            !data.result ||
            data.result.length === 0
        ){
            return null;
        }



        const searchText =
            query.toUpperCase();



        const ranked =
            data.result.map(item=>{

                let score = 0;


                const symbol =
                    item.symbol?.toUpperCase() || "";


                const description =
                    item.description?.toUpperCase() || "";



                if(symbol === searchText)
                    score += 100;



                if(description.includes(searchText))
                    score += 50;



                if(item.type === "Common Stock")
                    score += 30;



                if(symbol.length <= 5)
                    score += 10;



                return {
                    item,
                    score
                };

            });



        ranked.sort(
            (a,b)=>b.score-a.score
        );



        console.log(
            "Selected company:",
            ranked[0].item
        );


        return ranked[0].item;



    }
    catch(error){

        console.error(
            "Finnhub Search Error:",
            error.response?.data ||
            error.message
        );

        return null;
    }

};





/*
====================================================
COMPANY PROFILE
====================================================
*/


exports.getCompanyProfile = async(symbol)=>{


    try{


        const {data}=await axios.get(
            "https://finnhub.io/api/v1/stock/profile2",
            {
                params:{
                    symbol,
                    token:FINNHUB_KEY
                }
            }
        );



        console.log(
            "Profile Response:",
            data
        );



        return {

            ...data,

            name:
                data.name ||
                data.companyName ||
                symbol,


            ticker:
                symbol

        };



    }
    catch(error){


        console.error(
            "Profile Error:",
            error.response?.data ||
            error.message
        );



        return {

            name:symbol,

            ticker:symbol

        };

    }

};






/*
====================================================
LIVE QUOTE
====================================================
*/


exports.getQuote = async(symbol)=>{


    try{


        const {data}=await axios.get(
            "https://finnhub.io/api/v1/quote",
            {
                params:{
                    symbol,
                    token:FINNHUB_KEY
                }
            }
        );



        console.log(
            "Quote:",
            data
        );


        return data;


    }
    catch(error){

        console.error(
            "Quote Error:",
            error.response?.data ||
            error.message
        );


        return {};

    }

};






/*
====================================================
FINANCIAL METRICS
====================================================
*/


exports.getBasicFinancials = async(symbol)=>{


    try{


        const {data}=await axios.get(
            "https://finnhub.io/api/v1/stock/metric",
            {
                params:{
                    symbol,
                    metric:"all",
                    token:FINNHUB_KEY
                }
            }
        );



        console.log(
            "Financial Metrics:",
            data.metric
        );



        return data;


    }
    catch(error){


        console.error(
            "Financial Error:",
            error.response?.data ||
            error.message
        );


        return {};

    }

};






/*
====================================================
NEWS
====================================================
*/


exports.getCompanyNews = async(company)=>{


    try{


        const {data}=await axios.get(
            "https://newsapi.org/v2/everything",
            {
                params:{
                    q:company,
                    pageSize:10,
                    sortBy:"publishedAt",
                    language:"en",
                    apiKey:NEWS_KEY
                }
            }
        );



        return data.articles || [];


    }
    catch(error){


        console.error(
            "News Error:",
            error.response?.data ||
            error.message
        );


        return [];

    }

};







/*
====================================================
TAVILY WEB SEARCH
====================================================
*/


exports.tavilySearch = async(company)=>{


    try{


        const {data}=await axios.post(
            "https://api.tavily.com/search",
            {

                api_key:TAVILY_KEY,

                query:
                `${company} investment analysis latest news SWOT`,

                search_depth:"advanced",

                max_results:5

            }
        );



        return data.results || [];



    }
    catch(error){


        console.error(
            "Tavily Error:",
            error.response?.data ||
            error.message
        );


        return [];

    }

};







/*
====================================================
GROQ REPORT
====================================================
*/


const trimText = (value, limit = 360) => {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

function buildResearchContext({ profile, quote, financials, news, web }) {
    const metrics = financials?.metric || {};
    const pickMetric = (key) => metrics[key] ?? null;

    return {
        profile: {
            name: profile?.name || null,
            ticker: profile?.ticker || null,
            industry: profile?.finnhubIndustry || null,
            country: profile?.country || null,
            marketCapitalization: profile?.marketCapitalization ?? null,
        },
        quote: {
            current: quote?.c ?? null,
            change: quote?.d ?? null,
            changePercent: quote?.dp ?? null,
            dayHigh: quote?.h ?? null,
            dayLow: quote?.l ?? null,
            previousClose: quote?.pc ?? null,
        },
        metrics: {
            peTTM: pickMetric('peTTM'),
            forwardPE: pickMetric('forwardPE'),
            epsTTM: pickMetric('epsTTM'),
            beta: pickMetric('beta'),
            dividendYield: pickMetric('dividendYieldIndicatedAnnual'),
            revenueGrowthTTMYoy: pickMetric('revenueGrowthTTMYoy'),
            epsGrowthTTMYoy: pickMetric('epsGrowthTTMYoy'),
            netProfitMarginTTM: pickMetric('netProfitMarginTTM'),
            debtToEquity: pickMetric('totalDebt/totalEquityQuarterly'),
            week52High: pickMetric('52WeekHigh'),
            week52Low: pickMetric('52WeekLow'),
            week52Return: pickMetric('52WeekPriceReturnDaily'),
        },
        news: (Array.isArray(news) ? news : []).slice(0, 5).map((article) => ({
            title: trimText(article?.title, 180),
            source: trimText(article?.source?.name, 80),
            publishedAt: article?.publishedAt || null,
            description: trimText(article?.description, 280),
        })),
        web: (Array.isArray(web) ? web : []).slice(0, 3).map((result) => ({
            title: trimText(result?.title, 180),
            url: result?.url || null,
            content: trimText(result?.content || result?.snippet, 360),
        })),
    };
}

function buildFallbackReport(context) {
    const { profile, quote, metrics, news } = context;
    const price = quote.current != null ? `$${Number(quote.current).toFixed(2)}` : 'unavailable';
    const range = metrics.week52Low != null && metrics.week52High != null
        ? `$${Number(metrics.week52Low).toFixed(2)}–$${Number(metrics.week52High).toFixed(2)}`
        : 'unavailable';
    const pe = metrics.peTTM != null ? Number(metrics.peTTM).toFixed(2) : 'unavailable';
    const return52 = metrics.week52Return != null ? `${Number(metrics.week52Return).toFixed(2)}%` : 'unavailable';
    return {
        company: profile.name || 'Unknown',
        ticker: profile.ticker || 'N/A',
        verdict: 'HOLD',
        confidence: 0,
        executiveSummary: [
            `${profile.name || 'This company'} is trading at ${price}.`,
            `The reported 52-week range is ${range}, with a 52-week return of ${return52}.`,
            `Reported trailing P/E is ${pe}. Review valuation, risk, and source evidence before investing.`,
        ],
        pros: metrics.revenueGrowthTTMYoy != null && Number(metrics.revenueGrowthTTMYoy) > 0
            ? [{ text: `Revenue growth is ${Number(metrics.revenueGrowthTTMYoy).toFixed(2)}% year over year.`, weight: 'medium' }]
            : [],
        cons: [{ text: 'The AI narrative service is temporarily unavailable; this report uses verified market data only.', weight: 'high' }],
        citations: news.map((article) => ({
            title: article.title || 'Market news',
            source: article.source || 'News API',
            url: '#',
            timestamp: article.publishedAt || '',
            snippet: article.description || '',
        })),
        suggestedQuestions: [
            "What are the main risks associated with this asset?",
            "Show valuation metrics compared to industry average",
            "What is the long term outlook?"
        ],
        report: `# Executive Summary\nData services are operating in fallback mode due to a temporary AI outage. Please review raw metrics directly.\n\n## Investment Recommendation\n**HOLD** (0% Confidence)\n\n## Why?\nThe AI reasoning engine is currently disconnected.\n\n## Key Positive Signals\n- Live market data retrieval successful\n\n## Risk Factors\n- Fundamental analysis is severely limited without AI processing\n\n## Financial Metrics\n- Current price: ${price}\n- 52-week range: ${range}\n- Trailing P/E: ${pe}\n\n## AI Confidence Score\n0% Confidence - Engine Offline\n\n## Bull Case\nN/A\n\n## Bear Case\nN/A\n\n## Final Conclusion\nExercise caution and rely on human due diligence until the agent network reconnects.`,
    };
}

exports.generateGroqReport = async ({ profile, quote, financials, news, web }) => {
    const context = buildResearchContext({ profile, quote, financials, news, web });

    try {
        const prompt = `You are a professional CFA investment analyst at a top-tier hedge fund. Analyze the following compact, verified dataset. Do not invent facts. Return only valid JSON.

DATA:
${JSON.stringify(context)}`;

        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                company: { type: SchemaType.STRING },
                ticker: { type: SchemaType.STRING },
                verdict: { type: SchemaType.STRING, enum: ["BUY", "HOLD", "SELL"] },
                confidence: { type: SchemaType.INTEGER, description: "Integer from 1 to 100" },
                executiveSummary: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                businessOverview: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                financialSnapshot: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                growthAnalysis: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                financialRatios: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                swot: {
                    type: SchemaType.OBJECT,
                    properties: {
                        strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        opportunities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        threats: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    }
                },
                competitors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                recentNews: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                risks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                opportunities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                bullCase: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                bearCase: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                investmentRecommendation: { type: SchemaType.STRING },
                finalVerdict: { type: SchemaType.STRING }
            },
            required: ["company", "ticker", "verdict", "confidence", "executiveSummary", "businessOverview", "financialSnapshot", "growthAnalysis", "financialRatios", "swot", "competitors", "recentNews", "risks", "opportunities", "bullCase", "bearCase", "investmentRecommendation", "finalVerdict"]
        };

        const text = await generateWithFallback({
            prompt,
            schema
        });

        if (!text) throw new Error('Gemini returned an empty report.');
        return JSON.parse(text);
    } catch (error) {
        console.error('Gemini Error:', error.message);
        return buildFallbackReport(context);
    }
};
