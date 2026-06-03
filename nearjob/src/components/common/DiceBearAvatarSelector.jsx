import React, { useState } from 'react';
import { X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const options = {
  top: ['longHair', 'shortHair', 'eyepatch', 'hat', 'hijab', 'turban', 'bob', 'curly', 'shaved', 'bun'],
  hairColor: ['2c1b18', '4a2c2a', '724133', 'b84928', 'c93305', 'e8bc1a', 'f59797'],
  facialHair: ['none', 'beardLight', 'beardMajestic', 'beardMedium', 'moustaceFancy', 'moustacheMagnum'],
  clothes: ['shirty', 'hoodie', 'overall', 'sweater', 'blazerAndShirt', 'graphicShirt'],
  eyes: ['default', 'happy', 'surprised', 'closed', 'wink', 'eyeRoll', 'squint'],
  mouth: ['default', 'smile', 'tongue', 'serious', 'grimace', 'sad'],
  skin: ['614335', 'ae5d29', 'd08b5b', 'edb98a', 'f8d25c', 'fd9841'],
};

const DiceBearAvatarSelector = ({ onSelect, onClose }) => {
  const [config, setConfig] = useState({
    top: 'shortHair',
    hairColor: '4a2c2a',
    facialHair: 'none',
    clothes: 'shirty',
    eyes: 'default',
    mouth: 'default',
    skin: 'edb98a',
  });

  const generateUrl = (c) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?top=${c.top}&hairColor=${c.hairColor}&facialHair=${c.facialHair}&clothing=${c.clothes}&eyes=${c.eyes}&mouth=${c.mouth}&skinColor=${c.skin}`;
  };

  const cycle = (key, direction) => {
    const list = options[key];
    const currentIndex = list.indexOf(config[key]);
    let nextIndex = (currentIndex + direction + list.length) % list.length;
    setConfig({ ...config, [key]: list[nextIndex] });
  };

  const randomize = () => {
    const newConfig = {};
    Object.keys(options).forEach(key => {
      newConfig[key] = options[key][Math.floor(Math.random() * options[key].length)];
    });
    setConfig(newConfig);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass rounded-3xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <h3 className="text-xl font-bold text-white">Avatar Creator</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center bg-gradient-to-b from-slate-900/50 to-transparent">
          <div className="w-40 h-40 rounded-full bg-white/5 border-4 border-blue-500/30 p-2 mb-6 shadow-2xl shadow-blue-500/20">
            <img src={generateUrl(config)} alt="Avatar Preview" className="w-full h-full" />
          </div>
          
          <button 
            onClick={randomize} 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition text-sm text-blue-400 font-medium border border-blue-500/30"
          >
            <RefreshCw className="w-4 h-4" /> Randomize
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[40vh]">
          {Object.keys(options).map(key => (
            <div key={key} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-gray-400 text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => cycle(key, -1)} className="p-1 hover:text-white transition"><ChevronLeft /></button>
                <span className="text-white text-xs w-20 text-center truncate">{config[key]}</span>
                <button onClick={() => cycle(key, 1)} className="p-1 hover:text-white transition"><ChevronRight /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/10 bg-slate-900/50">
          <button 
            onClick={() => onSelect(generateUrl(config))}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            Use This Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiceBearAvatarSelector;
