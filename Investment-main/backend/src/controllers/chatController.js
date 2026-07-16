const OpenAI = require("openai");

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

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

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are Aletheia, an expert AI investment analyst assistant. You provide concise, insightful answers about investment research. Current macro scenario: ${scenario || "Baseline"}. Research context: ${contextSummary}`
                },
                {
                    role: "user",
                    content: question
                }
            ],
            temperature: 0.4,
            max_tokens: 512
        });

        const answer = response.choices[0]?.message?.content?.trim() || "Unable to generate a response.";

        return res.status(200).json({
            success: true,
            answer
        });

    } catch (err) {
        console.error("Chat Controller Error:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to process chat query.",
            answer: "I'm temporarily unavailable. Please try again shortly."
        });
    }
};
