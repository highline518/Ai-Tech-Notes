import { useState } from 'react';
import { Clipboard, ClipboardCheck, Loader2, Wrench, CheckCircle, AlertCircle, FileText } from 'lucide-react';

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
          model: 'openai/gpt-4-turbo',
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Simplified Header with description */}
        <header className="mb-12 relative">
          <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-3xl -z-10"></div>
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-900/90 to-slate-800/80 rounded-2xl p-8 border border-slate-700/50 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3 text-xl text-gray-300 bg-slate-800/50 py-3 px-6 rounded-full w-fit mx-auto border border-slate-700/50 mb-6">
              <Wrench className="w-6 h-6 text-blue-400" />
              <span className="font-medium">Technician Notes AI Rewriter</span>
              <span className="bg-gradient-to-r from-blue-500 to-red-500 text-white text-sm font-bold py-1 px-2 rounded-md ml-1">V2</span>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-slate-300 leading-relaxed">
                This tool transforms messy, unformatted technician notes into professionally structured documentation. 
                Simply paste your original notes in the input field below and click "Rewrite Notes." 
                The AI will improve grammar, spelling, and formatting while preserving all technical details and chronological order.
                Perfect for service reports, work orders, and customer-facing documentation.
              </p>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {/* Input Section with enhanced styling */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 rounded-xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-slate-300">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium">Original Technician Notes</h3>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your technician notes here..."
              className="w-full h-48 p-4 rounded-lg bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-200 placeholder:text-slate-500"
              disabled={isLoading}
            />
          </div>

          {/* Controls with enhanced styling */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={rewriteNotes}
              disabled={isLoading || cooldown}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Rewrite Notes</span>
                </>
              )}
            </button>
            <button
              onClick={clearForm}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg border border-slate-600/30 text-white font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Clear Form</span>
            </button>
          </div>

          {/* Error message with enhanced styling */}
          {error && (
            <div className="p-5 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-700/50 rounded-lg text-red-200 shadow-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Output Section with enhanced styling */}
          {output && (
            <div className="space-y-4">
              <div className="relative bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 rounded-xl border border-slate-700/50 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="font-medium">Rewritten Notes</h3>
                </div>
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-56 p-4 rounded-lg bg-slate-800/80 border border-slate-700 outline-none text-slate-200"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute top-12 right-8 p-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition shadow-md border border-slate-600/30 group"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <ClipboardCheck className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clipboard className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Simplified Footer */}
        <footer className="mt-16 text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-5 rounded-xl border border-slate-700/50 shadow-lg">
            <p className="mt-2 text-slate-400 text-sm">All data is processed in real-time and not stored</p>
            <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
              Powered by GPT-4 Turbo
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;