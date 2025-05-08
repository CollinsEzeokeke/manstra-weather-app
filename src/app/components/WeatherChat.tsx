'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function WeatherChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your weather assistant powered by Gemini AI. Ask me anything about weather or climate!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('online'); // Default to online since we're using direct integration
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setIsLoading(true);
    
    try {
      console.log('Sending message to API:', input);
      const res = await fetch('/api/weather-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          threadId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response:', res.status, errorText);
        throw new Error(`Failed to get response: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('API response received:', data);
      
      // Save thread ID if provided
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = 'Sorry, I encountered an error connecting to the AI service. Please try again in a moment.';
      
      // Try to extract a more specific error message if available
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      
      // Add assistant error response to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  }

  return (
    <div className="flex flex-col h-[500px] max-w-2xl mx-auto border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white py-3 px-4 font-semibold flex justify-between items-center">
        <span>Weather Chat</span>
        <span className="text-xs px-2 py-1 rounded-full bg-green-500">
          AI Powered
        </span>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, i) => (
          <div 
            key={i} 
            className={`mb-4 ${
              message.role === 'user' 
                ? 'ml-auto bg-blue-500 text-white' 
                : 'mr-auto bg-white border border-gray-200'
            } rounded-lg p-3 max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
            <div className="flex space-x-2">
              <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="bg-white p-3 border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about weather..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === ''}
            className="bg-blue-600 text-white rounded-r-lg px-4 py-2 disabled:bg-blue-400"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 