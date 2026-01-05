
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchMode, SearchResult, GenerationState } from './types';
import { performSearch, generateHyperRealisticImage, generateProVideo, checkAuth } from './services/geminiService';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(SearchMode.GENERAL);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<GenerationState>({ isGenerating: false, statusMessage: '' });
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth().then(auth => {
      setIsAuthenticated(auth);
    });
  }, []);

  const scrollToBottom = () => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [results, loading]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || loading.isGenerating) return;

    if (!isAuthenticated && (mode === SearchMode.IMAGE || mode === SearchMode.VIDEO)) {
      setNeedsAuth(true);
      return;
    }

    setLoading({ isGenerating: true, statusMessage: `Initiating ${mode} synthesis...` });
    const currentQuery = query;
    setQuery('');

    try {
      let newResult: SearchResult;

      if (mode === SearchMode.GENERAL) {
        const { text, sources } = await performSearch(currentQuery);
        newResult = {
          id: Date.now().toString(),
          type: SearchMode.GENERAL,
          query: currentQuery,
          content: text,
          sources,
          timestamp: Date.now()
        };
      } else if (mode === SearchMode.IMAGE) {
        setLoading(prev => ({ ...prev, statusMessage: "Rendering hyper-realistic image..." }));
        const imageUrl = await generateHyperRealisticImage(currentQuery);
        newResult = {
          id: Date.now().toString(),
          type: SearchMode.IMAGE,
          query: currentQuery,
          mediaUrl: imageUrl,
          timestamp: Date.now()
        };
      } else {
        const videoUrl = await generateProVideo(currentQuery, (msg) => {
          setLoading(prev => ({ ...prev, statusMessage: msg }));
        });
        newResult = {
          id: Date.now().toString(),
          type: SearchMode.VIDEO,
          query: currentQuery,
          mediaUrl: videoUrl,
          timestamp: Date.now()
        };
      }

      setResults(prev => [newResult, ...prev]);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message?.includes("Requested entity was not found") 
        ? "API Key invalid or expired. Please re-authenticate."
        : "Operation failed. Our neural core encountered an interference.";
      
      if (error.message?.includes("Requested entity was not found")) {
        setIsAuthenticated(false);
        setNeedsAuth(true);
      }
      
      alert(errorMessage);
    } finally {
      setLoading({ isGenerating: false, statusMessage: '' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-32">
      {needsAuth && <ApiKeyPrompt onSuccess={() => { setNeedsAuth(false); setIsAuthenticated(true); }} />}

      {/* Hero / Header */}
      <header className="pt-12 pb-8 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-outfit font-extrabold tracking-tight mb-4">
          Omni<span className="gradient-text">Source</span> AI
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
          Explore the world's knowledge and generate indistinguishable hyper-realistic media with the planet's most advanced AI engine.
        </p>
      </header>

      {/* Mode Selector */}
      <div className="flex justify-center gap-2 mb-8 px-4">
        {[
          { id: SearchMode.GENERAL, label: 'Search', icon: '🔍' },
          { id: SearchMode.IMAGE, label: 'Images', icon: '🖼️' },
          { id: SearchMode.VIDEO, label: 'Videos', icon: '🎬' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-medium ${
              mode === m.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 space-y-8">
        {results.length === 0 && !loading.isGenerating && (
          <div className="text-center py-24 space-y-4 opacity-40">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-2xl font-outfit">Ready to discover or create.</h2>
            <p>Try searching for "The history of sustainable architecture" or creating "A futuristic city in the Swiss Alps".</p>
          </div>
        )}

        {loading.isGenerating && (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-6 animate-pulse">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-outfit font-semibold">{loading.statusMessage}</h3>
              <p className="text-gray-500 text-sm">Our neural processing nodes are working at peak capacity...</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {results.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
        <div ref={resultsEndRef} />
      </main>

      {/* Bottom Floating Search Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent pointer-events-none">
        <form 
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto w-full pointer-events-auto"
        >
          <div className="glass-panel rounded-full p-2 flex items-center search-glow transition-all duration-300">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === SearchMode.GENERAL ? "Search for anything good in the world..." :
                mode === SearchMode.IMAGE ? "Describe a masterpiece you want to manifest..." :
                "Compose a cinematic prompt for professional video synthesis..."
              }
              className="bg-transparent border-none focus:ring-0 text-white flex-1 px-6 py-3 text-lg font-light outline-none"
              disabled={loading.isGenerating}
            />
            <button
              type="submit"
              disabled={!query.trim() || loading.isGenerating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full text-white shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
