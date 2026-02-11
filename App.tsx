
import React, { useState, useEffect } from 'react';
import { Product, GenerationResult } from './types';
import { generateProductImage, urlToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://opensheet.elk.sh/1RLmHNEjVKPf00yhRFOncd4mEfIUJ4twIbY047osTAOQ/Sheet1');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        // Automatically select the first product found in the API
        if (data && data.length > 0) {
          setProduct(data[0]);
        } else {
          throw new Error('No products found in the sheet');
        }
      } catch (err) {
        setError('Could not load product data. Please check the API connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, []);

  const handleGenerate = async () => {
    if (!product) return;

    try {
      setIsGenerating(true);
      setError(null);
      
      const { data, mimeType } = await urlToBase64(product.image_link);
      
      const generatedUrl = await generateProductImage(
        data, 
        mimeType, 
        product.title, 
        prompt
      );
      
      if (generatedUrl) {
        setResult({
          imageUrl: generatedUrl,
          prompt,
          timestamp: Date.now()
        });
      } else {
        throw new Error("API returned no image response.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-400 font-bold tracking-widest text-sm animate-pulse">SYNCHRONIZING WITH OKTAVIA CLOUD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 tracking-tighter">
            OKTAVIA STUDIO
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">AI-Powered Product Synthesis</p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2 glass rounded-2xl flex items-center gap-3 border-blue-500/20 shadow-2xl shadow-blue-500/10">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-xs font-black tracking-widest text-blue-100">GEMINI 2.5 FLASH IMAGE</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-8">
        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 text-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-black font-bold text-lg">!</div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="glass rounded-[3rem] p-10 flex flex-col h-full border-white/10 relative overflow-hidden group">
          {/* Background Gradient Accents */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-purple-600/20 transition-colors duration-1000"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-600/20 transition-colors duration-1000"></div>
          
          {!product ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <h3 className="text-2xl font-bold text-white mb-2">No product found in catalog.</h3>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
                {/* Product Source */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-black">Input Reference</span>
                  </div>
                  <div className="flex-1 relative glass rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-3xl flex items-center justify-center p-16 border-white/40 shadow-2xl">
                    <div className="absolute top-8 left-8 z-10">
                      <h4 className="text-2xl font-black text-slate-950 leading-tight">
                        {product.title}
                      </h4>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{product.color} Edition</span>
                    </div>
                    <img 
                      src={product.image_link} 
                      alt={product.title}
                      className="max-w-full max-h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] hover:scale-105 transition-transform duration-1000"
                    />
                  </div>
                </div>

                {/* AI Result */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-black">AI Transformation</span>
                  </div>
                  <div className="flex-1 relative glass rounded-[2.5rem] overflow-hidden flex items-center justify-center bg-black/40 border-white/5 shadow-inner">
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-8 p-12 text-center">
                        <div className="relative">
                          <div className="w-24 h-24 border-2 border-indigo-500/10 border-t-indigo-400 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-24 h-24 border-2 border-purple-500/5 border-b-purple-400 rounded-full animate-[spin_3s_linear_infinite]"></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-black text-white tracking-tight">Synthesizing Visuals</p>
                          <p className="text-sm text-gray-500 font-medium">Applying liquid effects & feature logic...</p>
                        </div>
                      </div>
                    ) : result ? (
                      <div className="w-full h-full relative group">
                        <img 
                          src={result.imageUrl} 
                          alt="AI Transformed Result"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                           <button 
                             onClick={() => window.open(result.imageUrl, '_blank')}
                             className="px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-700"
                           >
                             Full Resolution
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-700 text-center px-12">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                          <svg className="w-12 h-12 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11l-8 8-4-4m0 0l-4 4m4-4L3 7" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">System Idle: Awaiting Prompt</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="pt-10 border-t border-white/5 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 relative group">
                    <input 
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Add custom marketing context (e.g. 'Lunar landscape', 'Ultra-modern studio')..."
                      disabled={isGenerating}
                      className="w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 rounded-[1.5rem] px-8 py-6 focus:outline-none focus:ring-4 focus:ring-blue-500/20 placeholder:text-gray-700 text-base font-medium transition-all duration-500 disabled:opacity-50"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hidden md:block">Environment Prompt</div>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-white hover:bg-blue-50 text-slate-950 font-black text-sm uppercase tracking-[0.3em] px-14 py-6 rounded-[1.5rem] transition-all duration-700 shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 group disabled:bg-white/10 disabled:text-white/20"
                  >
                    {isGenerating ? 'GENERATING...' : (
                      <>
                        <span>BEGIN SYNTHESIS</span>
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] px-4">
                  <p>Product ID: {product.id}</p>
                  <p>Engine: Gemini-2.5-Flash-Image</p>
                  <p>Mode: Marketing Synthesis</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Global Style Inject */}
      <style>{`
        body { background: radial-gradient(circle at top right, #111, #000); }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); }
      `}</style>

      {/* Footer */}
      <footer className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-gray-800 text-[10px] font-black uppercase tracking-[0.4em] gap-6">
        <p>&copy; 2024 OKTAVIA CO. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-10">
          <span className="cursor-not-allowed">Protocol</span>
          <span className="cursor-not-allowed">Infrastructure</span>
          <span className="cursor-not-allowed">Endpoint Security</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
