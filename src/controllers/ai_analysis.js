const fetch = require('node-fetch');
const { secureLogger } = require('../utils/common');

const aiAnalysisHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const apiKeys = [];
  let keyIndex = 1;

  if (process.env.GEMINI_API_KEY) {
      apiKeys.push(process.env.GEMINI_API_KEY);
  }

  while (process.env[`GEMINI_API_KEY_${keyIndex}`]) {
    apiKeys.push(process.env[`GEMINI_API_KEY_${keyIndex}`]);
    keyIndex++;
  }

  if (apiKeys.length === 0) {
    return res.status(500).json({ error: 'Server configuration error: No Gemini API keys found' });
  }

  try {
    const { symbol, price, change24h, liquidity, volume, onChainActivity } = req.body;

    const safeSymbol = String(symbol || 'Unknown').replace(/[^a-zA-Z0-9]/g, '');
    const safePrice = String(price || '0').replace(/[^0-9.]/g, '');
    const safeChange = String(change24h || '0').replace(/[^0-9.\-]/g, '');
    const safeLiquidity = String(liquidity || '0').replace(/[^0-9.]/g, '');
    const safeVolume = String(volume || '0').replace(/[^0-9.]/g, '');
    const safeActivity = String(onChainActivity || 'N/A').substring(0, 100);

    const prompt = `You are a professional MEME coin analyst. Analyze this token strictly using real-time data:

Token: ${safeSymbol}
Price: ${safePrice} PAXI
24h Change: ${safeChange}%
Liquidity: ${safeLiquidity} PAXI
Volume 24h: ${safeVolume} PAXI
On-chain Activity: ${safeActivity}

Prioritize current price, volume, market trend, and liquidity in your analysis.
Provide a structured output with:
- Market Sentiment (BULLISH / BEARISH / NEUTRAL)
- Short Summary (Max 60 words)
- Risk Level (LOW / MEDIUM / HIGH / EXTREME)
- Key Indicators (Top 2 signals)

Format with <b> for emphasis. Use a punchy, trader-like tone. Return ONLY inner HTML content.`;

    let lastError = null;
    for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        try {
            secureLogger.log(`[AI] Attempting analysis with Key #${i + 1}`);

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (response.status === 429) {
                secureLogger.warn(`[AI] Key #${i + 1} hit quota limit. Rotating...`);
                continue;
            }

            if (!response.ok) {
                throw new Error(data.error?.message || `Gemini API error: ${response.status}`);
            }

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response structure from Gemini');
            }

            const textResult = data.candidates[0].content.parts[0].text;

            return res.json({
                analysis: textResult,
                keyUsed: i + 1
            });

        } catch (error) {
            secureLogger.error(`[AI] Key #${i + 1} failed:`, error.message);
            lastError = error;
        }
    }

    throw new Error(`All available Gemini API keys failed. Last error: ${lastError?.message}`);

  } catch (error) {
    secureLogger.error('AI Rotation Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate analysis' });
  }
};

module.exports = aiAnalysisHandler;
