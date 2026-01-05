
import React from 'react';
import { requestAuth } from '../services/geminiService';

interface ApiKeyPromptProps {
  onSuccess: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSuccess }) => {
  const handleSelect = async () => {
    await requestAuth();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-outfit font-bold">Premium Access Required</h2>
        <p className="text-gray-400">
          To generate hyper-realistic images and cinematic videos, you must connect a premium Gemini API key.
        </p>
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-200">
          Please select a key from a project with <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline font-bold">billing enabled</a>.
        </div>
        <button
          onClick={handleSelect}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:opacity-90 transition-all transform active:scale-95"
        >
          Connect API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
