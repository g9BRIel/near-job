import React, { useState } from 'react';
import { X, Sparkles, Wand2, Palette, Loader2, Check } from 'lucide-react';

const styles = [
  { id: '3d', name: '3D Pixar', icon: '✨', description: 'Friendly, high-quality 3D render' },
  { id: 'realistic', name: 'Realistic', icon: '📸', description: 'Professional studio portrait style' },
  { id: 'anime', name: 'Digital Art', icon: '🎨', description: 'Vibrant colors and artistic strokes' },
  { id: 'sketch', name: 'Modern Sketch', icon: '✏️', description: 'Minimalist hand-drawn aesthetics' },
];

const AIAvatarSculptor = ({ onSelect, onClose, currentName }) => {
  const [step, setStep] = useState(1); // 1: Description, 2: Generating, 3: Results
  const [description, setDescription] = useState(currentName ? `A professional digital avatar for ${currentName}` : '');
  const [selectedStyle, setSelectedStyle] = useState('3d');
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleGenerate = () => {
    if (!description.trim()) return;
    
    setStep(2);

    // Simulate AI generation process
    setTimeout(() => {
      // In a real scenario, this would call an API like Midjourney or OpenAI
      // Here we provide high-quality curated options based on the "Style"
      const mockResults = [
        { id: 1, url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' },
        { id: 2, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
        { id: 3, url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200' },
        { id: 4, url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200' },
      ];
      setResults(mockResults);
      setStep(3);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-all duration-500">
      <div className="glass rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.15)]">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-400" />
              AI Avatar Sculptor
            </h3>
            <p className="text-gray-400 mt-1">Sculpt your digital identity with advanced AI.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
            <X className="w-8 h-8 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Style Grid */}
              <div className="grid grid-cols-2 gap-4">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-5 rounded-3xl text-left border-2 transition-all duration-300 ${
                      selectedStyle === style.id
                        ? 'bg-blue-600/20 border-blue-500 ring-4 ring-blue-500/10'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-3xl mb-3">{style.icon}</div>
                    <h4 className="text-white font-bold">{style.name}</h4>
                    <p className="text-gray-400 text-xs mt-1">{style.description}</p>
                  </button>
                ))}
              </div>

              {/* Description Input */}
              <div className="space-y-4">
                <label className="text-white font-medium flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-400" />
                  Describe your features
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g. A young man with short brown hair, wearing a navy blue hoodie, friendly smile, cinematic lighting..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white min-h-[120px] focus:outline-none focus:border-blue-500 placeholder:text-gray-600 transition-all font-light leading-relaxed"
                />
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                 <p className="text-xs text-blue-300/80 leading-relaxed text-center">
                    Our AI will analyze your description and the selected style to sculpt a unique digital twin that represents you perfectly.
                 </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-8 text-center animate-in zoom-in duration-700">
               <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 animate-spin border-t-blue-500" />
                  <Loader2 className="w-12 h-12 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                  <div className="absolute -inset-8 pointer-events-none">
                     <div className="h-2 w-2 bg-blue-400 rounded-full absolute top-0 left-1/2 animate-ping" />
                     <div className="h-1.5 w-1.5 bg-purple-400 rounded-full absolute bottom-4 left-4 animate-bounce delay-100" />
                     <div className="h-2 w-2 bg-pink-400 rounded-full absolute top-10 right-2 animate-pulse delay-300" />
                  </div>
               </div>
               <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Sculpting Digital Mesh...</h4>
                  <p className="text-gray-400">Applying global illumination and facial geometry</p>
               </div>
               <div className="w-64 bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 animate-progress" />
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
               <div className="grid grid-cols-2 gap-6">
                  {results.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setSelectedResult(res.url)}
                      className={`relative rounded-3xl overflow-hidden border-4 transition-all duration-300 ${
                        selectedResult === res.url 
                        ? 'border-blue-500 scale-[1.05] shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                       <img src={res.url} alt="Result" className="w-full aspect-square object-cover" />
                       {selectedResult === res.url && (
                         <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="bg-blue-500 p-2 rounded-full ring-4 ring-blue-500/20">
                               <Check className="w-6 h-6 text-white" />
                            </div>
                         </div>
                       )}
                    </button>
                  ))}
               </div>
               <div className="text-center">
                  <p className="text-gray-400 text-sm">Not what you wanted? <button onClick={() => setStep(1)} className="text-blue-400 hover:underline">Refine description</button></p>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/10 bg-black/40">
          {step === 1 && (
            <button
              onClick={handleGenerate}
              disabled={!description.trim()}
              className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
            >
              <Wand2 className="w-6 h-6" />
              Sculpt Digital Twin
            </button>
          )}

          {step === 3 && (
            <button
              onClick={() => onSelect(selectedResult)}
              disabled={!selectedResult}
              className="w-full py-5 rounded-[1.5rem] bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Check className="w-6 h-6" />
              Manifest Identity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAvatarSculptor;
