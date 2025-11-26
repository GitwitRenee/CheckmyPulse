import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  PenLine, 
  RefreshCw, 
  Share2, 
  Moon, 
  Sun, 
  ArrowRight, 
  Quote 
} from 'lucide-react';
import { analyzeJournalEntry, generateEssenceImage } from './services/geminiService';
import { AnalysisResult, JournalState, Theme } from './types';
import { Button } from './components/Button';

// Prompts to get the user started
const PROMPTS = [
  "What is weighing on your heart today?",
  "Describe a moment of silence you found recently.",
  "If your current mood was a landscape, what would it look like?",
  "What are you holding onto that you should let go?",
  "Write about a color that resonates with you right now.",
];

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.Dark);
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[0]);
  const [state, setState] = useState<JournalState>({
    step: 'intro',
    entry: '',
    analysis: null,
    generatedImageBase64: null,
    error: null,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Set initial theme based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme(Theme.Light);
    }
  }, []);

  useEffect(() => {
    if (theme === Theme.Dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.Dark ? Theme.Light : Theme.Dark);
  };

  const handleStart = () => {
    setState(prev => ({ ...prev, step: 'writing' }));
    // Focus textarea after transition
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleProcess = async () => {
    if (!state.entry.trim()) return;

    setState(prev => ({ ...prev, step: 'processing', error: null }));

    try {
      // 1. Analyze text
      const analysis = await analyzeJournalEntry(state.entry);
      setState(prev => ({ ...prev, analysis }));

      // 2. Generate Image based on the prompt from analysis
      // We pass the prompt + the sentiment to guide the style
      const imageBase64 = await generateEssenceImage(analysis.imagePrompt);
      
      setState(prev => ({ 
        ...prev, 
        generatedImageBase64: imageBase64,
        step: 'result'
      }));

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        step: 'writing', 
        error: err.message || "Something went wrong in the ether."
      }));
    }
  };

  const handleReset = () => {
    setState({
      step: 'writing',
      entry: '',
      analysis: null,
      generatedImageBase64: null,
      error: null
    });
    setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  };

  // --- Render Functions ---

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in px-6">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-teal blur-3xl opacity-20 animate-blob rounded-full" />
        <Sparkles className="w-16 h-16 text-gold relative z-10" />
      </div>
      <h1 className="text-5xl md:text-7xl font-serif font-bold text-mahogany dark:text-white mb-6 tracking-tight">
        Essence
      </h1>
      <p className="text-xl text-stone-600 dark:text-stone-300 max-w-lg mb-12 leading-relaxed font-light">
        Transform your thoughts into art. Journal your inner world, and let AI visualize the essence of your emotions.
      </p>
      <Button onClick={handleStart} className="text-lg px-10 py-4" icon={<ArrowRight className="w-5 h-5" />}>
        Begin Journey
      </Button>
    </div>
  );

  const renderWriting = () => (
    <div className="w-full max-w-3xl mx-auto animate-fade-in pt-10 px-4 pb-20">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-widest text-teal mb-2">Prompt</h2>
          <p className="text-xl md:text-2xl font-serif text-mahogany dark:text-stone-200">
            {currentPrompt}
          </p>
        </div>
        <button 
          onClick={() => setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}
          className="p-2 text-stone-400 hover:text-ember transition-colors"
          title="New Prompt"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-ember to-gold rounded-2xl opacity-20 group-focus-within:opacity-50 transition-opacity duration-500 blur"></div>
        <textarea
          ref={textareaRef}
          value={state.entry}
          onChange={(e) => setState(prev => ({ ...prev, entry: e.target.value }))}
          className="relative w-full h-[50vh] p-8 bg-white dark:bg-[#15232d] rounded-xl shadow-2xl resize-none outline-none text-lg md:text-xl text-mahogany dark:text-stone-300 leading-relaxed font-serif placeholder:text-stone-300 dark:placeholder:text-stone-700 border border-stone-200 dark:border-storm focus:border-ember/30 transition-colors"
          placeholder="Start typing your thoughts here..."
        />
      </div>

      {state.error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-ember dark:text-red-400 rounded-lg text-sm border border-ember/20">
          {state.error}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleProcess} 
          disabled={state.entry.length < 10}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Distill Essence
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center px-6">
      <div className="relative mb-12">
        <div className="w-24 h-24 border-4 border-teal/20 rounded-full animate-ping absolute inset-0"></div>
        <div className="w-24 h-24 border-4 border-t-ember border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <Sparkles className="w-8 h-8 text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h3 className="text-2xl font-serif text-mahogany dark:text-white mb-3">Distilling your essence...</h3>
      <p className="text-stone-500 dark:text-stone-400 max-w-md">
        Analyzing sentiments, weaving visual metaphors, and creating your unique artwork.
      </p>
    </div>
  );

  const renderResult = () => {
    if (!state.analysis || !state.generatedImageBase64) return null;

    const { sentiment, insight, colors } = state.analysis;

    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative group order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-tr from-ember/30 to-gold/30 blur-2xl rounded-[3rem] opacity-70"></div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-storm">
               <img 
                 src={`data:image/jpeg;base64,${state.generatedImageBase64}`} 
                 alt="Essence Visualization" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <p className="text-white text-sm font-light italic">
                   Prompt: {state.analysis.imagePrompt}
                 </p>
               </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="flex flex-col space-y-8 order-1 lg:order-2">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 rounded-full text-sm uppercase tracking-widest font-medium border border-stone-200 dark:border-storm text-stone-500 dark:text-stone-400">
                {new Date().toLocaleDateString()}
              </span>
              <div className="h-px bg-stone-200 dark:bg-storm flex-grow"></div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-teal">
                Sentiment Detected
              </h2>
              <p className="text-5xl md:text-6xl font-serif text-mahogany dark:text-white capitalize">
                {sentiment}
              </p>
            </div>

            <div className="relative p-8 rounded-2xl bg-white/50 dark:bg-storm/50 backdrop-blur-sm border border-stone-200 dark:border-teal/20">
              <Quote className="w-8 h-8 text-gold/50 absolute top-6 left-6 -scale-x-100" />
              <p className="text-2xl md:text-3xl font-serif text-mahogany dark:text-stone-100 italic leading-normal text-center pt-4">
                "{insight}"
              </p>
              <div className="flex justify-center gap-2 mt-6">
                 {colors.map((c, i) => (
                   <div key={i} className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white/10" style={{ backgroundColor: c }}></div>
                 ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleReset} variant="secondary" icon={<PenLine className="w-4 h-4" />}>
                Journal Again
              </Button>
              {/* Note: Real sharing functionality would typically use Web Share API or canvas generation */}
              <Button 
                onClick={() => alert("Insight copied to clipboard!")} 
                variant="ghost" 
                icon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-stone-50 dark:bg-storm font-sans selection:bg-ember selection:text-white flex flex-col`}>
      {/* Header */}
      <header className="flex justify-between items-center p-6 md:px-10 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setState({ step: 'intro', entry: '', analysis: null, generatedImageBase64: null, error: null })}
        >
          <div className="w-8 h-8 bg-ember rounded-lg flex items-center justify-center text-white shadow-lg shadow-ember/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-serif font-semibold text-lg text-mahogany dark:text-white">Essence</span>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full hover:bg-stone-200 dark:hover:bg-storm/50 transition-colors text-mahogany dark:text-stone-300"
          aria-label="Toggle Theme"
        >
          {theme === Theme.Dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center relative w-full max-w-[1920px] mx-auto">
        {state.step === 'intro' && renderIntro()}
        {state.step === 'writing' && renderWriting()}
        {state.step === 'processing' && renderProcessing()}
        {state.step === 'result' && renderResult()}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-stone-400 dark:text-stone-600 text-xs">
        <p>Powered by Gemini 2.5 Flash & Imagen 3.0</p>
      </footer>
    </div>
  );
};

export default App;