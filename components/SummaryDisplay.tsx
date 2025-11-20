
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ClipboardIcon, CheckIcon, EditIcon, UndoIcon, RedoIcon, ClockIcon, UsersIcon, CloseIcon, ChevronDownIcon } from './icons';

interface SummaryDisplayProps {
  summary: string | null;
  transcript: string | null;
}

interface TranscriptLine {
  timestamp: string | null;
  speaker: string | null;
  text: string;
}

const useHistoryState = (initialState: string) => {
    const [history, setHistory] = useState([initialState]);
    const [index, setIndex] = useState(0);

    const state = useMemo(() => history[index], [history, index]);

    const setState = (newState: string, overwrite = false) => {
        if (newState === state) return;
        if (overwrite) {
            const newHistory = [...history];
            newHistory[index] = newState;
            setHistory(newHistory);
        } else {
            const newHistory = history.slice(0, index + 1);
            newHistory.push(newState);
            setHistory(newHistory);
            setIndex(newHistory.length - 1);
        }
    };
    
    const undo = () => index > 0 && setIndex(index - 1);
    const redo = () => index < history.length - 1 && setIndex(index + 1);
    
    const canUndo = index > 0;
    const canRedo = index < history.length - 1;

    return { state, setState, undo, redo, canUndo, canRedo };
};

// A simple button component for the transcript toolbar
const ToolbarButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean; isActive?: boolean }> = ({ icon, label, onClick, disabled, isActive }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isActive ? 'text-blue-600' : ''}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const parseTranscript = (transcriptText: string | null): TranscriptLine[] => {
    if (!transcriptText) return [];
    return transcriptText
      .trim()
      .split('\n')
      .map(line => {
        const match = line.match(/^(\d{2}:\d{2})\s*-\s*(?:\[(.*?)\]\s*)?(.*)$/);
        if (match) {
          return { timestamp: match[1], speaker: match[2]?.trim() || null, text: match[3] };
        }
        return { timestamp: null, speaker: null, text: line };
      })
      .filter(item => item.text.trim() !== '');
};

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, transcript }) => {
  const [copied, setCopied] = useState(false);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showSpeakers, setShowSpeakers] = useState(true);
  const [isDownloadMenuOpen, setDownloadMenuOpen] = useState(false);
  
  const { state: editedTranscript, setState: setEditedTranscript, undo, redo, canUndo, canRedo } = useHistoryState(transcript || '');
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
            setDownloadMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parsedTranscript = useMemo(() => parseTranscript(editedTranscript), [editedTranscript]);

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
    }
  };

  const handleDownload = (format: 'txt' | 'json') => {
    let content = '';
    let filename = '';
    if (format === 'txt') {
        content = editedTranscript;
        filename = 'transcript.txt';
    } else {
        content = JSON.stringify(parsedTranscript, null, 2);
        filename = 'transcript.json';
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadMenuOpen(false);
  };
  
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true,
    });
  }, []);

  const formatSummary = (text: string) => {
    return text
      .split('\n').filter(line => line.trim() !== '')
      .map(line => {
        if (line.startsWith('###')) return `<h3 class="text-xl font-bold mt-4 mb-2 text-slate-800">${line.replace(/###\s*/, '')}</h3>`;
        if (line.startsWith('##')) return `<h2 class="text-2xl font-bold mt-4 mb-2 text-slate-800">${line.replace(/##\s*/, '')}</h2>`;
        if (line.startsWith('#')) return `<h1 class="text-3xl font-bold mt-4 mb-2 text-slate-800">${line.replace(/#\s*/, '')}</h1>`;
        if (line.startsWith('* ')) return `<li class="ml-6 mb-1">${line.replace(/\*\s*/, '')}</li>`;
        return `<p class="mb-2">${line}</p>`;
      }).join('').replace(/<li>/g, '<ul class="list-disc pl-5"><li>').replace(/<\/li>(?!<li>)/g, '</li></ul>');
  };
  
  if (!summary) return null;
  
  return (
    <div className="mt-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Summary</h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-300"
          >
            {copied ? <><CheckIcon className="w-4 h-4 text-green-500" /><span>Copied!</span></> : <><ClipboardIcon className="w-4 h-4" /><span>Copy</span></>}
          </button>
        </div>
        <div className="prose prose-p:text-slate-600 prose-li:text-slate-600 max-w-none" dangerouslySetInnerHTML={{ __html: formatSummary(summary) }}/>
      </div>

      {transcript && isTranscriptVisible && (
        <div className="mt-6 bg-white rounded-2xl shadow-xl border border-slate-200 relative animate-fade-in">
            <button onClick={() => setIsTranscriptVisible(false)} className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" aria-label="Close transcript">
                <CloseIcon className="w-5 h-5" />
            </button>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-x-6 text-slate-500">
                    <ToolbarButton icon={<EditIcon className="w-4 h-4" />} label={isEditing ? "Save" : "Edit"} onClick={() => setIsEditing(!isEditing)} />
                    <ToolbarButton icon={<UndoIcon className="w-4 h-4" />} label="Undo" onClick={undo} disabled={!canUndo || !isEditing} />
                    <ToolbarButton icon={<RedoIcon className="w-4 h-4" />} label="Redo" onClick={redo} disabled={!canRedo || !isEditing} />
                    <ToolbarButton icon={<ClockIcon className="w-4 h-4" />} label="Timestamps" onClick={() => setShowTimestamps(!showTimestamps)} isActive={showTimestamps} />
                    <ToolbarButton icon={<UsersIcon className="w-4 h-4" />} label="Speakers" onClick={() => setShowSpeakers(!showSpeakers)} isActive={showSpeakers}/>
                </div>
                <div className="relative" ref={downloadMenuRef}>
                    <button onClick={() => setDownloadMenuOpen(!isDownloadMenuOpen)} className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
                        Download <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    {isDownloadMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-slate-200 z-10">
                           <a onClick={() => handleDownload('txt')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer">as .txt</a>
                           <a onClick={() => handleDownload('json')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer">as .json</a>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
                <p className="text-sm text-slate-500 mb-6">{currentDate}</p>
                {isEditing ? (
                    <textarea 
                        value={editedTranscript}
                        onChange={(e) => setEditedTranscript(e.target.value)}
                        className="w-full h-96 p-2 font-mono text-sm bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        aria-label="Transcript editor"
                    />
                ) : (
                  <div className="space-y-4 text-slate-800">
                      {parsedTranscript.map((line, index) => (
                          <div key={index} className="grid grid-cols-[auto,auto,1fr] gap-x-4 items-start">
                              {showTimestamps && line.timestamp && <p className="text-sm font-mono text-slate-500 pt-px">{line.timestamp}</p>}
                              {showSpeakers && line.speaker && <p className="font-semibold text-slate-700 col-start-2 whitespace-nowrap">{line.speaker}:</p>}
                              <p className={`leading-relaxed ${!showSpeakers || !line.speaker ? 'col-start-2' : 'col-start-3'}`}>{line.text}</p>
                          </div>
                      ))}
                  </div>
                )}
            </div>
        </div>
      )}

      {transcript && !isTranscriptVisible && (
        <div className="mt-6 text-center">
            <button onClick={() => setIsTranscriptVisible(true)} className="font-medium text-blue-600 hover:text-blue-700">
                View Full Transcript
            </button>
        </div>
      )}
    </div>
  );
};
