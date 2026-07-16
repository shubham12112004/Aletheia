const integration = require("./integrationService");

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
                report?.confidence ||
                0,



            executiveSummary:
                report?.executiveSummary ||
                [],



            pros:
                report?.pros ||
                [],



            cons:
                report?.cons ||
                [],



            citations:
                report?.citations ||
                [],



            revenueSeries:
                report?.revenueSeries ||
                [],



            regulatoryNotes:
                report?.regulatoryNotes ||
                [],



            insiderNotes:
                report?.insiderNotes ||
                [],




            // Full markdown report

            report:
                report?.report ||
                "No report generated."

        };



    } catch(error){


        console.error(
            "Research Pipeline Failed"
        );


        console.error(error);



        throw error;

    }

};