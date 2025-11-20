import React, { useState, useCallback } from 'react';
import { getTranscript, extractVideoId } from './services/youtubeService';
import { summarizeTranscript } from './services/geminiService';
import { DownloadIcon, SparklesIcon, AlertTriangleIcon } from './components/icons';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SummaryDisplay } from './components/SummaryDisplay';

const App: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [summary, setSummary] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = useCallback(async () => {
    setError(null);

    if (!youtubeUrl) {
      setError('Please enter a YouTube URL.');
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Please check the format.');
      return;
    }

    setIsLoading(true);
    setSummary(null);
    setTranscript(null);

    try {
      const fetchedTranscript = await getTranscript(videoId);
      setTranscript(fetchedTranscript);

      const generatedSummary = await summarizeTranscript(fetchedTranscript);
      setSummary(generatedSummary);
    } catch (err) {
      console.error(err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [youtubeUrl]);

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
            YouTube Transcript Summarizer
          </h1>
          <p className="text-slate-600 text-lg mt-3 max-w-xl mx-auto">
            Effortlessly summarize YouTube videos. Just paste a link below to get a concise, AI-generated summary in seconds.
          </p>
        </header>

        <main>
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <DownloadIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="w-full">
                    <h2 className="text-xl font-semibold text-slate-800">Summarize from a URL</h2>
                    <p className="text-slate-500 mt-1">
                        Paste a YouTube video link to begin.
                    </p>
                </div>
            </div>
            
            <div className="mt-6">
                <label htmlFor="youtube-url" className="sr-only">YouTube URL</label>
                <input
                    id="youtube-url"
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-slate-50 text-slate-800 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300 placeholder-slate-400"
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleSummarize()}
                />
            </div>

            <div className="mt-6">
              <button
                onClick={handleSummarize}
                disabled={isLoading || !youtubeUrl}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Get Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg flex items-center gap-3 animate-fade-in">
              <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {summary && !isLoading && (
            <SummaryDisplay summary={summary} transcript={transcript} />
          )}

        </main>
      </div>
      <footer className="text-center mt-12 text-slate-500">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;