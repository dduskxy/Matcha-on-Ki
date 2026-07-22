export const generateChatResponse = async (
  messages: {role: string, content: string}[], 
  systemPrompt: string,
  apiKey: string,
  provider: 'gemini' | 'openrouter' | 'groq',
  model: string,
  signal?: AbortSignal
) => {
  if (!apiKey) throw new Error('API Key missing for ' + provider);

  let url = '';
  let payload: any = {};
  let headers: any = { 'Content-Type': 'application/json' };

  if (provider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    headers['x-goog-api-key'] = apiKey;
    
    let geminiMessages = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    
    // Gemini API strictly requires the conversation history to start with a 'user' message.
    if (geminiMessages.length > 0 && geminiMessages[0].role === 'model') {
      geminiMessages.unshift({ role: 'user', parts: [{ text: 'Start conversation' }] });
    }

    payload = {
      contents: geminiMessages,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };
  } else if (provider === 'groq') {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    payload = { model: model, messages: [{ role: 'system', content: systemPrompt }, ...messages] };
  } else if (provider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    payload = { model: model, messages: [{ role: 'system', content: systemPrompt }, ...messages] };
  }

  const res = await fetch(url, { 
    method: 'POST', 
    headers, 
    body: JSON.stringify(payload),
    signal
  });
  if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  
  const data = await res.json();
  if (provider === 'gemini') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    return data.choices?.[0]?.message?.content || '';
  }
};
