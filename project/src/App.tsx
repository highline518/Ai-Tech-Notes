import { useState } from 'react';
import { Clipboard, ClipboardCheck, Loader2, Wrench, Car, Settings } from 'lucide-react';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const rewriteNotes = async () => {
    if (!input.trim()) {
      setError('Please enter some technician notes first.');
      return;
    }

    if (cooldown) {
      setError('Please wait a moment before submitting another request.');
      return;
    }

    setIsLoading(true);
    setError('');
    setCopied(false);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Technician Notes AI Rewriter',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-opus-20240229',
          messages: [
            {
              role: 'system',
              content: `You are a professional automotive technical writer specializing in improving technician work order notes. Your task is to rewrite the notes with ABSOLUTELY NO CHANGES to the actual content or meaning.

CRITICAL RULES (STRICTLY ENFORCED):

1. MAINTAIN CHRONOLOGICAL ORDER of all operations exactly as written
- Keep diagnostic steps in their original sequence
- Keep repairs listed in order performed
- DO NOT reorder, merge, or split any events or findings

2. DO NOT ADD, REMOVE, OR MODIFY ANY services, actions, or observations
- NO additions or assumptions (only rewrite what's explicitly written)
- NO new diagnostic steps, tests, or checks unless explicitly stated
- NO new recommendations unless mentioned in the original notes

3. ONLY FIX:
- Grammar
- Spelling
- Punctuation
- Formatting/Structure

4. STRICTLY FOLLOW THIS OUTPUT FORMAT:

DIAGNOSTIC FINDINGS: (List diagnostic steps and findings in the original order)
REPAIRS PERFORMED: (List repairs in exact order performed)
NOTES: (List only observations explicitly stated)
RECOMMENDATIONS: (Only include if present in original notes)

EXAMPLE:

Original Technician Notes:
"check engine light on. scan shows p0456 evap leak. smoke test found bad gas cap. replaced cap. cleared codes."

Correct Rewritten Version:

DIAGNOSTIC FINDINGS:
- Check engine light on
- Scan revealed code P0456 (EVAP leak)
- Smoke test identified faulty gas cap

REPAIRS PERFORMED:
- Replaced gas cap
- Cleared fault codes

REMEMBER:
- PRESERVE the exact chronological sequence of events
- DO NOT infer, assume, or modify ANY details
- Your ONLY job is to make the notes more readable while preserving EXACTLY what was written—nothing more, nothing less.`
            },
            {
              role: 'user',
              content: input
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process notes. Please try again.');
      }

      const data = await response.json();
      setOutput(data.choices[0].message.content);
      
      setCooldown(true);
      setTimeout(() => setCooldown(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const clearForm = () => {
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Car className="w-8 h-8 text-blue-400" />
            <Settings className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-red-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Highline Motorsports Group
          </h1>
          <h2 className="text-2xl font-semibold text-gray-400 mb-6">
            QuickServ Auto Care
          </h2>
          <div className="flex items-center justify-center gap-2 text-xl text-gray-300">
            <Wrench className="w-6 h-6 text-blue-400" />
            <span>Technician Notes AI Rewriter</span>
          </div>
        </header>

        <main className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your technician notes here..."
              className="w-full h-48 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={rewriteNotes}
              disabled={isLoading || cooldown}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'Rewrite Notes'
              )}
            </button>
            <button
              onClick={clearForm}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              Clear Form
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {output && (
            <div className="space-y-4">
              <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-48 p-4 rounded-lg bg-gray-800 border border-gray-700 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute top-8 right-8 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition shadow-md"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <ClipboardCheck className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clipboard className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p className="font-medium">Highline Motorsports Group / QuickServ Auto Care</p>
          <p className="mt-2">All data is processed in real-time and not stored</p>
        </footer>
      </div>
    </div>
  );
}

export default App;