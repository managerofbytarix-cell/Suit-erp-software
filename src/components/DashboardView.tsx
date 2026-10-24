/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Scissors,
  Printer,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  FileText,
  CreditCard,
  FileSpreadsheet,
  TrendingDown,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Customer, ExpenseEntry, Invoice, Order, PaymentEntry, Product, UserAccount } from '../types/index.ts';

interface DashboardViewProps {
  orders: Order[];
  invoices: Invoice[];
  payments: PaymentEntry[];
  expenses: ExpenseEntry[];
  products: Product[];
  customers: Customer[];
  currentUser: UserAccount;
  onNavigateTab: (tab: string) => void;
  onOpenCreateOrder: () => void;
  onOpenNewSale: () => void;
  onOpenRecordPayment: () => void;
  onOpenRecordExpense: () => void;
  onOpenAddProduct: () => void;
  onSelectOrderForPrint: (order: Order) => void;
  onSelectInvoiceForPrint: (invoice: Invoice) => void;
  onStartTour: () => void;
  onExportExcel: () => void;
  isDarkMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  invoices,
  payments,
  expenses,
  products,
  customers,
  currentUser,
  onNavigateTab,
  onOpenCreateOrder,
  onOpenNewSale,
  onOpenRecordPayment,
  onOpenRecordExpense,
  onOpenAddProduct,
  onSelectOrderForPrint,
  onSelectInvoiceForPrint,
  onStartTour,
  onExportExcel,
  isDarkMode = true,
}) => {
  const [timeScope, setTimeScope] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Helper date filter
  const isDateInScope = (dateStr?: string) => {
    if (!dateStr) return true;
    const d = dateStr.slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    if (timeScope === 'today') return d === today;
    if (timeScope === 'week') {
      const diff = (new Date().getTime() - new Date(d).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 7;
    }
    if (timeScope === 'month') {
      return d.startsWith(new Date().toISOString().slice(0, 7));
    }
    return true; // all time
  };

  const scopedInvoices = invoices.filter((i) => isDateInScope(i.date));
  const scopedPayments = payments.filter((p) => isDateInScope(p.date));
  const scopedExpenses = expenses.filter((e) => isDateInScope(e.date));
  const scopedOrders = orders.filter((o) => isDateInScope(o.createdAt));

  // --- 1. CORE FINANCIAL DASHBOARD FIGURES ---
  const totalSalesPKR = scopedInvoices.reduce((sum, inv) => sum + inv.grandTotalPKR, 0);
  const totalPaymentsReceivedPKR = scopedPayments.reduce((sum, p) => sum + p.amountPKR, 0);
  const totalOutstandingPKR = scopedInvoices.reduce((sum, inv) => sum + inv.balanceDuePKR, 0);
  const totalExpensesPKR = scopedExpenses.reduce((sum, e) => sum + e.amountPKR, 0);

  // Direct COGS Calculation
  let totalCOGS = 0;
  for (const inv of scopedInvoices) {
    for (const it of inv.items) {
      if (it.costPKR) {
        totalCOGS += it.costPKR * (it.quantity || 1);
      } else {
        totalCOGS += (it.unitPricePKR || 0) * (it.quantity || 1) * 0.45;
      }
    }
  }
  const directExpenses = scopedExpenses.filter((e) => e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
  const operatingExpenses = scopedExpenses.filter((e) => !e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);

  const grossProfitPKR = totalSalesPKR - totalCOGS;
  const netProfitPKR = grossProfitPKR - operatingExpenses;

  // Suits & Stitching Counts
  const totalSuitsSold = scopedInvoices.reduce((count, inv) => {
    return count + inv.items.filter((it) => it.type === 'ready_made' || it.title.toLowerCase().includes('suit')).reduce((c, it) => c + it.quantity, 0);
  }, 0);

  const completedStitchingCount = scopedOrders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;
  const pendingStitchingCount = scopedOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Completed' && o.status !== 'Cancelled').length;

  // Today's metrics specifically
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySalesPKR = invoices.filter((i) => i.date === todayStr).reduce((sum, i) => sum + i.grandTotalPKR, 0);
  const todayExpensesPKR = expenses.filter((e) => e.date === todayStr).reduce((sum, e) => sum + e.amountPKR, 0);
  const todayPaymentsPKR = payments.filter((p) => p.date?.slice(0, 10) === todayStr).reduce((sum, p) => sum + p.amountPKR, 0);

  // This Week & This Month Financial Summaries
  const thisMonthPrefix = new Date().toISOString().slice(0, 7);
  const monthSalesPKR = invoices.filter((i) => i.date?.startsWith(thisMonthPrefix)).reduce((sum, i) => sum + i.grandTotalPKR, 0);
  const monthPaymentsPKR = payments.filter((p) => p.date?.slice(0, 7) === thisMonthPrefix).reduce((sum, p) => sum + p.amountPKR, 0);
  const monthExpensesPKR = expenses.filter((e) => e.date?.startsWith(thisMonthPrefix)).reduce((sum, e) => sum + e.amountPKR, 0);

  const lowStockProducts = products.filter((p) => p.stockQty <= p.minStockAlert);

  // Status breakdown for stitching queue
  const statusCounts: Record<string, number> = {
    'Fabric Cut': 0,
    'In Tailoring': 0,
    'Fitting Scheduled': 0,
    'Ready for Dispatch': 0,
    'Delivered': 0,
  };

  orders.forEach((o) => {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status] += 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Launcher Bar */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl border shadow-xs transition-colors ${
        isDarkMode
          ? 'bg-gradient-to-r from-[#0C1220] via-[#0E1626] to-[#141F36] border-[#182338]'
          : 'bg-gradient-to-r from-[#FDFCFB] via-[#FAF9F6] to-[#F5EFE6] border-[#E7E2D8]'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold mb-1 tracking-wide">
            <span>Commercial Atelier Center</span>
            <span aria-hidden="true">·</span>
            <span>Bespoke Tailoring &amp; Accounting System</span>
          </div>
          <h1 className={`text-xl md:text-2xl font-bold font-serif-display tracking-tight ${
            isDarkMode ? 'text-white' : 'text-stone-900'
          }`}>
            Executive Dashboard &amp; Financial Ledger
          </h1>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
            Logged in as <strong className={isDarkMode ? 'text-slate-200' : 'text-stone-900'}>{currentUser.name}</strong> ({currentUser.role}). Real-time sales, expenses, invoices, and automated profit calculations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Action: New Sale */}
          <button
            type="button"
            onClick={onOpenNewSale}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#E6CA85] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale / Invoice</span>
          </button>

          {/* Quick Action: New Bespoke Stitching Order */}
          <button
            type="button"
            onClick={onOpenCreateOrder}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isDarkMode
                ? 'text-slate-200 bg-[#121A2C] hover:bg-[#18233C] border-[#202E4A]'
                : 'text-stone-800 bg-white hover:bg-stone-50 border-stone-300'
            }`}
          >
            <Scissors className="w-4 h-4 text-[#D4AF37]" />
            <span>New Stitching Order</span>
          </button>

          {/* Quick Action: Record Payment */}
          <button
            type="button"
            onClick={onOpenRecordPayment}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isDarkMode
                ? 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800/40'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          {/* Quick Action: Record Expense */}
          <button
            type="button"
            onClick={onOpenRecordExpense}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isDarkMode
                ? 'text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/40'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Record Expense</span>
          </button>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={onExportExcel}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isDarkMode
                ? 'text-emerald-400 bg-[#121A2C] hover:bg-[#18233C] border-[#202E4A]'
                : 'text-emerald-700 bg-white hover:bg-stone-50 border-stone-300'
            }`}
            title="Export all business data to multi-sheet Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Scope Filter Switcher */}
      <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-semibold text-slate-300">Dashboard Timeframe:</span>
        </div>
        <div className="flex items-center gap-1 p-1 bg-[#090E18] rounded-lg border border-[#182338] text-xs">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'today', label: "Today's Figures" },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
          ].map((scope) => (
            <button
              key={scope.id}
              onClick={() => setTimeScope(scope.id as any)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timeScope === scope.id
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. PRIMARY KPI FINANCIAL STATS STRIP (Requirements from Section 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Sales (PKR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`mt-3 text-2xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Rs. {totalSalesPKR.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {scopedInvoices.length} Invoices issued
          </div>
        </div>

        {/* Total Payments Received */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Payments Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-emerald-500">
            Rs. {totalPaymentsReceivedPKR.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Actual cash flow collected
          </div>
        </div>

        {/* Total Outstanding Customer Balance */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Outstanding Customer Balances</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-amber-400">
            Rs. {totalOutstandingPKR.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Accounts receivable pending settlement
          </div>
        </div>

        {/* Total Profit (Net Profit & Gross Profit) */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Net Profit</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[#E6CA85]">
            Rs. {netProfitPKR.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>Gross: Rs. {grossProfitPKR.toLocaleString()}</span>
            <span className="text-emerald-400 font-mono font-bold">
              {totalSalesPKR > 0 ? ((netProfitPKR / totalSalesPKR) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL & WORKLOAD KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Business Expenses */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Business Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-400">
            Rs. {totalExpensesPKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Artisan wages, rent &amp; utilities
          </div>
        </div>

        {/* Total Suits Sold */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Suits Sold</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className={`mt-2 text-xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {totalSuitsSold} Suits
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Ready-to-wear garments sold
          </div>
        </div>

        {/* Stitching Orders Completed */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Stitching Orders Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">
            {completedStitchingCount} Completed
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Delivered to clients
          </div>
        </div>

        {/* Pending Stitching Orders */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Pending Stitching Orders</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-400">
            {pendingStitchingCount} In Progress
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cutting, tailoring &amp; fittings
          </div>
        </div>
      </div>

      {/* 3. TODAY'S & MONTHLY FINANCIAL SNAPSHOT BANNER */}
      <div className={`p-5 rounded-2xl border space-y-3 ${
        isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Today&apos;s vs. Monthly Financial Health
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('finance')}
            className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            <span>Detailed Financial P&amp;L</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-stone-200'}`}>
            <div className="text-slate-400 text-[11px]">Today&apos;s Sales Invoiced</div>
            <div className={`text-base font-bold font-mono mt-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Rs. {todaySalesPKR.toLocaleString()}
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-stone-200'}`}>
            <div className="text-slate-400 text-[11px]">Today&apos;s Cash Collected</div>
            <div className="text-base font-bold font-mono mt-1 text-emerald-500">
              Rs. {todayPaymentsPKR.toLocaleString()}
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-stone-200'}`}>
            <div className="text-slate-400 text-[11px]">Today&apos;s Business Expenses</div>
            <div className="text-base font-bold font-mono mt-1 text-rose-400">
              Rs. {todayExpensesPKR.toLocaleString()}
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-stone-200'}`}>
            <div className="text-slate-400 text-[11px]">This Month&apos;s Net Profit</div>
            <div className="text-base font-bold font-mono mt-1 text-[#E6CA85]">
              Rs. {(monthSalesPKR - (monthSalesPKR * 0.45 + monthExpensesPKR)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRODUCTION TAILORING STAGES QUEUE */}
      <div className={`p-5 rounded-2xl border space-y-3 transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="flex items-center justify-between">
          <div className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-stone-800'}`}>
            Bespoke Craftsmanship Tailoring Pipeline
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className={`text-xs font-semibold hover:underline ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#846227]'}`}
          >
            Manage Pipeline &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Fabric Cut', count: statusCounts['Fabric Cut'], darkClass: 'border-blue-500/30 bg-blue-500/10 text-blue-300', lightClass: 'border-blue-200 bg-blue-50 text-blue-800' },
            { label: 'In Tailoring', count: statusCounts['In Tailoring'], darkClass: 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E6CA85]', lightClass: 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#846227]' },
            { label: 'Trial Fitting', count: statusCounts['Fitting Scheduled'], darkClass: 'border-purple-500/30 bg-purple-500/10 text-purple-300', lightClass: 'border-purple-200 bg-purple-50 text-purple-800' },
            { label: 'Ready for Dispatch', count: statusCounts['Ready for Dispatch'], darkClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', lightClass: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
            { label: 'Delivered', count: statusCounts['Delivered'], darkClass: 'border-slate-800 bg-[#121A2C] text-slate-300', lightClass: 'border-stone-200 bg-stone-100 text-stone-700' },
          ].map((stage) => (
            <div
              key={stage.label}
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${isDarkMode ? stage.darkClass : stage.lightClass}`}
            >
              <div className="text-xs font-medium opacity-85">{stage.label}</div>
              <div className="text-xl font-bold font-mono mt-2">{stage.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. RECENT SALES & INVOICES TABLE */}
      <div className={`rounded-2xl border overflow-hidden transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-[#182338] bg-[#090E18]' : 'border-[#E7E2D8] bg-[#FAF9F6]'
        }`}>
          <div>
            <h2 className={`text-sm font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Recent Invoices &amp; Sales Transactions
            </h2>
            <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Live commercial sales ledger with invoice printing and payment settlement
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('sales_invoices')}
            className={`text-xs font-semibold hover:underline ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#846227]'}`}
          >
            View All Invoices &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-medium ${
                isDarkMode ? 'border-[#182338] text-slate-400 bg-[#0B101B]' : 'border-[#E7E2D8] text-stone-500 bg-[#F5F2EB]'
              }`}>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4 text-right">Total (PKR)</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Print</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-[#E7E2D8] text-stone-800'
            }`}>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No invoices recorded yet.
                  </td>
                </tr>
              ) : (
                invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                    <td className="py-3 px-4 font-mono font-bold text-[#E6CA85]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {inv.date}
                    </td>
                    <td className={`py-3 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-300">
                      {inv.saleType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                      {inv.items.map((it) => `${it.quantity}x ${it.title}`).join(', ')}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                      Rs. {inv.grandTotalPKR.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      inv.balanceDuePKR > 0 ? 'text-amber-400' : 'text-emerald-500'
                    }`}>
                      Rs. {inv.balanceDuePKR.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        inv.paymentStatus === 'Paid'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : inv.paymentStatus === 'Partial'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {inv.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectInvoiceForPrint(inv)}
                        className="p-1.5 rounded-lg bg-[#D4AF37]/15 text-[#E6CA85] hover:bg-[#D4AF37]/25 transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
