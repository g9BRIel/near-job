const OpenAI = require('openai');

// Initialize the OpenAI client
// Note: This defaults to OpenAI, but can easily be directed to DeepSeek or Groq 
// by adding a baseURL like: baseURL: 'https://api.deepseek.com/v1'
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'sk-your-api-key-here',
  baseURL: 'https://api.deepseek.com',
});

exports.chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Valid messages array is required' });
    }

    // Format the messages for the OpenAI API format
    // Map your custom format { sender: 'user' | 'ai', text: '...' } -> { role: 'user' | 'assistant', content: '...' }
    const formattedMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const Worker = require('../models/Worker');
    const Job = require('../models/Job');
    const { fn, col } = require('sequelize');

    // Fetch some context if user is logged in
    let contextInfo = "";
    try {
      const { id, userType } = req.user || {};
      if (id) {
        const user = userType === 'worker' ? await Worker.findByPk(id) : null;
        if (user) contextInfo += `Current User Profile: ${JSON.stringify({ name: user.fullName, skills: user.skills, location: user.location })}\n`;
      }
      
      const cityStats = await Job.findAll({
        attributes: [[fn('COUNT', col('id')), 'count'], 'location'],
        group: ['location'],
        limit: 5,
        raw: true
      });
      contextInfo += `Platform Job Stats by City: ${JSON.stringify(cityStats)}\n`;
    } catch (e) {
      console.error('AI Context Error:', e);
    }

    // Inject a system prompt to give the AI context about NearJob
    formattedMessages.unshift({
      role: 'system',
      content: `You are the NearJob AI Assistant. You help users navigate the job market. 
      CONTEXT: ${contextInfo}
      CAPABILITIES:
      1. CV Assistance: Help workers write, structure, or improve their resumes.
      2. City Analysis: Based on the provided platform stats, advise workers on which nearby cities have the most opportunities.
      3. Business Advice: Help companies with job descriptions or hiring strategies.
      INSTRUCTIONS: Be friendly, data-driven based on the context provided, and concise. Never say you are a scripted bot; you are an AI that analyzes this platform.`
    });

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: formattedMessages,
      max_tokens: 250,
      temperature: 0.7,
    });

    const aiResponseText = completion.choices[0].message.content;

    res.json({ text: aiResponseText });

  } catch (error) {
    console.error('AI Error:', error);

    // GRACEFUL FALLBACK: If the API fails because of Insufficient Balance or invalid key,
    // we intercept the error and provide a simulated response so the platform doesn't break!
    const fallbackMessage = Array.isArray(req.body.messages) && req.body.messages.length > 0 
      ? req.body.messages[req.body.messages.length - 1].text.toLowerCase() 
      : "";

    let simulatedText = "I'm here to help you get the most out of NearJob! Let me know if you need help finding work or hiring nearby talent.";
    
    if (fallbackMessage.includes("job") || fallbackMessage.includes("work")) {
      simulatedText = "It looks like you're searching for work! NearJob connects you with top local companies. Head over to the 'Nearby Jobs' map to see open positions right now!";
    } else if (fallbackMessage.includes("cv") || fallbackMessage.includes("resume") || fallbackMessage.includes("profile")) {
      simulatedText = "I'd love to help you review your CV! As a pro-tip, make sure your Skills list and Bio are fully up to date on your Profile page so companies can easily find you.";
    } else if (fallbackMessage.includes("company") || fallbackMessage.includes("hire")) {
      simulatedText = "Looking to hire? You're in the right place! NearJob allows you to post listings and instantly search through skilled local applicants in your area.";
    }

    res.json({ text: simulatedText });
  }
};
