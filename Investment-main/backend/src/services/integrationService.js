const axios = require("axios");
const OpenAI = require("openai");


const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});


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
        verdict: 'PASS',
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
        report: `# ${profile.name || 'Company'} Research Snapshot\n\n## Market Data\n- Current price: ${price}\n- 52-week range: ${range}\n- 52-week return: ${return52}\n- Trailing P/E: ${pe}\n\n## Status\nThe AI narrative could not be generated for this request. The figures above are live data from the research sources and should be used as a starting point for further due diligence.`,
    };
}

exports.generateGroqReport = async ({ profile, quote, financials, news, web }) => {
    const context = buildResearchContext({ profile, quote, financials, news, web });

    try {
        const prompt = `You are a professional CFA investment analyst. Analyze the following compact, verified dataset. Do not invent facts. Return only valid JSON matching this schema:\n\n{\n  "company":"",\n  "ticker":"",\n  "verdict":"INVEST" | "PASS",\n  "confidence":0,\n  "executiveSummary":[""],\n  "pros":[{"text":"reason","weight":"high" | "medium" | "low"}],\n  "cons":[{"text":"reason","weight":"high" | "medium" | "low"}],\n  "citations":[],\n  "report":"markdown report"\n}\n\nDATA:\n${JSON.stringify(context)}`;

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'Return only valid JSON. Keep the report concise and cite only supplied sources.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 1800,
        });

        const text = (response.choices[0]?.message?.content || '')
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        if (!text) throw new Error('Groq returned an empty report.');
        return JSON.parse(text);
    } catch (error) {
        console.error('Groq Error:', error.message);
        return buildFallbackReport(context);
    }
};
