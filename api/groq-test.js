import { Groq } from 'groq-sdk';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if Groq API key is configured
  if (!process.env.VITE_GROQ_API_KEY) {
    return res.status(500).json({ 
      error: 'Groq API key not configured',
      message: 'VITE_GROQ_API_KEY environment variable is required'
    });
  }

  const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });
  
  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "user", content: "Hello from Vercel!" }
      ]
    });
    
    res.status(200).json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to communicate with Groq API'
    });
  }
}