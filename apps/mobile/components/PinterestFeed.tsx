import React, { useState } from 'react';

interface Pin {
  id: string;
  title: string;
  creator: string;
  category: string;
  image: string;
  url: string;
  likes: number;
  heightClass: string;
}

const PINS: Pin[] = [
  { id: '1', title: 'Minimalist Habit Tracker Widget', creator: 'Odyssey Studio', category: 'Productivity', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', url: 'https://neal.fun', likes: 342, heightClass: 'h-80' },
  { id: '2', title: 'Live Dynamic Wallpaper Concept', creator: 'PixelCraft', category: 'Wallpaper', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80', url: 'https://radio.garden', likes: 812, heightClass: 'h-96' },
  { id: '3', title: 'Glassmorphic Day Planner Dashboard', creator: 'Elena R.', category: 'Planner', image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80', url: 'https://patatap.com', likes: 520, heightClass: 'h-72' },
  { id: '4', title: 'Timeline & Streak Visualizer', creator: 'Studio Mono', category: 'Productivity', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', url: 'https://pointerpointer.com', likes: 194, heightClass: 'h-96' },
  { id: '5', title: 'Ambient Forest Soundscape', creator: 'Aura Beats', category: 'Audio', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', url: 'https://thisissand.com', likes: 673, heightClass: 'h-80' },
  { id: '6', title: 'Productivity Analytics UI', creator: 'MetricLabs', category: 'Analytics', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80', url: 'https://zoomquilt.org', likes: 429, heightClass: 'h-64' },
  { id: '7', title: 'Generative Canvas Art Toy', creator: 'Silk Labs', category: 'Art', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', url: 'https://weavesilk.com', likes: 920, heightClass: 'h-96' },
  { id: '8', title: 'Falling Sand Cellular Automata', creator: 'Max Bittker', category: 'Simulation', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', url: 'https://sandspiel.club', likes: 480, heightClass: 'h-80' },
];

export default function PinterestFeed() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [search, setSearch] = useState('');

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredPins = PINS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#111] font-sans selection:bg-[#E60023] selection:text-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b border-gray-100 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center text-white font-bold text-xl shadow-md">
            O
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#E60023]">Odyssey</span>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <button className="px-4 py-2.5 rounded-full bg-[#111] text-white font-semibold text-sm">Home</button>
            <button className="px-4 py-2.5 rounded-full hover:bg-gray-100 text-[#111] font-semibold text-sm transition">Explore</button>
            <button className="px-4 py-2.5 rounded-full hover:bg-gray-100 text-[#111] font-semibold text-sm transition">Create</button>
          </nav>
        </div>
        <div className="flex-1 max-w-2xl mx-6 hidden sm:block">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-gray-400 font-bold">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search minimalist habit widgets, day planners, wallpapers..."
              className="w-full bg-[#E9E9E9] hover:bg-[#DEDEDE] focus:bg-white focus:ring-2 focus:ring-[#111] rounded-full py-3 pl-12 pr-4 text-sm outline-none transition"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition">🔔</button>
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition">💬</button>
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-gray-200 cursor-pointer">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-4 gap-5 [column-fill:_balance]">
          {filteredPins.map((pin) => {
            const isSaved = savedIds.includes(pin.id);
            const isMenuOpen = activeMenuId === pin.id;

            return (
              <div
                key={pin.id}
                onClick={() => setSelectedPin(pin)}
                className="break-inside-avoid mb-5 group relative cursor-pointer rounded-3xl overflow-hidden bg-white shadow-xs hover:shadow-2xl transition-all duration-300"
              >
                <div className={`relative w-full ${pin.heightClass} overflow-hidden bg-gray-100`}>
                  <img
                    src={pin.image}
                    alt={pin.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-black shadow">
                        {pin.category}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : pin.id); }}
                          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/70 shadow transition"
                        >
                          •••
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-36 z-30">
                            <button
                              onClick={(e) => { toggleSave(pin.id, e); setActiveMenuId(null); }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                            >
                              <span>{isSaved ? '📌' : '🔖'}</span> {isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); alert(`Shared ${pin.title}!`); setActiveMenuId(null); }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                            >
                              <span>🔗</span> Share
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(pin.url, '_blank'); setActiveMenuId(null); }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                            >
                              <span>🌐</span> Visit Web
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
                        🔗 {pin.url.replace('https://', '').replace('/', '')}
                      </span>
                      <button
                        onClick={(e) => toggleSave(pin.id, e)}
                        className={`px-5 py-2.5 rounded-full font-bold text-xs shadow-lg transition ${
                          isSaved ? 'bg-black text-white' : 'bg-[#E60023] text-white hover:bg-[#AD081B]'
                        }`}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5">
                  <h3 className="font-bold text-xs text-[#111] truncate">{pin.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80" alt={pin.creator} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium truncate">{pin.creator}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {selectedPin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <div className="md:w-1/2 bg-gray-950 flex items-center justify-center overflow-hidden relative">
              <img src={selectedPin.image} alt={selectedPin.title} className="w-full h-full object-cover max-h-[70vh] md:max-h-[90vh]" />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg font-bold">•••</button>
                    <button onClick={() => window.open(selectedPin.url, '_blank')} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg">🔗</button>
                  </div>
                  <button
                    onClick={() => toggleSave(selectedPin.id)}
                    className={`px-7 py-3.5 rounded-full font-bold text-sm shadow-md transition ${
                      savedIds.includes(selectedPin.id) ? 'bg-black text-white' : 'bg-[#E60023] text-white hover:bg-[#AD081B]'
                    }`}
                  >
                    {savedIds.includes(selectedPin.id) ? 'Saved' : 'Save'}
                  </button>
                </div>

                <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-700">{selectedPin.category}</span>
                <h2 className="text-3xl font-extrabold text-[#111] mt-3 mb-3">{selectedPin.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">Experience the live interactive widget and seamless day planning experience built for Odyssey creators.</p>

                <div className="flex items-center gap-4 py-5 border-t border-b border-gray-100 mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt={selectedPin.creator} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111]">{selectedPin.creator}</h4>
                    <p className="text-xs text-gray-400">14.2K Followers</p>
                  </div>
                  <button className="ml-auto px-5 py-2.5 rounded-full bg-[#111] text-white hover:bg-gray-800 font-bold text-xs transition">Follow</button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-xs font-bold text-gray-500">❤️ {selectedPin.likes} Likes</span>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
