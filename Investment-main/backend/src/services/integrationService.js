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


exports.generateGroqReport = async({
    profile,
    quote,
    financials,
    news,
    web
})=>{


try{


const prompt = `

You are a professional CFA investment analyst.

Analyze this company.

PROFILE:
${JSON.stringify(profile)}

QUOTE:
${JSON.stringify(quote)}

FINANCIALS:
${JSON.stringify(financials)}

NEWS:
${JSON.stringify(news)}

WEB:
${JSON.stringify(web)}


Return ONLY JSON:

{
"company":"",
"ticker":"",
"verdict":"INVEST",
"confidence":90,
"executiveSummary":[],
"pros":[{"text":"reason","weight":"high"}],
"cons":[{"text":"reason","weight":"medium"}],
"report":"markdown report"
}

`;



const response =
await groq.chat.completions.create({

model:"llama-3.3-70b-versatile",

messages:[

{
role:"system",
content:
"Return only valid JSON"
},

{
role:"user",
content:prompt
}

],

temperature:0.2,

max_tokens:4096

});



let text =
response.choices[0]
.message
.content
.trim();



text =
text.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



return JSON.parse(text);



}
catch(error){


console.error(
"Groq Error:",
error.message
);



return {

company:
profile?.name || "Unknown",

ticker:
profile?.ticker || "N/A",

verdict:"PASS",

confidence:0,

executiveSummary:[],

pros:[],

cons:[],

report:
"Unable to generate report"

};


}


};