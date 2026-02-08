import { Disc, Github, Twitter } from "lucide-react"; // Install dulu: npm i lucide-react

export const Footer = () => {
  return (
    <footer className="border-t border-zinc-100 bg-white py-12 mt-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* BRANDING */}
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-lg font-bold text-zinc-900">VERTEX PROTOCOL</h3>
          <p className="text-sm text-zinc-500 max-w-xs">
            Experimental DeFi protocol on Arbitrum Sepolia. 
            Trust the math, not the market.
          </p>
        </div>

        {/* LINKS */}
        <div className="flex items-center gap-6">
          <a href="#" className="text-zinc-400 hover:text-[#12AAFF] transition-colors">
            <span className="sr-only">GitHub</span>
            <Github size={20} />
          </a>
          <a href="#" className="text-zinc-400 hover:text-[#12AAFF] transition-colors">
            <span className="sr-only">Twitter</span>
            <Twitter size={20} />
          </a>
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
            Whitepaper
          </a>
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
            Docs
          </a>
        </div>
        
        {/* COPYRIGHT */}
        <div className="text-xs text-zinc-400">
          © 2026 Vertex Protocol. MIT License.
        </div>
      </div>
    </footer>
  );
};