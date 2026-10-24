/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  FileSpreadsheet,
  Printer,
  Trash2,
  Edit2,
  FolderPlus,
  X,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { ExpenseCategory, ExpenseEntry, UserAccount } from '../types/index.ts';

interface ExpensesViewProps {
  expenses: ExpenseEntry[];
  expenseCategories: ExpenseCategory[];
  currentUser: UserAccount;
  onRecordExpense: (expense: Omit<ExpenseEntry, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onAddCategory: (name: string, description: string, isDirectCost: boolean) => void;
  onUpdateCategory: (id: string, updates: Partial<ExpenseCategory>) => void;
  onDeleteCategory: (id: string) => void;
  onExportExcel: () => void;
  isDarkMode: boolean;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  expenseCategories,
  currentUser,
  onRecordExpense,
  onDeleteExpense,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onExportExcel,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'categories'>('expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  // New Expense Modal
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<string>(expenseCategories[0]?.name || 'Tailor Master & Artisan Wages');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [expMethod, setExpMethod] = useState<string>('Cash');
  const [expVendor, setExpVendor] = useState('');
  const [expReceipt, setExpReceipt] = useState(`VCH-${Date.now().toString().slice(-5)}`);

  // Category Manager Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIsDirectCost, setNewCatIsDirectCost] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Calculations
  const totalExpensesPKR = expenses.reduce((sum, e) => sum + e.amountPKR, 0);
  const directCogsExpensesPKR = expenses.filter((e) => e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
  const operatingOverheadsPKR = expenses.filter((e) => !e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      exp.description.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q) ||
      exp.vendorName.toLowerCase().includes(q) ||
      exp.receiptNumber.toLowerCase().includes(q);

    const matchCat = selectedCatFilter === 'All' || exp.category === selectedCatFilter;

    // Time filter
    let matchTime = true;
    const d = exp.date;
    const today = new Date().toISOString().slice(0, 10);
    if (timeFilter === 'today') {
      matchTime = d === today;
    } else if (timeFilter === 'week') {
      const diff = (new Date().getTime() - new Date(d).getTime()) / (1000 * 3600 * 24);
      matchTime = diff >= 0 && diff <= 7;
    } else if (timeFilter === 'month') {
      matchTime = d.startsWith(new Date().toISOString().slice(0, 7));
    } else if (timeFilter === 'year') {
      matchTime = d.startsWith(new Date().getFullYear().toString());
    }

    return matchSearch && matchCat && matchTime;
  });

  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || expAmount <= 0) return;

    const catObj = expenseCategories.find((c) => c.name === expCategory);
    const isDirect = catObj ? catObj.isDirectCost : false;

    onRecordExpense({
      category: expCategory,
      description: expDesc.trim(),
      amountPKR: Number(expAmount),
      date: expDate,
      paymentMethod: expMethod,
      vendorName: expVendor.trim(),
      receiptNumber: expReceipt.trim() || `VCH-${Date.now().toString().slice(-5)}`,
      isDirectCost: isDirect,
      recordedBy: currentUser.name,
    });

