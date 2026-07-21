const integration = require("./integrationService");
function calculateDataConfidence({ profile, quote, financials, news, web }) {
    const metrics = financials?.metric || {};
    const hasNumber = (value) => Number.isFinite(Number(value));
    let score = 0;

    if (profile?.name && profile?.ticker) score += 15;
    if (hasNumber(quote?.c) && Number(quote.c) > 0) score += 20;
    if (hasNumber(quote?.h) && hasNumber(quote?.l)) score += 10;
    if (hasNumber(metrics.peTTM) || hasNumber(metrics.peBasicExclExtraTTM)) score += 15;
    if (hasNumber(metrics.epsTTM) || hasNumber(metrics.epsBasicExclExtraItemsTTM)) score += 15;
    if (hasNumber(metrics["52WeekHigh"]) && hasNumber(metrics["52WeekLow"])) score += 10;
    if (Array.isArray(news) && news.length > 0) score += 10;
    if (Array.isArray(web) && web.length > 0) score += 5;

    return Math.min(score, 95);
}

/**
 * Complete AI Investment Research Pipeline
 */
exports.executeResearch = async (
    company,
    scenarioId,
    focusOptions = {}
) => {

    try {

        console.log("--------------------------------");
        console.log("Starting Research");
        console.log("Company:", company);
        console.log("--------------------------------");


        // ============================================================
        // STEP 1: Resolve Company Name -> Symbol
        // ============================================================

        const searchResult = await integration.searchCompany(company);


        if (!searchResult) {
            throw new Error(
                `Company "${company}" not found`
            );
        }


        const symbol = searchResult.symbol;


        console.log("Resolved Symbol:", symbol);



        // ============================================================
        // STEP 2: Get Company Profile
        // ============================================================


        const profile =
            await integration.getCompanyProfile(symbol);



        console.log(
            "Profile:",
            profile
        );



        // Make sure frontend always gets company details

        const companyName =
            profile?.name ||
            searchResult.description ||
            company;



        const ticker =
            profile?.ticker ||
            symbol;



        // ============================================================
        // STEP 3: Fetch all data parallel
        // ============================================================


        const [
            quote,
            financials,
            news,
            web
        ] = await Promise.all([


            integration.getQuote(ticker),


            integration.getBasicFinancials(ticker),


            integration.getCompanyNews(
                companyName
            ),


            integration.tavilySearch(
                companyName
            )

        ]);



        const dataConfidence = calculateDataConfidence({
            profile,
            quote,
            financials,
            news,
            web,
        });
        console.log("Quote Loaded");
        console.log("Financials Loaded");
        console.log("News Loaded");
        console.log("Web Research Loaded");




        // ============================================================
        // STEP 4: Generate Groq Report
        // ============================================================


        const report =
            await integration.generateGroqReport({

                profile,

                quote,

                financials,

                news,

                web

            });



        console.log(
            "AI Report Generated"
        );




        // ============================================================
        // STEP 5: Return frontend response
        // ============================================================


        return {


            // Basic identity

            company:
                report?.company ||
                companyName,


            ticker:
                report?.ticker ||
                ticker,



            // Finnhub data

            profile,

            quote,

            financials,


            metrics:
                financials?.metric || {},



            // News

            news,



            // AI generated fields


            verdict:
                report?.verdict ||
                "PASS",

        console.log("Quote Loaded");
        console.log("Financials Loaded");
        console.log("News Loaded");
        console.log("Web Research Loaded");




        // ============================================================
        // STEP 4: Generate Groq Report
        // ============================================================


        const report =
            await integration.generateGroqReport({

                profile,

                quote,

                financials,

                news,

                web

            });



        console.log(
            "AI Report Generated"
        );




        // ============================================================
        // STEP 5: Return frontend response
        // ============================================================


        return {


            // Basic identity

            company:
                report?.company ||
                companyName,


            ticker:
                report?.ticker ||
                ticker,



            // Finnhub data

            profile,

            quote,

            financials,


            metrics:
                financials?.metric || {},



            // News

            news,



            // AI generated fields


            verdict:
                report?.verdict ||
                "PASS",



            confidence:
                Number.isFinite(Number(report?.confidence)) && Number(report.confidence) > 0
                    ? Math.min(Math.round(Number(report.confidence)), 100)
                    : dataConfidence,
                    
            // Structured Report Data
            executiveSummary: report?.executiveSummary || [],
            businessOverview: report?.businessOverview || [],
            financialSnapshot: report?.financialSnapshot || [],
            growthAnalysis: report?.growthAnalysis || [],
            financialRatios: report?.financialRatios || [],
            swot: report?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
            competitors: report?.competitors || [],
            recentNews: report?.recentNews || [],
            risks: report?.risks || [],
            opportunities: report?.opportunities || [],
            bullCase: report?.bullCase || [],
            bearCase: report?.bearCase || [],
            investmentRecommendation: report?.investmentRecommendation || "Hold",
            finalVerdict: report?.finalVerdict || "Requires further human analysis."
        };

    } catch(error) {
        console.error(
            "Research Pipeline Failed"
        );
        console.error(error);
        throw error;
    }
};