/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Menu, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight,
  CheckCircle,
  ExternalLink,
  Sun,
  Moon,
  Bot,
  HardDriveDownload,
  HardDriveUpload,
  Database,
  Globe,
  BookOpen,
  Lock,
  LogOut
} from 'lucide-react';
import { SystemNotification, UserAccount } from '../types/index.ts';

interface HeaderProps {
  currentTab: string;
  currentUser: UserAccount;
  notifications: SystemNotification[];
  businessName?: string;
  websiteUrl?: string;
  autoSaveEnabled?: boolean;
  onOpenGuide?: () => void;
  onMarkNotificationRead: (id: string) => void;
  onOpenMobileMenu: () => void;
  onStartTour: () => void;
  onSwitchUser: () => void;
  onLogout?: () => void;
  onNavigateTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenAIAssistant: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onExportExcel?: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive Dashboard', subtitle: 'Real-time sales, cash flow, profit & order pipeline' },
  sales_invoices: { title: 'Sales & Automatic Invoicing', subtitle: 'Ready-made suits, stitching, fabric & alterations' },
  orders: { title: 'Bespoke Stitching Orders', subtitle: 'Craftsmanship lifecycle, tailoring and delivery' },
  customers: { title: 'Customers & Naap Directory', subtitle: 'Bespoke tailor measurement cards & profiles' },
  payments: { title: 'Payment Tracking & Receivables', subtitle: 'Installment tracking, partial payments & receipts' },
  expenses: { title: 'Expense Management & Categories', subtitle: 'Daily expenses, tailor wages & custom categories' },
  finance: { title: 'Financial Reports & Profit Ledger', subtitle: 'Gross margin, COGS, operating overhead & net profit' },
  products: { title: 'Suit Catalogue & Fabric Stock', subtitle: 'Fabrics, inventory counts and pricing' },
  thermal: { title: 'Thermal Receipt Station (58mm / 80mm)', subtitle: 'Real print layouts for POS thermal rolls' },
  settings: { title: 'Atelier Settings & Access Control', subtitle: 'Hardware printer setup and staff access matrix' },
  audit: { title: 'System Audit Log & Security Trail', subtitle: 'Immutable chronological register of all atelier transactions' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  notifications,
  businessName,
  websiteUrl,
  autoSaveEnabled = true,
  onOpenGuide,
  onMarkNotificationRead,
  onOpenMobileMenu,
  onStartTour,
  onSwitchUser,
  onLogout,
  onNavigateTab,
  isDarkMode,
  onToggleTheme,
  onOpenAIAssistant,
  onExportBackup,
  onImportBackup,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.read);
  const currentTabInfo = TAB_TITLES[currentTab] || { title: 'Overview', subtitle: '' };

  const handleNotificationClick = (n: SystemNotification) => {
    onMarkNotificationRead(n.id);
    if (n.linkTab) {
      onNavigateTab(n.linkTab);
      setShowNotifications(false);
    }
  };

  const handleOpenWebsite = () => {
    if (!websiteUrl) return;
    let url = websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 backdrop-blur-md border-b transition-colors ${
      isDarkMode
        ? 'bg-[#0B101B]/95 border-[#182338] text-slate-100'
        : 'bg-[#FAF9F6]/95 border-[#E7E2D8] text-stone-900 shadow-xs'
    }`}>
      {/* Zone 1: Mobile toggle & Breadcrumb Trail */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className={`p-2 -ml-2 rounded-lg lg:hidden transition-colors ${
            isDarkMode ? 'text-slate-400 hover:text-white hover:bg-[#141C30]' : 'text-stone-500 hover:text-stone-900 hover:bg-[#EDE5D6]'
          }`}
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className={`font-serif-display text-base tracking-tight font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {businessName?.trim() || 'Atelier ERP'}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-600' : 'text-stone-400'}`} />
          <span className="text-[#D4AF37] font-semibold tracking-tight">{currentTabInfo.title}</span>
        </div>
      </div>

      {/* Zone 2: Auto-Saved State, Website Link & Role Switcher */}
      <div className="hidden md:flex items-center gap-4">
        {/* Direct Website Link Button */}
        {websiteUrl && (
          <button
            onClick={handleOpenWebsite}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
              isDarkMode
                ? 'bg-[#101728] hover:bg-[#162138] text-blue-300 border-[#1F2C45]'
                : 'bg-white hover:bg-[#EDE5D6] text-blue-800 border-[#E2DDD4]'
            }`}
            title={`Open configured website: ${websiteUrl}`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Website</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </button>
        )}

        {/* Clean unboxed auto-save metadata */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <CheckCircle className={`w-3.5 h-3.5 ${autoSaveEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>Storage</span>
          <span aria-hidden="true">·</span>
          <span className={autoSaveEnabled ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
            {autoSaveEnabled ? 'Auto-Save Active' : 'Manual Save'}
          </span>
        </div>

        {/* Role toggle */}
        <button
          onClick={onSwitchUser}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
            currentUser.role === 'ADMIN'
              ? isDarkMode
                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#E6CA85] hover:bg-[#D4AF37]/20 font-medium'
                : 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#846227] hover:bg-[#D4AF37]/25 font-semibold'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
          }`}
          title="Click to switch between Admin (Full) and Employee (Restricted) views"
        >
          {currentUser.role === 'ADMIN' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span>Role: <strong>{currentUser.role}</strong></span>
        </button>
      </div>

      {/* Zone 3: User Guide, AI Assistant, Theme Toggle, Notifications */}
      <div className="flex items-center gap-2">
        {/* User Guide Button */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isDarkMode
                ? 'bg-[#101728] hover:bg-[#162138] text-[#E6CA85] border-[#1F2C45]'
                : 'bg-white hover:bg-[#EDE5D6] text-[#846227] border-[#E2DDD4]'
            }`}
            title="Open Software User Guide & Manual (English & Roman Urdu)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        )}
        {/* AI Assistant Launcher */}
        <button
          onClick={onOpenAIAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#D4AF37] text-slate-950 hover:bg-[#E6CA85] shadow-xs transition-all whitespace-nowrap shrink-0"
          title="Open AI Assistant"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border transition-colors ${
            isDarkMode
              ? 'bg-[#101728] border-[#1F2C45] text-[#D4AF37] hover:text-white'
              : 'bg-white border-[#E2DDD4] text-stone-700 hover:text-stone-900'
          }`}
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title="System notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50 text-xs ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-stone-200 text-stone-800'
            }`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b font-semibold ${
                isDarkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
              }`}>
                <span>System Notifications</span>
                <span className="text-[11px] text-amber-500 font-normal">
                  {unreadNotifs.length} unread
                </span>
              </div>
              <div className={`max-h-80 overflow-y-auto divide-y ${
                isDarkMode ? 'divide-neutral-800/60' : 'divide-stone-200'
              }`}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 cursor-pointer transition-colors ${
                        !n.read ? (isDarkMode ? 'bg-neutral-800/40' : 'bg-amber-50/60') : ''
                      } ${isDarkMode ? 'hover:bg-neutral-800/80' : 'hover:bg-stone-100'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{n.title}</span>
                        <span className="text-[10px] text-neutral-500">{n.timestamp}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-stone-600'}`}>
                        {n.message}
                      </p>
                      {n.linkTab && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-500">
                          <span>View in {n.linkTab}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Presentation Tour button */}
        <button
          onClick={onStartTour}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            isDarkMode
              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Walkthrough</span>
        </button>

        {/* Lock Session & Log Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/50'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
            title="Lock session and log out (Password strictly required to log in)"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
