/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Scissors,
  ShoppingBag,
  Users,
  Printer,
  CreditCard,
  Settings,
  RotateCcw,
  Sparkles,
  Shield,
  UserCheck,
  ChevronRight,
  X,
  Bot,
  Download,
  Upload,
  BookOpen,
  Lock,
  LogOut,
  FileText,
  DollarSign,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { UserAccount } from '../types/index.ts';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserAccount;
  businessName?: string;
  websiteUrl?: string;
  onOpenGuide?: () => void;
  onSwitchUser: () => void;
  onLogout?: () => void;
  onResetData: () => void;
  onStartTour: () => void;
  onOpenAI: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onExportExcel: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDarkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  businessName,
  websiteUrl,
  onOpenGuide,
  onSwitchUser,
  onLogout,
  onResetData,
  onStartTour,
  onOpenAI,
  onExportBackup,
  onImportBackup,
  onExportExcel,
  isMobileOpen,
  onCloseMobile,
  isDarkMode,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const allNavItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, adminOnly: true },
    { id: 'sales_invoices', label: 'Sales & Invoices', icon: FileText, adminOnly: false },
    { id: 'orders', label: 'Bespoke Stitching Orders', icon: ShoppingBag, adminOnly: false },
    { id: 'customers', label: 'Customers & Naap Directory', icon: Users, adminOnly: false },
    { id: 'payments', label: 'Payments & Receivables', icon: CreditCard, adminOnly: false },
    { id: 'expenses', label: 'Expense Management', icon: DollarSign, adminOnly: true },
    { id: 'finance', label: 'Financial Reports & P&L', icon: TrendingUp, adminOnly: true },
    { id: 'products', label: 'Suit Catalog & Fabrics', icon: Scissors, adminOnly: false },
    { id: 'thermal', label: 'Thermal Receipt Station', icon: Printer, adminOnly: false },
    { id: 'settings', label: 'Atelier Settings & Staff', icon: Settings, adminOnly: true },
    { id: 'audit', label: 'Audit Log & Security', icon: Shield, adminOnly: true },
  ];

  // Salesperson only sees those they use or are explicitly permitted in their account
  const visibleNavItems = isAdmin 
    ? allNavItems 
    : allNavItems.filter((item) => {
        if (item.adminOnly) return false;
        if (currentUser.permissions.allowedViews && currentUser.permissions.allowedViews.length > 0) {
          return currentUser.permissions.allowedViews.includes(item.id);
        }
        return ['orders', 'sales_invoices', 'products', 'customers', 'payments', 'thermal'].includes(item.id);
      });

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 border-r flex flex-col transition-all duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode
            ? 'bg-[#0B101B] border-[#182338] text-slate-100'
            : 'bg-[#FAF9F6] border-[#E7E2D8] text-stone-900 shadow-sm'
        }`}
      >
        {/* Brand header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${
          isDarkMode ? 'bg-[#070B14] border-[#182338]' : 'bg-white border-[#E7E2D8]'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold tracking-tight font-serif-display ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                {businessName?.trim() || 'Atelier ERP'}
              </span>
            </div>
            <div className="text-[10px] text-[#D4AF37] font-semibold tracking-[0.22em] uppercase mt-0.5">
              TAILORING ERP &amp; ACCOUNTING
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className={`p-1 rounded-lg lg:hidden ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Session & Quick Switch Card */}
        <div className={`px-4 py-3 border-b ${
          isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-[#F4F0E8] border-[#E7E2D8]'
        }`}>
          <div className={`p-2.5 rounded-xl border text-xs ${
            isDarkMode
              ? 'bg-[#0E1526] border-[#1C2942]'
              : 'bg-white border-[#E2DDD4] shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'ADMIN' ? 'bg-[#D4AF37] text-slate-950 shadow-xs' : 'bg-blue-600 text-white'
                }`}>
                  {currentUser.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className={`font-semibold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>
                    {currentUser.name}
                  </div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                    {currentUser.role === 'ADMIN' ? 'Owner / Master Tailor' : 'Floor Associate (Staff)'}
                  </div>
                </div>
              </div>
              <button
                onClick={onStartTour}
                className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                  isDarkMode
                    ? 'text-[#E6CA85] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border-[#D4AF37]/30'
                    : 'text-[#846227] bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border-[#D4AF37]/40 font-medium'
                }`}
                title="System Walkthrough Tour"
              >
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Tour</span>
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <button
                onClick={onSwitchUser}
                className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white bg-[#141C30] hover:bg-[#1A2540] border-[#22314E]'
                    : 'text-stone-700 hover:text-stone-900 bg-[#FAF8F5] hover:bg-[#F2ECE1] border-[#DDD6C8]'
                }`}
                title="Switch atelier account (Password required)"
              >
                <Lock className="w-3 h-3 text-[#D4AF37]" />
                <span>Switch User</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/40"
                  title="Lock session and log out"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 1-Click Excel Export & AI Assistant Launcher */}
        <div className="px-4 py-2 space-y-1.5">
          <button
            onClick={onExportExcel}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 transition-all text-xs font-bold"
            title="Export all data to Multi-Sheet Excel (.xlsx)"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export All to Excel (.xlsx)</span>
            </div>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={onOpenAI}
            className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-xs font-semibold group ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/10 to-transparent hover:from-[#D4AF37]/25 hover:to-[#D4AF37]/15 border-[#D4AF37]/35 text-[#E6CA85]'
                : 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent hover:from-[#D4AF37]/30 border-[#D4AF37]/50 text-[#846227]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="tracking-tight">Sartorial AI Manager</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </button>

          {onOpenGuide && (
            <button
              onClick={() => {
                onOpenGuide();
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-medium transition-all ${
                isDarkMode
                  ? 'bg-[#0E1526] hover:bg-[#141D32] text-slate-300 border-[#1C2942]'
                  : 'bg-white hover:bg-[#FAF8F5] text-stone-800 border-[#E2DDD4] shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Operating Manual</span>
              </div>
              <span className="text-[10px] text-[#D4AF37] font-mono">EN / Urdu</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all group ${
                  isActive
                    ? isDarkMode
                      ? 'bg-[#152037] text-[#E6CA85] font-semibold border border-[#273858] shadow-sm'
                      : 'bg-[#EDE5D6] text-[#6B4B1B] font-semibold border border-[#D8CBB6] shadow-xs'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-[#0E1526]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#F2ECE1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? isDarkMode ? 'text-[#E6CA85]' : 'text-[#846227]'
                      : isDarkMode ? 'text-slate-400 group-hover:text-[#D4AF37]' : 'text-stone-400 group-hover:text-[#846227]'
                  }`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer actions: Backup & Reset (Admin Only) */}
        {isAdmin && (
          <div className={`p-4 border-t space-y-2 ${
            isDarkMode ? 'border-[#19243A] bg-[#070B14]' : 'border-[#E8E2D8] bg-[#F7F4EE]'
          }`}>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportBackup}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-[#0E1526] hover:bg-[#141D32] text-slate-300 border-[#1C2942]'
                    : 'bg-white hover:bg-[#F2ECE1] text-stone-700 border-[#DDD6C8]'
                }`}
                title="Backup complete ERP database to JSON"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>JSON Backup</span>
              </button>
              <button
                onClick={onImportBackup}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-[#0E1526] hover:bg-[#141D32] text-slate-300 border-[#1C2942]'
                    : 'bg-white hover:bg-[#F2ECE1] text-stone-700 border-[#DDD6C8]'
                }`}
                title="Restore ERP database from JSON backup"
              >
                <Upload className="w-3 h-3 text-blue-400" />
                <span>JSON Restore</span>
              </button>
            </div>
            <button
              onClick={onResetData}
              className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isDarkMode
                  ? 'text-slate-400 hover:text-red-300 bg-[#0E1526] hover:bg-[#141D32] border-[#1C2942]'
                  : 'text-stone-500 hover:text-red-600 bg-white hover:bg-[#F2ECE1] border-[#DDD6C8]'
              }`}
              title="Reset database to default sample records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Factory Demo</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
