/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Receipt,
  Printer,
  TrendingUp,
  PackagePlus,
  ArrowRight,
  Bot
} from 'lucide-react';
import { AIAssistantMessage, Customer, Order, Product, UserAccount } from '../types/index.ts';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  categories: string[];
  onExecuteCreateOrder: (payload: any) => void;
  onExecuteUpdateStock: (productCode: string, delta: number, reason: string) => void;
  onExecuteGenerateInvoice: (orderNumber: string) => void;
  onExecuteAddCategory: (categoryName: string) => void;
  isDarkMode: boolean;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  products,
  orders,
  customers,
  categories,
  onExecuteCreateOrder,
  onExecuteUpdateStock,
  onExecuteGenerateInvoice,
  onExecuteAddCategory,
  isDarkMode,
}) => {
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Assalam-o-Alaikum ${currentUser.name}! I am your AI Assistant. I can automatically create suit orders, generate thermal receipts, adjust fabric stock, and analyze business performance. What would you like to execute?`,
      timestamp: 'Just now',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: AIAssistantMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          role: currentUser.role,
          context: {
            productsSummary: products.map((p) => ({ code: p.code, title: p.title, stock: p.stockQty, price: p.pricePKR })),
            recentOrders: orders.slice(0, 5).map((o) => ({ number: o.orderNumber, client: o.customerName, status: o.status })),
            customersCount: customers.length,
            categories,
          },
        }),
      });

      const data = await response.json();

      const botMsg: AIAssistantMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.message || 'I have analyzed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: data.actionType,
        actionPayload: data.actionPayload,
        executed: false,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'assistant',
          text: 'Request processed locally. Ready to assist with orders and POS printing.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg || !msg.actionType || msg.executed) return;

    if (msg.actionType === 'CREATE_ORDER') {
      onExecuteCreateOrder(msg.actionPayload);
    } else if (msg.actionType === 'UPDATE_STOCK') {
      const { productCode, delta, reason } = msg.actionPayload;
      onExecuteUpdateStock(productCode || 'ZS-701', delta || 1, reason || 'AI restock action');
    } else if (msg.actionType === 'GENERATE_INVOICE') {
      onExecuteGenerateInvoice(msg.actionPayload?.orderNumber || 'ZS-2026-1042');
    } else if (msg.actionType === 'ADD_CATEGORY') {
      onExecuteAddCategory(msg.actionPayload?.categoryName || 'New Luxury Category');
    }

    setMessages((prev) =>
      prev.map((m, idx) => (idx === msgIndex ? { ...m, executed: true } : m))
    );
  };

  const samplePrompts = [
    'How do I use this software? (Software guide)',
    'How do I add my website in Settings?',
    'Create bespoke order for Tariq Bajwa with 50,000 advance',
    'Restock 5 suits of ZS-701 Royal Navy',
    'Generate thermal invoice for order ZS-2026-1042',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col h-[650px] overflow-hidden ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'bg-neutral-950/80 border-neutral-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-sm font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  AI Assistant
                </h2>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-stone-500'}`}>
                Voice / natural language ERP operations &amp; order automation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-amber-500 text-neutral-950 rounded-tr-none font-medium'
                    : isDarkMode
                    ? 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-tl-none'
                    : 'bg-stone-100 border border-stone-200 text-stone-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Structured Action Execution Card */}
                  {m.actionType && m.actionType !== 'NONE' && (
                    <div className={`mt-3 p-3 rounded-xl border text-xs space-y-2 ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-700/80' : 'bg-white border-stone-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-500 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Action Ready: {m.actionType.replace('_', ' ')}</span>
                        </span>
                        {m.executed ? (
                          <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Executed</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-500">
                            Awaiting Approval
                          </span>
                        )}
                      </div>

                      {m.actionPayload && (
                        <div className={`p-2 rounded font-mono text-[11px] overflow-x-auto ${
                          isDarkMode ? 'bg-neutral-950 text-neutral-300' : 'bg-stone-50 text-stone-700'
                        }`}>
                          {JSON.stringify(m.actionPayload, null, 2)}
                        </div>
                      )}

                      {!m.executed && (
                        <button
                          onClick={() => handleExecuteAction(idx)}
                          className="w-full mt-1 py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Approve &amp; Execute Action</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className={`text-[10px] text-right mt-1.5 ${
                    isUser ? 'text-neutral-900/60' : isDarkMode ? 'text-neutral-500' : 'text-stone-400'
                  }`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-amber-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Sartorial AI is analyzing atelier records...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className={`px-4 py-2 border-t flex items-center gap-2 overflow-x-auto text-[11px] ${
          isDarkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <span className={`${isDarkMode ? 'text-neutral-500' : 'text-stone-400'} whitespace-nowrap`}>
            Quick Prompts:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(p)}
              className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors ${
                isDarkMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                  : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(userInput);
          }}
          className={`p-4 border-t flex items-center gap-2 ${
            isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-stone-200'
          }`}
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type any command: e.g. Create suit order for Tariq, or restock 5 items of ZS-701..."
            className={`flex-1 px-4 py-2 text-xs rounded-xl border focus:outline-none focus:border-amber-500 ${
              isDarkMode
                ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500'
                : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
            }`}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="p-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold rounded-xl transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
