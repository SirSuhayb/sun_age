export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-8 max-w-md mx-auto text-center">
        <div className="text-6xl mb-6">🌙</div>
        
        <div className="text-2xl font-serif font-bold mb-4" style={{ letterSpacing: '-0.06em' }}>
          You're in Solar Eclipse Mode
        </div>
        
        <div className="text-xs font-mono text-gray-500 tracking-widest uppercase mb-6">
          No internet connection detected
        </div>
        
        <div className="text-sm text-gray-600 mb-8 leading-relaxed">
          Don't worry - your cosmic journey continues! We've saved your last sol age calculation 
          and you can still browse previously loaded pages.
        </div>
        
        <div className="space-y-4">
          <div className="text-xs font-mono text-gray-500 tracking-widest uppercase">
            Available offline:
          </div>
          <div className="text-sm space-y-2">
            <div>• Your last sol age calculation</div>
            <div>• Previously viewed milestones</div>
            <div>• Cached cosmic data</div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200">
          <div className="text-xs font-mono text-yellow-700 tracking-widest uppercase mb-2">
            Connection Status
          </div>
          <div className="text-sm text-yellow-600">
            Your calculations will sync automatically when you're back online
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="w-full btn-gold py-3 px-6 font-mono text-sm tracking-widest uppercase mt-6"
        >
          ☀️ Try Again
        </button>
      </div>
    </div>
  );
}