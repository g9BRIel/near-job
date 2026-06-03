import { Menu, X } from 'lucide-react';

const MobileHeader = ({ mobileMenuOpen, setMobileMenuOpen }) => (
  <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">N</div>
      <span className="font-bold text-main">NearJob</span>
    </div>
    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-main">
      {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  </div>
);

export default MobileHeader;