'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">
            Manstra Weather
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md ${
                pathname === '/' 
                  ? 'bg-blue-800 font-medium' 
                  : 'hover:bg-blue-700'
              }`}
            >
              Weather
            </Link>
            
            <Link 
              href="/chat" 
              className={`px-3 py-2 rounded-md ${
                pathname === '/chat' 
                  ? 'bg-blue-800 font-medium' 
                  : 'hover:bg-blue-700'
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