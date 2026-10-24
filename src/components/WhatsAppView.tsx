/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Send,
  Check,
  CheckCheck,
  ShieldAlert,
  Sparkles,
  Phone,
  MessageCircle,
  FileText,
  AlertCircle,
  Settings,
  Key,
  Globe,
  RefreshCw,
  Plus,
  ExternalLink,
  UserPlus,
  X
} from 'lucide-react';
import { Customer, UserAccount, WhatsAppCloudApiConfig, WhatsAppConversation } from '../types/index.ts';

interface WhatsAppViewProps {
  conversations: WhatsAppConversation[];
  customers: Customer[];
  currentUser: UserAccount;
  apiConfig: WhatsAppCloudApiConfig;
  onSendMessage: (conversationId: string, text: string, templateName?: string) => void;
  onSimulateReply: (conversationId: string, text: string) => void;
  onUpdateApiConfig: (config: WhatsAppCloudApiConfig) => void;
  onLinkNewContact: (customerId: string, name: string, phone: string, initialMessage?: string) => void;
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  isDarkMode: boolean;
}

const QUICK_TEMPLATES = [
  {
    name: 'Trial Fitting Reminder',
    text: 'Assalam-o-Alaikum! Your bespoke suit has completed rough canvassing and is ready for trial fitting at our Gulberg Atelier. Kindly let us know a suitable time tomorrow.',
  },
  {
    name: 'Order Confirmed & Canvassing',
    text: 'Thank you for your distinguished patronage. Your bespoke suit order has been assigned to Master Aslam. We have commenced precision fabric cutting.',
  },
  {
    name: 'Dispatched via TCS Courier',
    text: 'Good news! Your luxury bespoke attire has been inspected, steamed, and packed in our travel suit carrier. Tracking number has been generated for safe delivery.',
  },
  {
    name: 'Payment Receipt Confirmed',
    text: 'We gratefully acknowledge receipt of your payment via Raast / Bank transfer. Your digital thermal receipt has been generated and filed.',
  },
];

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  conversations,
  customers,
  currentUser,
  apiConfig,
  onSendMessage,
  onSimulateReply,
  onUpdateApiConfig,
  onLinkNewContact,
  activeConversationId,
  onSelectConversation,
  isDarkMode,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(
    activeConversationId || conversations[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'live_settings'>('chats');

  // Link Client WhatsApp modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkCustName, setLinkCustName] = useState('');
  const [linkPhone, setLinkPhone] = useState('+92 300 ');
  const [linkInitMessage, setLinkInitMessage] = useState('Assalam-o-Alaikum! Welcome to our Bespoke Tailors atelier. We have registered your client profile.');
  const [selectedExistingCustId, setSelectedExistingCustId] = useState('');

  // Live API settings form state
  const [phoneId, setPhoneId] = useState(apiConfig.phoneNumberId);
  const [wabaId, setWabaId] = useState(apiConfig.businessAccountId);
  const [token, setToken] = useState(apiConfig.permanentAccessToken);
  const [verifyToken, setVerifyToken] = useState(apiConfig.webhookVerifyToken);
  const [mode, setMode] = useState<'DEMO' | 'LIVE'>(apiConfig.mode);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const filteredConversations = conversations.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    if (mode === 'LIVE' && !apiConfig.permanentAccessToken) {
      alert('Cannot send live message: WhatsApp Cloud API credentials are not configured.');
      return;
    }

    onSendMessage(activeConversation.id, messageInput.trim());
    setMessageInput('');

    // In demo mode, trigger a realistic client reply after 1.5 seconds if client inquired
    if (mode === 'DEMO') {
      setTimeout(() => {
        onSimulateReply(
          activeConversation.id,
          'Shukriya Mian Sahab! Received and noted. Looking forward to the fitting.'
        );
      }, 1500);
    }
  };

  const handleApplyTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
    if (!activeConversation) return;
    onSendMessage(activeConversation.id, tpl.text, tpl.name);
  };

  const handleSaveApiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateApiConfig({
      mode,
      phoneNumberId: phoneId.trim(),
      businessAccountId: wabaId.trim(),
      permanentAccessToken: token.trim(),
      webhookVerifyToken: verifyToken.trim(),
      isConnected: mode === 'LIVE' && Boolean(token.trim()),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCustName.trim() || !linkPhone.trim()) return;

    onLinkNewContact(
      selectedExistingCustId || `cust_${Date.now()}`,
      linkCustName.trim(),
      linkPhone.trim(),
      linkInitMessage.trim()
    );

    setIsLinkModalOpen(false);
    setLinkCustName('');
    setLinkPhone('+92 300 ');
  };

  // Direct wa.me link generator for real WhatsApp Web/Mobile App opening
  const getDirectWaMeUrl = (phone: string, text: string) => {
    const cleanDigits = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleanDigits}?text=${encoded}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Mode Banner & Link Client Action */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${
        isDarkMode ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-sm font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                WhatsApp Business Client Hub
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                mode === 'DEMO'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
              }`}>
                {mode === 'DEMO' ? 'SIMULATED DEMO' : 'LIVE CLOUD API'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-stone-500'}`}>
              Two-way client messaging with direct wa.me link opening &amp; automated notifications
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Link new WhatsApp client by phone */}
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Link Client WhatsApp Number</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              activeTab === 'chats'
                ? isDarkMode ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-stone-200 text-stone-900 border-stone-300 font-semibold'
                : isDarkMode ? 'text-neutral-400 hover:text-white border-transparent' : 'text-stone-500 hover:text-stone-900 border-transparent'
            }`}
          >
            Chats ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab('live_settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              activeTab === 'live_settings'
                ? isDarkMode ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-stone-200 text-stone-900 border-stone-300 font-semibold'
                : isDarkMode ? 'text-neutral-400 hover:text-white border-transparent' : 'text-stone-500 hover:text-stone-900 border-transparent'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>API Credentials</span>
          </button>
        </div>
      </div>

      {activeTab === 'live_settings' ? (
        /* WhatsApp Cloud API Configuration Panel */
        <div className={`rounded-xl border p-6 space-y-6 text-xs ${
          isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="border-b border-neutral-800 pb-4">
            <h2 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Official WhatsApp Business Cloud API Configuration
            </h2>
            <p className={isDarkMode ? 'text-neutral-400' : 'text-stone-600'}>
              Configure real Meta Graph API credentials for production deployment or switch to isolated Demo Mode.
            </p>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>WhatsApp settings updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveApiSettings} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Provider Operating Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 ${
                  mode === 'DEMO' ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">Demo Mode</span>
                    <input
                      type="radio"
                      name="wmode"
                      checked={mode === 'DEMO'}
                      onChange={() => setMode('DEMO')}
                      className="accent-amber-500"
                    />
                  </div>
                  <span className="text-[11px] opacity-80">
                    Safe simulated conversations in demo database.
                  </span>
                </label>

                <label className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 ${
                  mode === 'LIVE' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">Live Cloud API</span>
                    <input
                      type="radio"
                      name="wmode"
                      checked={mode === 'LIVE'}
                      onChange={() => setMode('LIVE')}
                      className="accent-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] opacity-80">
                    Requires valid Meta System User token.
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 mb-1">Phone Number ID</label>
                <input
                  type="text"
                  placeholder="e.g. 109841289410291"
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">WhatsApp Business Account ID (WABA)</label>
                <input
                  type="text"
                  placeholder="e.g. 390192841029381"
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Permanent Access Token (System User)</label>
              <input
                type="password"
                placeholder="EAA..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Webhook Verify Token</label>
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
              >
                Save Integration Settings
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* WhatsApp Chat Web Interface */
        <div className={`rounded-xl border overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[720px] ${
          isDarkMode ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          {/* Left Column: Conversations List */}
          <div className={`border-r flex flex-col ${
            isDarkMode ? 'border-neutral-800 bg-neutral-950/60' : 'border-stone-200 bg-stone-50'
          }`}>
            <div className={`p-3 border-b ${isDarkMode ? 'border-neutral-800' : 'border-stone-200'}`}>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats or phone..."
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400'
                  }`}
                />
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto divide-y ${
              isDarkMode ? 'divide-neutral-800/40' : 'divide-stone-200'
            }`}>
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500 space-y-1">
                  <div>No WhatsApp conversations yet.</div>
                  <div className="text-[11px] text-neutral-600">Click &quot;Link Client WhatsApp Number&quot; above to message a client.</div>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === activeConversation?.id;
                  return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      if (onSelectConversation) onSelectConversation(conv.id);
                    }}
                    className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected
                        ? isDarkMode ? 'bg-neutral-800/90' : 'bg-amber-50 border-l-2 border-l-amber-500'
                        : isDarkMode ? 'hover:bg-neutral-900/80' : 'hover:bg-stone-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 text-xs shrink-0 font-serif-display">
                      {conv.customerName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-semibold text-xs truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                          {conv.customerName}
                        </span>
                        <span className="text-[10px] text-neutral-500 shrink-0">
                          {conv.lastTimestamp}
                        </span>
                      </div>

                      <div className={`text-[11px] font-mono mb-1 ${isDarkMode ? 'text-neutral-400' : 'text-stone-500'}`}>
                        {conv.customerPhone}
                      </div>

                      <p className={`text-xs truncate ${isDarkMode ? 'text-neutral-400' : 'text-stone-600'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className={`md:col-span-2 flex flex-col ${
            isDarkMode ? 'bg-neutral-950/90' : 'bg-stone-50/50'
          }`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b ${
                  isDarkMode ? 'border-neutral-800 bg-neutral-900/60' : 'border-stone-200 bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 text-xs font-serif-display">
                      {activeConversation.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {activeConversation.customerName}
                      </div>
                      <div className={`text-[11px] font-mono ${isDarkMode ? 'text-neutral-400' : 'text-stone-500'}`}>
                        {activeConversation.customerPhone}
                        {activeConversation.orderNumberRef && ` · Order ${activeConversation.orderNumberRef}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct wa.me WhatsApp launcher */}
                    <a
                      href={getDirectWaMeUrl(activeConversation.customerPhone, `Assalam-o-Alaikum ${activeConversation.customerName}! Contacting you from the atelier regarding your order ${activeConversation.orderNumberRef || ''}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg shadow-sm transition-colors"
                      title="Open chat in WhatsApp Web or Mobile App"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Quick Suit Response Templates */}
                <div className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto text-[11px] ${
                  isDarkMode ? 'border-neutral-800 bg-neutral-900/40' : 'border-stone-200 bg-stone-100'
                }`}>
                  <span className={`${isDarkMode ? 'text-neutral-500' : 'text-stone-500'} whitespace-nowrap`}>
                    Quick Templates:
                  </span>
                  {QUICK_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.name}
                      onClick={() => handleApplyTemplate(tpl)}
                      className={`px-2.5 py-1 rounded border whitespace-nowrap transition-colors ${
                        isDarkMode
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700 hover:text-white'
                          : 'bg-white hover:bg-stone-200 text-stone-700 border-stone-300 hover:text-stone-900'
                      }`}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>

                {/* Messages scroll area */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {activeConversation.messages.map((m) => {
                    const isBusiness = m.sender === 'business';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isBusiness ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                            isBusiness
                              ? isDarkMode
                                ? 'bg-amber-950/80 border border-amber-800/50 text-neutral-100 rounded-tr-none'
                                : 'bg-amber-100 border border-amber-200 text-stone-900 rounded-tr-none'
                              : isDarkMode
                              ? 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'
                              : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                          }`}
                        >
                          {m.templateName && (
                            <div className="text-[10px] font-mono text-amber-500 mb-1 border-b border-amber-500/20 pb-0.5">
                              Template: {m.templateName}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{m.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                              isBusiness ? 'text-amber-500/70' : 'text-neutral-500'
                            }`}
                          >
                            <span>{m.timestamp}</span>
                            {isBusiness && (
                              <span>
                                {m.status === 'read' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                ) : m.status === 'delivered' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-neutral-400" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-neutral-500" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message input */}
                <form
                  onSubmit={handleSend}
                  className={`p-3 border-t flex items-center gap-2 ${
                    isDarkMode ? 'border-neutral-800 bg-neutral-900/60' : 'border-stone-200 bg-white'
                  }`}
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a WhatsApp message to client..."
                    className={`flex-1 px-4 py-2 text-xs rounded-lg border focus:outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500' : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors font-medium shrink-0 shadow-sm"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="p-12 text-center text-neutral-500 text-xs my-auto">
                Select a customer conversation to review messaging thread.
              </div>
            )}
          </div>
        </div>
      )}

      {/* LINK CLIENT WHATSAPP MODAL */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-xl border shadow-2xl p-6 text-xs space-y-4 ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold">Link Client WhatsApp Number</h2>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-3">
              <div>
                <label className="block text-neutral-400 mb-1">Pick Existing Client (Optional)</label>
                <select
                  value={selectedExistingCustId}
                  onChange={(e) => {
                    setSelectedExistingCustId(e.target.value);
                    const found = customers.find((c) => c.id === e.target.value);
                    if (found) {
                      setLinkCustName(found.name);
                      setLinkPhone(found.phone);
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                >
                  <option value="">-- Or enter new client below --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Client Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mian Jahangir"
                  value={linkCustName}
                  onChange={(e) => setLinkCustName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">WhatsApp Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="+92 300 1234567"
                  value={linkPhone}
                  onChange={(e) => setLinkPhone(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border font-mono focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Initial Welcome Message</label>
                <textarea
                  rows={2}
                  value={linkInitMessage}
                  onChange={(e) => setLinkInitMessage(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-amber-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg shadow-sm"
                >
                  Link WhatsApp Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
