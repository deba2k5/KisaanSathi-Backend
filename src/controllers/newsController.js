const axios = require('axios');

const getAgriculturalNews = async (req, res) => {
    try {
        const SERPER_API_KEY = process.env.SERPER_API_KEY;
        let articles = [];

        // Try External API First (if key exists)
        if (SERPER_API_KEY) {
            try {
                const response = await axios.post(
                    'https://google.serper.dev/news',
                    {
                        q: "agriculture news India farming technology government schemes",
                        location: "India",
                        num: 10
                    },
                    {
                        headers: {
                            'X-API-KEY': SERPER_API_KEY,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                articles = response.data.news;
            } catch (apiError) {
                console.warn("[News] Serper API failed, falling back to mock:", apiError.message);
            }
        } else {
            console.warn("[News] No SERPER_API_KEY found, using mock data.");
        }

        // Fallback Mock Data (if API failed or no key)
        if (!articles || articles.length === 0) {
            articles = [
                {
                    title: "Government Announces New PM-KISAN Installment Date",
                    link: "https://pmkisan.gov.in",
                    snippet: "The central government has confirmed the release date for the 18th installment of PM-KISAN Samman Nidhi Yojana... [Mock Data]",
                    date: "Mock Date",
                    source: "Government of India",
                    imageUrl: "https://pmkisan.gov.in/images/header.jpg"
                },
                {
                    title: "Monsoon Forecast: Normal Rainfall Expected This Year",
                    link: "#",
                    snippet: "IMD predicts a normal monsoon for 2026, bringing relief to farmers across Maharashtra and Punjab... [Mock Data]",
                    date: "Mock Date",
                    source: "IMD",
                    imageUrl: "https://plus.unsplash.com/premium_photo-1661910078864-16a3a41bf8f6?q=80&w=2940&auto=format&fit=crop"
                },
                {
                    title: "New Disease Resistant Wheat Variety Launched",
                    link: "#",
                    snippet: "ICAR scientists have developed a new wheat variety resistant to yellow rust... [Mock Data]",
                    date: "Mock Date",
                    source: "ICAR",
                    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2889&auto=format&fit=crop"
                }
            ];
        }

        res.json({ success: true, articles });
    } catch (error) {
        console.error("News Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAgriculturalNews };
