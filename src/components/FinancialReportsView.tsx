/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileSpreadsheet,
  Printer,
  FileText,
  CreditCard,
  Scissors,
  Users,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Download
} from 'lucide-react';
import { Customer, ExpenseCategory, ExpenseEntry, FinancialFilter, Invoice, Order, PaymentEntry, Product, UserAccount } from '../types/index.ts';
import { exportAllBusinessDataToExcel } from '../utils/excelExport.ts';

interface FinancialReportsViewProps {
  invoices: Invoice[];
  orders: Order[];
  customers: Customer[];
  payments: PaymentEntry[];
  expenses: ExpenseEntry[];
  expenseCategories: ExpenseCategory[];
  products: Product[];
  currentUser: UserAccount;
  onExportExcel: () => void;
  isDarkMode: boolean;
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  invoices,
  orders,
  customers,
  payments,
  expenses,
  expenseCategories,
  products,
  currentUser,
  onExportExcel,
  isDarkMode,
}) => {
  const [period, setPeriod] = useState<FinancialFilter['period']>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // e.g. "2026-10"
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Role Restriction Check: Employee cannot see owner profit margins
  if (currentUser.role === 'EMPLOYEE') {
    return (
      <div className={`p-8 max-w-xl mx-auto rounded-2xl border text-center space-y-4 my-12 ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8]'
      }`}>
        <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className={`text-lg font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
          403 Access Denied   Administrative Financial P&amp;L
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Salesperson account (<strong>{currentUser.name}</strong>) does not have authorization to view net profit margins, cost of goods, or atelier owner financial ledgers.
        </p>
      </div>
    );
  }

  // Filter helper
  const isDateInRange = (dateStr?: string) => {
    if (!dateStr) return true;
    const d = dateStr.slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    if (period === 'today') return d === today;
    if (period === 'weekly') {
      const diff = (new Date().getTime() - new Date(d).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 7;
    }
    if (period === 'monthly') return d.startsWith(selectedMonth);
    if (period === 'yearly') return d.startsWith(String(selectedYear));
    if (period === 'custom') {
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    }
    return true; // all time
  };

  // Filtered collections
  const filteredInvoices = useMemo(() => invoices.filter((i) => isDateInRange(i.date)), [invoices, period, selectedMonth, selectedYear, startDate, endDate]);
  const filteredOrders = useMemo(() => orders.filter((o) => isDateInRange(o.createdAt)), [orders, period, selectedMonth, selectedYear, startDate, endDate]);
  const filteredPayments = useMemo(() => payments.filter((p) => isDateInRange(p.date)), [payments, period, selectedMonth, selectedYear, startDate, endDate]);
  const filteredExpenses = useMemo(() => expenses.filter((e) => isDateInRange(e.date)), [expenses, period, selectedMonth, selectedYear, startDate, endDate]);

  // Aggregate Metrics
  const totalSalesRevenue = filteredInvoices.reduce((sum, i) => sum + i.grandTotalPKR, 0);
  const totalCashCollected = filteredPayments.reduce((sum, p) => sum + p.amountPKR, 0);
  const totalOutstandingReceivables = filteredInvoices.reduce((sum, i) => sum + i.balanceDuePKR, 0);

  // Direct Cost of Goods Sold (COGS)
  let totalCOGS = 0;
  for (const inv of filteredInvoices) {
    for (const item of inv.items) {
      if (item.costPKR) {
        totalCOGS += item.costPKR * (item.quantity || 1);
      } else {
        totalCOGS += (item.unitPricePKR || 0) * (item.quantity || 1) * 0.45;
      }
    }
  }
  const directExpenses = filteredExpenses.filter((e) => e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
  const operatingExpenses = filteredExpenses.filter((e) => !e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
  const totalBusinessExpenses = directExpenses + operatingExpenses;

  const grossProfit = totalSalesRevenue - totalCOGS;
  const grossProfitMargin = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1) : '0.0';
  const netProfit = grossProfit - operatingExpenses;
  const netProfitMargin = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : '0.0';

  const totalSuitsSold = filteredInvoices.reduce((count, inv) => {
    return count + inv.items.filter((it) => it.type === 'ready_made' || it.title.toLowerCase().includes('suit')).reduce((c, it) => c + it.quantity, 0);
  }, 0);

  const completedStitchingOrders = filteredOrders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;
  const pendingStitchingOrders = filteredOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Completed' && o.status !== 'Cancelled').length;

  // Customer Breakdown
  const customerBreakdown = useMemo(() => {
    const map = new Map<string, { customerId: string; name: string; city: string; sales: number; paid: number; balance: number; orderCount: number }>();
    filteredInvoices.forEach((inv) => {
      const existing = map.get(inv.customerId) || {
        customerId: inv.customerId,
        name: inv.customerName,
        city: inv.customerCity,
        sales: 0,
        paid: 0,
        balance: 0,
        orderCount: 0,
      };
      existing.sales += inv.grandTotalPKR;
      existing.paid += inv.paidAmountPKR;
      existing.balance += inv.balanceDuePKR;
      existing.orderCount += 1;
      map.set(inv.customerId, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.sales - a.sales);
  }, [filteredInvoices]);

  // Expense Category Breakdown
  const categoryBreakdown = useMemo(() => {
    return expenseCategories.map((cat) => {
      const catExps = filteredExpenses.filter((e) => e.category.toLowerCase() === cat.name.toLowerCase());
      const spent = catExps.reduce((sum, e) => sum + e.amountPKR, 0);
      return {
        name: cat.name,
        isDirectCost: cat.isDirectCost,
        count: catExps.length,
        totalPKR: spent,
        percentage: totalBusinessExpenses > 0 ? ((spent / totalBusinessExpenses) * 100).toFixed(1) : '0.0',
      };
    }).sort((a, b) => b.totalPKR - a.totalPKR);
  }, [expenseCategories, filteredExpenses, totalBusinessExpenses]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>ACCURATE ACCOUNTING &amp; FINANCIAL REPORTING</span>
          </div>
          <h1 className={`text-xl md:text-2xl font-bold font-serif-display ${
            isDarkMode ? 'text-white' : 'text-stone-900'
          }`}>
            Advanced Financial Reports &amp; Profit Ledger
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Accrual sales revenue vs. actual cash collected, direct COGS, gross and net profit margins, customer sales &amp; category breakdowns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onExportExcel}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
              isDarkMode
                ? 'bg-[#121A2C] hover:bg-[#18233C] text-emerald-400 border-[#202E4A]'
                : 'bg-white hover:bg-stone-50 text-emerald-700 border-stone-300'
            }`}
            title="Download full multi-sheet financial workbook (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export to Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
              isDarkMode
                ? 'bg-[#121A2C] hover:bg-[#18233C] text-[#E6CA85] border-[#202E4A]'
                : 'bg-white hover:bg-stone-50 text-[#846227] border-stone-300'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 bg-[#090E18] rounded-lg border border-[#182338] text-xs">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'weekly', label: 'This Week' },
              { id: 'monthly', label: 'Selected Month' },
              { id: 'yearly', label: 'Selected Year' },
              { id: 'custom', label: 'Custom Date Range' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  period === p.id
                    ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Conditional Sub-filters */}
          {period === 'monthly' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Choose Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-[#090E18] border border-[#182338] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          )}

          {period === 'yearly' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Choose Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 bg-[#090E18] border border-[#182338] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {period === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-[#090E18] border border-[#182338] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              <span className="text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-[#090E18] border border-[#182338] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Financial Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Revenue */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Sales Revenue</span>
            <FileText className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Rs. {totalSalesRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {filteredInvoices.length} Invoiced sales
          </div>
        </div>

        {/* Cash Collected */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Cash Payments Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-500">
            Rs. {totalCashCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Actual cash flow received
          </div>
        </div>

        {/* Accounts Receivable */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Outstanding Customer Balances</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            Rs. {totalOutstandingReceivables.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pending receivables
          </div>
        </div>

        {/* Net Profit */}
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Net Atelier Profit</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {netProfitMargin}% Margin
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            Rs. {netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            After COGS &amp; Overheads
          </div>
        </div>
      </div>

      {/* Secondary Operational Workload Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'}`}>
          <div className="text-[11px] text-slate-400">Total Ready-Made Suits Sold</div>
          <div className={`text-xl font-bold font-mono mt-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {totalSuitsSold} Suits
          </div>
        </div>
        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'}`}>
          <div className="text-[11px] text-slate-400">Stitching Orders Completed</div>
          <div className="text-xl font-bold font-mono mt-1 text-emerald-400">
            {completedStitchingOrders} Completed
          </div>
        </div>
        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'}`}>
          <div className="text-[11px] text-slate-400">Pending Stitching Queue</div>
          <div className="text-xl font-bold font-mono mt-1 text-amber-400">
            {pendingStitchingOrders} In Progress
          </div>
        </div>
        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'}`}>
          <div className="text-[11px] text-slate-400">Gross Profit (Pre-Overhead)</div>
          <div className="text-xl font-bold font-mono mt-1 text-[#E6CA85]">
            Rs. {grossProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* SECTION 1: DETAILED INCOME STATEMENT (P&L BREAKDOWN) */}
      <div className={`rounded-xl border p-6 space-y-4 transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="flex items-center justify-between border-b border-[#182338] pb-3">
          <div>
            <h2 className="text-sm font-bold font-serif-display text-white">
              Income Statement (Profit &amp; Loss Statement)
            </h2>
            <p className="text-[11px] text-slate-400">
              Clear distinction between sales revenue (accrual) and cash collected, direct COGS, and operating overheads.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#E6CA85]">
            Scope: {period.toUpperCase()}
          </span>
        </div>

        <div className="divide-y divide-[#182338]/80 text-xs">
          <div className="py-2.5 flex justify-between font-bold text-white">
            <span>1. Gross Sales Revenue (Invoiced Total)</span>
            <span className="font-mono text-emerald-400 text-sm">Rs. {totalSalesRevenue.toLocaleString()}</span>
          </div>

          <div className="py-2.5 flex justify-between text-slate-300 pl-6">
            <span>Less: Cost of Goods Sold (COGS: Suiting Fabric &amp; Artisan Labor)</span>
            <span className="font-mono text-rose-400">- Rs. {totalCOGS.toLocaleString()}</span>
          </div>

          <div className="py-2.5 flex justify-between font-bold text-[#E6CA85] pl-3 bg-[#090E18] rounded px-3">
            <span>2. Gross Profit (Revenue - COGS)</span>
            <span className="font-mono">Rs. {grossProfit.toLocaleString()} ({grossProfitMargin}%)</span>
          </div>

          <div className="py-2.5 flex justify-between text-slate-300 pl-6">
            <span>Less: Operating Overhead Expenses (Rent, LESCO Power, Maintenance)</span>
            <span className="font-mono text-rose-400">- Rs. {operatingExpenses.toLocaleString()}</span>
          </div>

          <div className="py-3 flex justify-between font-bold text-base text-emerald-400 border-t-2 border-[#182338] bg-emerald-950/20 px-3 rounded">
            <span>3. Net Atelier Profit</span>
            <span className="font-mono">Rs. {netProfit.toLocaleString()} ({netProfitMargin}%)</span>
          </div>

          <div className="py-2.5 flex justify-between text-slate-400 text-[11px] pt-3">
            <span>Actual Cash / Payments Received In Period:</span>
            <span className="font-mono text-emerald-400 font-semibold">Rs. {totalCashCollected.toLocaleString()}</span>
          </div>
          <div className="py-2.5 flex justify-between text-slate-400 text-[11px]">
            <span>Total Accounts Receivable (Pending Customer Balance):</span>
            <span className="font-mono text-amber-400 font-semibold">Rs. {totalOutstandingReceivables.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: CUSTOMER-WISE SALES & REVENUE RANKINGS */}
      <div className={`rounded-xl border overflow-hidden transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="p-4 border-b border-[#182338] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold font-serif-display text-white">
              Customer-Wise Sales &amp; Outstanding Balances
            </h2>
            <p className="text-[11px] text-slate-400">
              Ranked by total purchases, payments received, and remaining credit balance.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-medium ${
                isDarkMode ? 'border-[#182338] text-slate-400 bg-[#090E18]' : 'border-stone-200 text-stone-500 bg-stone-50'
              }`}>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-center">Invoices</th>
                <th className="py-3 px-4 text-right">Total Purchases (PKR)</th>
                <th className="py-3 px-4 text-right">Payments Made (PKR)</th>
                <th className="py-3 px-4 text-right">Remaining Balance (PKR)</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'
            }`}>
              {customerBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No customer transactions in this time range.
                  </td>
                </tr>
              ) : (
                customerBreakdown.map((cust) => (
                  <tr key={cust.customerId} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                    <td className={`py-3 px-4 font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {cust.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {cust.city}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {cust.orderCount}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                      Rs. {cust.sales.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      Rs. {cust.paid.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      cust.balance > 0 ? 'text-amber-400' : 'text-emerald-500'
                    }`}>
                      Rs. {cust.balance.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: EXPENSE CATEGORY BREAKDOWN */}
      <div className={`rounded-xl border overflow-hidden transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="p-4 border-b border-[#182338] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold font-serif-display text-white">
              Expense Category Breakdown &amp; Spending Share
            </h2>
            <p className="text-[11px] text-slate-400">
              Direct materials &amp; artisan labor vs. operating overheads.
            </p>
          </div>
          <div className="font-mono text-rose-400 text-xs font-bold">
            Total Spent: Rs. {totalBusinessExpenses.toLocaleString()}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-medium ${
                isDarkMode ? 'border-[#182338] text-slate-400 bg-[#090E18]' : 'border-stone-200 text-stone-500 bg-stone-50'
              }`}>
                <th className="py-3 px-4">Expense Category</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-center">Transactions</th>
                <th className="py-3 px-4 text-right">Total Spent (PKR)</th>
                <th className="py-3 px-4 text-right">Share of Expenses</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'
            }`}>
              {categoryBreakdown.map((cat, idx) => (
                <tr key={idx} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                  <td className="py-3 px-4 font-bold text-white">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      cat.isDirectCost
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                        : 'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                    }`}>
                      {cat.isDirectCost ? 'Direct COGS Cost' : 'Operating Overhead'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {cat.count}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                    Rs. {cat.totalPKR.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-300">
                    {cat.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
