import React, { useState } from 'react';

interface WidgetPin {
  id: string;
  title: string;
  creator: string;
  category: string;
  image: string;
  url: string;
  likes: number;
}

const WIDGETS: WidgetPin[] = [
  { id: '1', title: 'Minimalist Habit Streak Tracker', creator: 'Odyssey Studio', category: 'Productivity', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', url: 'https://neal.fun', likes: 412 },
  { id: '2', title: 'Live Aurora Borealis Wallpaper', creator: 'PixelCraft', category: 'Wallpaper', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80', url: 'https://radio.garden', likes: 934 },
  { id: '3', title: 'Glassmorphic Day Planner Hub', creator: 'Elena R.', category: 'Planner', image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80', url: 'https://patatap.com', likes: 625 },
  { id: '4', title: 'Interactive Focus Timer & Ambient Beats', creator: 'Aura Beats', category: 'Audio', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', url: 'https://thisissand.com', likes: 789 },
  { id: '5', title: 'Productivity Velocity Chart', creator: 'MetricLabs', category: 'Analytics', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80', url: 'https://zoomquilt.org', likes: 350 },
  { id: '6', title: 'Generative Silk Flow Art Canvas', creator: 'Silk Labs', category: 'Art', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', url: 'https://weavesilk.com', likes: 1040 },
];

export default function OdysseyCreatorDashboard() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<WidgetPin | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredWidgets = WIDGETS.filter(w => 
    (activeCategory === 'All' || w.category === activeCategory) &&
    (w.title.toLowerCase().includes(searchQuery.toLowerCase()) || w.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] font-sans selection:bg-[#E60023] selection:text-white">
      {/* Pinterest-Inspired Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between border-b border-gray-100 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center text-white font-black text-xl shadow-md">
            Ω
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#E60023]">Odyssey Creator Studio</span>
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            <button className="px-4 py-2.5 rounded-full bg-[#111] text-white font-semibold text-sm shadow-sm">Home Feed</button>
            <button className="px-4 py-2.5 rounded-full hover:bg-gray-100 text-[#111] font-semibold text-sm transition">Explore Widgets</button>
            <button className="px-4 py-2.5 rounded-full hover:bg-gray-100 text-[#111] font-semibold text-sm transition">Publish</button>
          </nav>
        </div>
        <div className="flex-1 max-w-2xl mx-6 hidden sm:block">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-gray-400 font-bold">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search minimalist habit widgets, day planners, live wallpapers..."
              className="w-full bg-[#E9E9E9] hover:bg-[#DEDEDE] focus:bg-white focus:ring-2 focus:ring-[#111] rounded-full py-3 pl-12 pr-4 text-sm outline-none transition"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition">🔔</button>
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition">💬</button>
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm cursor-pointer">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Category Filter Pills */}
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {['All', 'Productivity', 'Wallpaper', 'Planner', 'Audio', 'Analytics', 'Art'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition shadow-xs ${
              activeCategory === cat ? 'bg-[#111] text-white shadow-md' : 'bg-white hover:bg-gray-100 text-[#111] border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Feed Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-4 gap-6 [column-fill:_balance]">
          {filteredWidgets.map((widget) => {
            const isSaved = savedIds.includes(widget.id);
            const isMenuOpen = activeMenuId === widget.id;

            return (
              <div
                key={widget.id}
                onClick={() => setSelectedWidget(widget)}
                className="break-inside-avoid mb-6 group relative cursor-pointer rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative w-full h-80 overflow-hidden bg-gray-100">
                  <img
                    src={widget.image}
                    alt={widget.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                    {/* Top Row: Category + Top-Right 3-Dots Menu */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-black shadow-md">
                        {widget.category}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : widget.id); }}
                          className="w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/80 shadow-lg transition"
                        >
                          •••
                        </button>

                        {/* Top-Right Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-40 z-30 animate-fadeIn">
                            <button
                              onClick={(e) => { toggleSave(widget.id, e); setActiveMenuId(null); }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-100 flex items-center gap-2.5 text-gray-800"
                            >
                              <span>{isSaved ? '📌' : '🔖'}</span> {isSaved ? 'Saved to Board' : 'Save Widget'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); alert(`Shared ${widget.title}!`); setActiveMenuId(null); }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-100 flex items-center gap-2.5 text-gray-800"
                            >
                              <span>🔗</span> Copy Link
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(widget.url, '_blank'); setActiveMenuId(null); }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-100 flex items-center gap-2.5 text-gray-800"
                            >
                              <span>🌐</span> Open Live Preview
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Save Button & External Link */}
                    <div className="flex justify-between items-center">
                      <span className="text-white text-xs font-bold bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow">
                        🔗 {widget.url.replace('https://', '').replace('/', '')}
                      </span>
                      <button
                        onClick={(e) => toggleSave(widget.id, e)}
                        className={`px-5 py-2.5 rounded-full font-bold text-xs shadow-xl transition ${
                          isSaved ? 'bg-black text-white' : 'bg-[#E60023] text-white hover:bg-[#AD081B]'
                        }`}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4">
                  <h3 className="font-bold text-xs text-[#111] truncate">{widget.title}</h3>
                  <div className="flex items-center gap-2.5 mt-2.5">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shadow-xs">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80" alt={widget.creator} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium truncate">{widget.creator}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Widget Detail Modal */}
      {selectedWidget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <div className="md:w-1/2 bg-gray-950 flex items-center justify-center overflow-hidden relative">
              <img src={selectedWidget.image} alt={selectedWidget.title} className="w-full h-full object-cover max-h-[70vh] md:max-h-[90vh]" />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg font-bold shadow-xs border border-gray-100">•••</button>
                    <button onClick={() => window.open(selectedWidget.url, '_blank')} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg shadow-xs border border-gray-100">🔗</button>
                  </div>
                  <button
                    onClick={(e) => toggleSave(selectedWidget.id, e)}
                    className={`px-7 py-3.5 rounded-full font-bold text-sm shadow-lg transition ${
                      savedIds.includes(selectedWidget.id) ? 'bg-black text-white' : 'bg-[#E60023] text-white hover:bg-[#AD081B]'
                    }`}
                  >
                    {savedIds.includes(selectedWidget.id) ? 'Saved to Board' : 'Save Widget'}
                  </button>
                </div>

                <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-700">{selectedWidget.category}</span>
                <h2 className="text-3xl font-extrabold text-[#111] mt-3 mb-3">{selectedWidget.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">Interactive creator widget and live preview designed for Odyssey. Embed directly into your daily planner and live Android wallpaper.</p>

                <div className="flex items-center gap-4 py-5 border-t border-b border-gray-100 mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt={selectedWidget.creator} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111]">{selectedWidget.creator}</h4>
                    <p className="text-xs text-gray-400">18.4K Creator Followers</p>
                  </div>
                  <button className="ml-auto px-5 py-2.5 rounded-full bg-[#111] text-white hover:bg-gray-800 font-bold text-xs transition shadow">Follow</button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-xs font-bold text-gray-500">❤️ {selectedWidget.likes} Creator Likes</span>
                <button
                  onClick={() => setSelectedWidget(null)}
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
