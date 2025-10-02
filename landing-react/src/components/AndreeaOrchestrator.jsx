import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, MessageCircle, BookOpen, Target, TrendingUp, Send, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AndreeaOrchestrator() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m Andreea, your Ahauros AI mentor. I\'m here to help you optimize your business strategies. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Map i18n language to GPT language parameter
      const languageMap = {
        'en': 'English',
        'ro': 'Romanian',
        'fr': 'French',
        'es': 'Spanish',
        'pt': 'Portuguese'
      };
      
      const gptLanguage = languageMap[i18n.language] || 'English';
      
      const response = await apiService.callAndreeaGPT(inputMessage.trim(), gptLanguage);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Andreea GPT:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center">
          <Brain className="w-10 h-10 text-[#e0bd40] mr-4" />
          Mentoring AI - Andreea
        </h1>
        <p className="text-gray-300 text-lg">Your personal AI mentor for business optimization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sessions Completed</p>
              <p className="text-2xl font-bold">47</p>
            </div>
            <MessageCircle className="w-8 h-8 text-[#e0bd40]" />
          </div>
        </div>
        
        <div className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Knowledge Points</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <BookOpen className="w-8 h-8 text-[#e0bd40]" />
          </div>
        </div>
        
        <div className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Goals Achieved</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Target className="w-8 h-8 text-[#e0bd40]" />
          </div>
        </div>
        
        <div className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Improvement Rate</p>
              <p className="text-2xl font-bold">+34%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#e0bd40]" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat Interface */}
        <div className="bg-gray-900/80 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 text-[#e0bd40] mr-3" />
            Chat with Andreea
          </h2>
          
          {/* Messages Container */}
          <div className="h-96 overflow-y-auto space-y-4 mb-6 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-[#e0bd40]/20 ml-8'
                    : 'bg-gray-800/50 mr-8'
                }`}
              >
                <p className="text-sm text-gray-400 mb-2">
                  {message.role === 'user' ? 'You' : 'Andreea AI'}:
                </p>
                <p className="text-gray-300 whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-800/50 rounded-lg p-4 mr-8">
                <p className="text-sm text-gray-400 mb-2">Andreea AI:</p>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#e0bd40]" />
                  <p className="text-gray-300">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Andreea anything..."
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#e0bd40]"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#e0bd40] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#d4a835] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-gray-900/80 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <BookOpen className="w-6 h-6 text-[#e0bd40] mr-3" />
            Learning Progress
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Business Strategy</span>
                <span className="text-[#e0bd40] font-semibold">85%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-[#e0bd40] h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Marketing Optimization</span>
                <span className="text-[#e0bd40] font-semibold">72%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-[#e0bd40] h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Financial Analysis</span>
                <span className="text-[#e0bd40] font-semibold">68%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-[#e0bd40] h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Operations Management</span>
                <span className="text-[#e0bd40] font-semibold">91%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-[#e0bd40] h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      <div className="mt-8 bg-gray-900/80 rounded-xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6">Recent AI Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-[#e0bd40] pl-4">
            <h3 className="font-semibold text-lg mb-2">Pricing Strategy</h3>
            <p className="text-gray-300">Your current pricing model could be optimized by 15% based on market analysis.</p>
          </div>
          <div className="border-l-4 border-[#e0bd40] pl-4">
            <h3 className="font-semibold text-lg mb-2">Customer Segmentation</h3>
            <p className="text-gray-300">I've identified 3 new customer segments that could increase revenue by 23%.</p>
          </div>
          <div className="border-l-4 border-[#e0bd40] pl-4">
            <h3 className="font-semibold text-lg mb-2">Operational Efficiency</h3>
            <p className="text-gray-300">Your supply chain could be streamlined to reduce costs by 8%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
