const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Ensure API Key exists
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error: GEMINI_API_KEY missing' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { symbol, price, change24h, liquidity, volume } = JSON.parse(event.body);

    // Input Sanitization to prevent prompt injection
    const safeSymbol = String(symbol).replace(/[^a-zA-Z0-9]/g, '');
    const safePrice = String(price).replace(/[^0-9.]/g, '');
    const safeChange = String(change24h).replace(/[^0-9.\-]/g, '');
    const safeLiquidity = String(liquidity).replace(/[^0-9.]/g, '');
    const safeVolume = String(volume).replace(/[^0-9.]/g, '');

    // Prompt engineering for Gemini
    const prompt = `You are a professional crypto market analyst using a persona like a seasoned DeFi trader. Analyze this token on Canonix:\n\nToken: ${safeSymbol}\nPrice: ${safePrice} PAXI\n24h Change: ${safeChange}%\nLiquidity: ${safeLiquidity} PAXI\nVolume 24h: ${safeVolume} PAXI\n\nProvide a short, punchy market analysis (max 100 words). Include:\n1. Sentiment (Bullish/Bearish/Neutral)\n2. Technical Outlook\n3. Risk Assessment (Low/Med/High)\n\nKeep it formatted with HTML tags like <b> for emphasis. Do not include markdown blocks, just the inner HTML content.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini');
    }

    const textResult = data.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis: textResult })
    };

  } catch (error) {
    console.error('AI Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate analysis' }) };
  }
};
