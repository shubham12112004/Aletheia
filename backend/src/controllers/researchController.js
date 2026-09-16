const researchService = require("../services/researchService");
const Research = require("../models/Research");

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
        
        // Save to Research model if user is authenticated (Optional for guests, but required for SaaS)
        // Check if req.user exists (authMiddleware should be applied to this route ideally)
        if (req.user && req.user._id) {
            try {
                await Research.create({
                    userId: req.user._id,
                    company: data.company,
                    ticker: data.ticker,
                    finalReport: data, // Storing the entire structured response
                });
            } catch (saveErr) {
                console.error("Failed to save research history:", saveErr);
            }
        }

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