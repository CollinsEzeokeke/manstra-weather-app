'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-rose-100 shadow-lg border-b border-rose-800/30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-rose-300">
            Manstra Weather
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                pathname === '/' 
                  ? 'bg-rose-900/70 text-rose-200 font-medium shadow-inner' 
                  : 'hover:bg-gray-800 hover:text-rose-300'
              }`}
            >
              Weather
            </Link>
            
            <Link 
              href="/chat" 
              className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                pathname === '/chat' 
                  ? 'bg-rose-900/70 text-rose-200 font-medium shadow-inner' 
                  : 'hover:bg-gray-800 hover:text-rose-300'
              }`}
            >
              Chat
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 