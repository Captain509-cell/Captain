
import React from 'react';
import { SearchResult, SearchMode } from '../types';

interface ResultCardProps {
  result: SearchResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400">
            {result.type}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(result.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <h3 className="text-xl font-outfit font-semibold mb-3">{result.query}</h3>
        
        {result.type === SearchMode.GENERAL && result.content && (
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
             {result.content.split('\n').map((para, i) => para.trim() && <p key={i}>{para}</p>)}
          </div>
        )}

        {result.mediaUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-white/5 bg-black">
            {result.type === SearchMode.IMAGE ? (
              <img src={result.mediaUrl} alt={result.query} className="w-full object-cover" />
            ) : (
              <video src={result.mediaUrl} controls className="w-full" autoPlay loop muted />
            )}
          </div>
        )}

        {result.sources && result.sources.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Verification Sources</h4>
            <div className="flex flex-wrap gap-2">
              {result.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-blue-400 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