    setIsAddExpenseModalOpen(false);
    setExpDesc('');
    setExpAmount(5000);
  };

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (editingCatId) {
      onUpdateCategory(editingCatId, {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        isDirectCost: newCatIsDirectCost,
      });
      setEditingCatId(null);
    } else {
      onAddCategory(newCatName.trim(), newCatDesc.trim(), newCatIsDirectCost);
    }

    setNewCatName('');
    setNewCatDesc('');
    setNewCatIsDirectCost(false);
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold mb-1">
            <DollarSign className="w-4 h-4" />
            <span>BUSINESS EXPENSE MANAGEMENT &amp; OVERHEADS</span>
          </div>
          <h1 className={`text-xl md:text-2xl font-bold font-serif-display ${
            isDarkMode ? 'text-white' : 'text-stone-900'
          }`}>
            Daily Business Expenses &amp; Cost Control
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Track artisan wages, fabric purchases, sewing materials, showroom rent, and manage unlimited custom expense categories.
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
            title="Export Expense Ledger to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export Expenses (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingCatId(null);
              setNewCatName('');
              setNewCatDesc('');
              setNewCatIsDirectCost(false);
              setIsCategoryModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
              isDarkMode
                ? 'bg-[#121A2C] hover:bg-[#18233C] text-[#E6CA85] border-[#202E4A]'
                : 'bg-white hover:bg-stone-50 text-[#846227] border-stone-300'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
            <span>Manage Categories</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setExpReceipt(`VCH-${Date.now().toString().slice(-5)}`);
              setIsAddExpenseModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#E6CA85] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Daily Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Business Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-500">
            Rs. {totalExpensesPKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {expenses.length} expense vouchers recorded
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Direct COGS Costs</span>
            <Tag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            Rs. {directCogsExpensesPKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Artisan wages, suiting wool, sewing materials
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Operating Overheads</span>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Rs. {operatingOverheadsPKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Showroom rent, electricity, maintenance, tea
          </div>
        </div>
      </div>

      {/* Tabs & Search / Filters */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                  : isDarkMode ? 'text-slate-400 hover:text-white bg-[#090E18]' : 'text-stone-600 hover:text-stone-900 bg-stone-100'
              }`}
            >
              Expenses Ledger ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all ${
                activeTab === 'categories'
                  ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                  : isDarkMode ? 'text-slate-400 hover:text-white bg-[#090E18]' : 'text-stone-600 hover:text-stone-900 bg-stone-100'
              }`}
            >
              Categories ({expenseCategories.length})
            </button>
          </div>

          {/* Timeframe Filter */}
          {activeTab === 'expenses' && (
            <div className="flex items-center gap-1 p-1 bg-[#090E18] rounded-lg border border-[#182338] text-xs">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'year', label: 'This Year' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeFilter(tf.id as any)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    timeFilter === tf.id
                      ? 'bg-[#D4AF37] text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search bar & Category Dropdown */}
        {activeTab === 'expenses' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses by description, payee, voucher #..."
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-none ${
                  isDarkMode
                    ? 'bg-[#090E18] border-[#182338] text-white focus:border-[#D4AF37]'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-500'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className={`px-3 py-1.5 text-xs rounded-lg border outline-none ${
                  isDarkMode
                    ? 'bg-[#090E18] border-[#182338] text-white focus:border-[#D4AF37]'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-500'
                }`}
              >
                <option value="All">All Categories</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: EXPENSES LEDGER TABLE */}
      {activeTab === 'expenses' && (
        <div className={`rounded-xl border overflow-hidden transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-medium ${
                  isDarkMode ? 'border-[#182338] text-slate-400 bg-[#090E18]' : 'border-stone-200 text-stone-500 bg-stone-50'
                }`}>
                  <th className="py-3 px-4">Voucher #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Vendor / Payee</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount (PKR)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'
              }`}>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No expenses found. Click &quot;Record Daily Expense&quot; above to log an expense.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                      <td className="py-3 px-4 font-mono font-bold text-[#E6CA85]">
                        {exp.receiptNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {exp.category}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          exp.isDirectCost
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                        }`}>
                          {exp.isDirectCost ? 'Direct COGS' : 'Overhead'}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-300">
                        {exp.description}
                      </td>
                      <td className={`py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {exp.vendorName}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {exp.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-500">
                        Rs. {exp.amountPKR.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {currentUser.role === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete expense voucher #${exp.receiptNumber} of Rs. ${exp.amountPKR.toLocaleString()}?`)) {
                                onDeleteExpense(exp.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950 transition-colors"
                            title="Delete Expense Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES MANAGEMENT TABLE */}
      {activeTab === 'categories' && (
        <div className={`rounded-xl border overflow-hidden transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="p-4 border-b border-[#182338] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-serif-display text-white">
                Custom Expense Categories
              </h2>
              <p className="text-[11px] text-slate-400">
                You can create unlimited custom categories for your shop and categorize them into Direct COGS or Operating Overhead.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingCatId(null);
                setNewCatName('');
                setNewCatDesc('');
                setNewCatIsDirectCost(false);
                setIsCategoryModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-lg shadow-sm text-xs"
            >
              + Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-medium ${
                  isDarkMode ? 'border-[#182338] text-slate-400 bg-[#090E18]' : 'border-stone-200 text-stone-500 bg-stone-50'
                }`}>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Transactions</th>
                  <th className="py-3 px-4 text-right">Total Spent (PKR)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'
              }`}>
                {expenseCategories.map((cat) => {
                  const catExps = expenses.filter((e) => e.category.toLowerCase() === cat.name.toLowerCase());
                  const catTotal = catExps.reduce((sum, e) => sum + e.amountPKR, 0);

                  return (
                    <tr key={cat.id} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                      <td className="py-3 px-4 font-bold text-white">
                        {cat.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          cat.isDirectCost
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                        }`}>
                          {cat.isDirectCost ? 'Direct COGS (Fabrics/Wages)' : 'Operating Overhead'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-sm">
                        {cat.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {catExps.length}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                        Rs. {catTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setNewCatName(cat.name);
                              setNewCatDesc(cat.description || '');
                              setNewCatIsDirectCost(cat.isDirectCost);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!cat.isDefault && currentUser.role === 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete custom category "${cat.name}"?`)) {
                                  onDeleteCategory(cat.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-bold font-serif-display">
                Record Daily Business Expense
              </h2>
              <button
                type="button"
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.isDirectCost ? '(Direct COGS)' : '(Overhead)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Expense Description / Purpose</label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. 50 meters Italian satin lining rolls or Master Aslam weekly wages"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Amount (PKR)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-sm font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Payment Method</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer / Raast">Bank Transfer / Raast</option>
                    <option value="POS Card">POS Card</option>
                    <option value="Cheque">Crossed Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Vendor / Payee</label>
                  <input
                    type="text"
                    required
                    value={expVendor}
                    onChange={(e) => setExpVendor(e.target.value)}
                    placeholder="e.g. Master Aslam or Metro Cash & Carry"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Voucher / Receipt Slip Reference</label>
                <input
                  type="text"
                  value={expReceipt}
                  onChange={(e) => setExpReceipt(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-bold font-serif-display">
                {editingCatId ? 'Edit Expense Category' : 'Create Custom Expense Category'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Embroidery & Tilla Artisans"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="e.g. Hand-crafted dabka and tilla thread artisan wages"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-200">
                  <input
                    type="checkbox"
                    checked={newCatIsDirectCost}
                    onChange={(e) => setNewCatIsDirectCost(e.target.checked)}
                    className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                  />
                  <span>Direct Cost of Goods Sold (COGS)</span>
                </label>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  Check this box if this category involves direct garment materials (fabric, linings, buttons, canvases) or tailor artisan labor. Unchecked means general operating overhead (rent, electricity, tea).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-lg shadow-sm"
                >
                  {editingCatId ? 'Save Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
