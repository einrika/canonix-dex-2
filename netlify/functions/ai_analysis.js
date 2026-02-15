const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 1. Get all available Gemini API Keys from environment
  const apiKeys = [];
  let keyIndex = 1;
  
  // Also check for the single GEMINI_API_KEY as primary/fallback
  if (process.env.GEMINI_API_KEY) {
      apiKeys.push(process.env.GEMINI_API_KEY);
  }

  while (process.env[`GEMINI_API_KEY_${keyIndex}`]) {
    apiKeys.push(process.env[`GEMINI_API_KEY_${keyIndex}`]);
    keyIndex++;
  }

  if (apiKeys.length === 0) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: No Gemini API keys found' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { symbol, price, change24h, liquidity, volume, onChainActivity } = body;

    // 2. Input Sanitization
    const safeSymbol = String(symbol || 'Unknown').replace(/[^a-zA-Z0-9]/g, '');
    const safePrice = String(price || '0').replace(/[^0-9.]/g, '');
    const safeChange = String(change24h || '0').replace(/[^0-9.\-]/g, '');
    const safeLiquidity = String(liquidity || '0').replace(/[^0-9.]/g, '');
    const safeVolume = String(volume || '0').replace(/[^0-9.]/g, '');
    const safeActivity = String(onChainActivity || 'N/A').substring(0, 100);

    // 3. Prompt engineering (Optimized for MEME market and Real-time data)
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

    // 4. Try API Keys with rotation and retry
    let lastError = null;
    for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        try {
            console.log(`[AI] Attempting analysis with Key #${i + 1}`);

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            // Handle quota limits (429) or other API errors
            if (response.status === 429) {
                console.warn(`[AI] Key #${i + 1} hit quota limit. Rotating...`);
                continue;
            }

            if (!response.ok) {
                throw new Error(data.error?.message || `Gemini API error: ${response.status}`);
            }

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response structure from Gemini');
            }

            const textResult = data.candidates[0].content.parts[0].text;

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis: textResult,
                    keyUsed: i + 1
                })
            };

        } catch (error) {
            console.error(`[AI] Key #${i + 1} failed:`, error.message);
            lastError = error;
            // Continue to next key
        }
    }

    // If all keys failed
    throw new Error(`All available Gemini API keys failed. Last error: ${lastError?.message}`);

  } catch (error) {
    console.error('AI Rotation Error:', error);
    return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message || 'Failed to generate analysis' })
    };
  }
};
