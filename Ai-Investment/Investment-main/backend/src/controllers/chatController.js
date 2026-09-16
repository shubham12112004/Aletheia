const { generateWithFallback } = require("../utils/geminiHelper");

exports.handleChat = async (req, res) => {
    try {
        const { question, context, scenario } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const contextSummary = context
            ? `Company: ${context.company || "Unknown"}, Ticker: ${context.ticker || "N/A"}, Verdict: ${context.verdict || "N/A"}, Confidence: ${context.confidence || 0}%`
            : "No research context available.";

        const systemPrompt = `You are Aletheia, an expert AI investment analyst assistant and guide for the Aletheia Research Workspace.
Your primary focus is to assist users with understanding the Aletheia project and interpreting the current research context. 
- You can explain how Aletheia fetches data (SEC filings, news sentiment, real-time market data).
- You can provide insights on the current research context: ${contextSummary}
- The current macro scenario applied is: ${scenario || "Baseline"}.

CRITICAL INSTRUCTIONS:
1. Prioritize answering questions about the Aletheia project, how the site works, and the user's CURRENT active search context. 
2. If asked about real-world data or general knowledge outside the context, answer it, but always gently steer the focus back to how Aletheia's tools can help analyze it better.
3. Keep answers concise, insightful, and easy to read.`;

        const answer = await generateWithFallback({
            prompt: question,
            systemInstruction: systemPrompt
        });

        return res.status(200).json({
            success: true,
            answer
        });

    } catch (err) {
        console.error("Chat Controller Error:", err.message);
        
        if (err.message && err.message.includes("403 Forbidden")) {
            return res.status(200).json({
                success: true,
                answer: "I am unable to process your request because my AI language model is currently disconnected. The `GEMINI_API_KEY` configured in the backend environment is either invalid or expired. Please contact the administrator to update the API key in the deployment settings."
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to process chat query.",
            answer: "I'm temporarily unavailable. Please try again shortly."
        });
    }
};
