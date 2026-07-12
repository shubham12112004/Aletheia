import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is required to run this test.");
}

async function test() {
    try {

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: "Say hello in one sentence."
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        console.log("SUCCESS");
        console.log(JSON.stringify(response.data, null, 2));

    } catch (err) {

        console.log("========== ERROR ==========");

        console.log("Message:");
        console.log(err.message);

        console.log("\nCode:");
        console.log(err.code);

        console.log("\nStatus:");
        console.log(err.response?.status);

        console.log("\nResponse:");
        console.log(JSON.stringify(err.response?.data, null, 2));

        console.log("\nStack:");
        console.log(err.stack);
    }
}

test();
