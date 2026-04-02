import { SearchBar } from '../components/SearchBar';

export function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🔍</span>
            <span className="font-bold text-gray-800 text-lg tracking-tight">SmartSearch</span>
          </div>
          <div className="flex-1">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Find exactly what<br />
          <span className="text-indigo-500">you&rsquo;re looking for</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
          Typo-tolerant, relevance-ranked search across 50 products in 6 categories.
          Try <code className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-sm">&ldquo;wirelss headphones&rdquo;</code> or <code className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-sm">&ldquo;samsng&rdquo;</code>.
        </p>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['Electronics', 'Clothing', 'Home', 'Sports', 'Beauty', 'Books'].map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-500 shadow-sm"
            >
              {cat}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
