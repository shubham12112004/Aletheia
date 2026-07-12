const researchService = require("../services/researchService");

exports.runResearch = async (req, res, next) => {
    try {
        const { company } = req.body;

        if (!company) {
            return res.status(400).json({
                success: false,
                message: "Company is required"
            });
        }

        // Call the research orchestration pipeline and capture the expanded data payload
        // Note: If your researchService exports it as executeResearch, swap .run to .executeResearch
        const data = await researchService.executeResearch(company);

        // Spread the full structured data matrix (report, profile, quote, financials, news) into the response
        return res.json({
            success: true,
            ...data
        });

    } catch (err) {
        next(err);
    }
};