const researchService = require("../services/researchService");

exports.runResearch = async (req, res, next) => {
    try {
        const { company } = req.body;

        if (!company || company.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Company is required"
            });
        }

        const data = await researchService.executeResearch(company.trim());

        return res.status(200).json({
            success: true,
            ...data
        });

    } catch (err) {
        console.error("Research Controller Error:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to generate research report."
        });
    }
};