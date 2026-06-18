import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是 GiftCraft 的智能客服，有什么可以帮您？' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Placeholder for assistant response
    const assistantMessage = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('网络请求失败');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunkValue = decoder.decode(value);
        
        // SSE parsing: data: {"content": "..."}\n\n
        const lines = chunkValue.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  const updated = { ...last, content: last.content + data.content };
                  return [...prev.slice(0, -1), updated];
                });
              }
            } catch (e) {
              console.error('Error parsing SSE chunk', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        const updated = { ...last, content: '抱歉，系统出了一点小问题，请稍后再试。' };
        return [...prev.slice(0, -1), updated];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-xl bg-white border border-gray-200 shadow-xl text-gray-900 transition-shadow duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 text-gray-900">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-blue-700" />
              <span className="font-semibold">GiftCraft AI 客服</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm",
                  msg.role === 'user' ? "bg-gray-100 border-gray-200 text-gray-600" : "bg-blue-50 border-blue-100 text-blue-700"
                )}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={cn(
                  "rounded-lg px-4 py-2 text-sm shadow-sm",
                  msg.role === 'user' 
                    ? "bg-blue-700 text-white rounded-tr-none" 
                    : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                )}>
                  {msg.content || (isLoading && i === messages.length - 1 ? '...' : '')}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-gray-200 p-4 bg-white">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入您的问题..."
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-12 text-sm text-gray-900 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 rounded-md bg-blue-700 p-1.5 text-white transition-colors hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-700 text-white shadow-md transition-colors hover:bg-blue-800"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default AiChatWidget;
