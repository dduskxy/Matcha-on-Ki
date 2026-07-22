export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-stone">
      <h1 className="font-serif text-matcha">Security & Architecture</h1>
      <h2>Bring Your Own Key (BYOK)</h2>
      <p>This application implements a secure BYOK architecture. Your API keys (Gemini, Groq, OpenRouter) are saved directly in your browser's <code>localStorage</code>.</p>
      <h2>Data Privacy</h2>
      <p>We do not track your conversations. Chat history is saved locally using Zustand persist. You can clear your data at any time using the "Clear Chat" and "Delete Key" features.</p>
      <h2>Deployment</h2>
      <p>This site is statically generated and hosted on GitHub Pages, ensuring no backend servers are capturing your requests.</p>
    </div>
  );
}
