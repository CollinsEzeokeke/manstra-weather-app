import { Suspense } from 'react';
import WeatherChat from '../components/WeatherChat';

export const metadata = {
  title: 'Weather Chat - Powered by Gemini',
  description: 'Chat with our weather AI assistant about weather topics',
};

export default function ChatPage() {
  return (
    <main className="p-4 md:p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-semibold text-center mb-8">Weather Chat</h1>
      <p className="text-center text-gray-600 mb-8">
        Talk to our AI assistant powered by Google Gemini about weather, climate, or any weather-related topics.
      </p>
      
      <Suspense fallback={<div className="text-center">Loading chat...</div>}>
        <WeatherChat />
      </Suspense>
    </main>
  );
} 