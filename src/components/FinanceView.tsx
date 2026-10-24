/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Plus,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FileSpreadsheet,
  Calendar,
  X,
  CheckCircle,
  Receipt
} from 'lucide-react';
import { ExpenseEntry, PaymentEntry, UserAccount } from '../types/index.ts';

interface FinanceViewProps {
  currentUser: UserAccount;
  payments: PaymentEntry[];
  expenses: ExpenseEntry[];
  financialSummary: {
    authorized: boolean;
    error?: string;
    grossRevenuePKR?: number;
    totalCollectedPKR?: number;
    pendingReceivablesPKR?: number;
    totalCogsPKR?: number;
    totalOperatingExpensesPKR?: number;
    netProfitPKR?: number;
    profitMarginPercent?: string;
    ordersCount?: number;
    averageOrderValuePKR?: number;
  };
  onRecordExpense: (expense: Omit<ExpenseEntry, 'id'>) => void;
  onRecordPayment: (payment: Omit<PaymentEntry, 'id'>) => void;
  onSwitchToAdmin: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  currentUser,
  payments,
  expenses,
  financialSummary,
  onRecordExpense,
  onRecordPayment,
  onSwitchToAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'expenses'>('overview');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  // New Expense form
  const [expCategory, setExpCategory] = useState<ExpenseEntry['category']>('Tailor Master Wages');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(45000);
  const [expVendor, setExpVendor] = useState('Master Aslam Tailoring');
  const [expMethod, setExpMethod] = useState('Cash');

  // New Payment form
  const [payOrderNo, setPayOrderNo] = useState('ZS-2026-1044');
  const [payCustName, setPayCustName] = useState('Hamza Alvi');
  const [payAmount, setPayAmount] = useState<number>(63000);
  const [payType, setPayType] = useState<PaymentEntry['type']>('Balance Settlement');
  const [payMethod, setPayMethod] = useState<PaymentEntry['method']>('Raast / Online Bank');
  const [payRef, setPayRef] = useState('RAAST-992104');

  // Role check: If employee is logged in, block this view!
  if (currentUser.role === 'EMPLOYEE' || !financialSummary.authorized) {
    return (
      <div className="p-8 max-w-2xl mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-4 my-12">
        <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white font-serif-display">
          403 Access Denied · Administrative Financial Ledger
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
          Employee account (<strong>{currentUser.name}</strong>) does not have authorization to view business profit margins, master tailor wages, or operational expense ledgers.
        </p>
        <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-left text-xs font-mono text-neutral-400">
          <div>SECURITY ENFORCEMENT: API Data Layer / Role-Based Access Control</div>
          <div>STATUS: HTTP 403 Forbidden</div>
          <div>REQUIRED PRIVILEGE: [canViewProfits]</div>
        </div>
        <div className="pt-2">
          <button
            onClick={onSwitchToAdmin}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            Switch to Admin Demo Account to View Financials
          </button>
        </div>
      </div>
    );
  }

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim()) return;

    onRecordExpense({
      category: expCategory,
      description: expDesc.trim(),
      amountPKR: Number(expAmount),
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: expMethod,
      vendorName: expVendor.trim(),
      receiptNumber: `EXP-${Date.now().toString().slice(-5)}`,
      recordedBy: currentUser.name,
    });

    setIsAddExpenseOpen(false);
    setExpDesc('');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onRecordPayment({
      orderNumber: payOrderNo.trim(),
      customerName: payCustName.trim(),
      amountPKR: Number(payAmount),
      type: payType,
      method: payMethod,
      referenceNumber: payRef.trim() || `REF-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      recordedBy: currentUser.name,
    });

    setIsAddPaymentOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-serif-display">
            Financial Ledger &amp; Profit Margins
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gross revenues, Cost of Goods Sold (COGS), tailoring wages and net atelier profits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddPaymentOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Gross Revenue (PKR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono-numbers">
            Rs. {(financialSummary.grossRevenuePKR ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            {financialSummary.ordersCount ?? 0} Bespoke Orders
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Cost of Goods (COGS)</span>
            <ArrowDownRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 font-mono-numbers">
            Rs. {(financialSummary.totalCogsPKR ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            Fabrics, wool &amp; linings cost
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Operating Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-400 font-mono-numbers">
            Rs. {(financialSummary.totalOperatingExpensesPKR ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            Tailor wages, rent, utilities
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Net Atelier Profit</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {financialSummary.profitMarginPercent ?? '0.0'}% Margin
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono-numbers">
            Rs. {(financialSummary.netProfitPKR ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            After all COGS &amp; overheads
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          P&amp;L Breakdown
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'payments'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Customer Payments ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'expenses'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Expenses Ledger ({expenses.length})
        </button>
      </div>

      {/* Tab 1: P&L Statement */}
      {activeTab === 'overview' && (
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">
            Atelier Income &amp; Expense Statement (PKR)
          </h2>

          <div className="divide-y divide-neutral-800/80 text-xs">
            <div className="py-2.5 flex justify-between font-semibold text-white">
              <span>Gross Sales &amp; Bespoke Revenue</span>
              <span className="font-mono text-emerald-400">Rs. {financialSummary.grossRevenuePKR?.toLocaleString()}</span>
            </div>

            <div className="py-2.5 flex justify-between text-neutral-300 pl-4">
              <span>Less: Direct Fabric &amp; Wool Procurement (COGS)</span>
              <span className="font-mono text-red-400">- Rs. {financialSummary.totalCogsPKR?.toLocaleString()}</span>
            </div>

            <div className="py-2.5 flex justify-between font-semibold text-neutral-200">
              <span>Gross Atelier Margin</span>
              <span className="font-mono text-white">
                Rs. {((financialSummary.grossRevenuePKR || 0) - (financialSummary.totalCogsPKR || 0)).toLocaleString()}
              </span>
            </div>

            <div className="py-2.5 flex justify-between text-neutral-300 pl-4">
              <span>Less: Master Tailor Artisan Wages</span>
              <span className="font-mono text-red-400">- Rs. 85,000</span>
            </div>

            <div className="py-2.5 flex justify-between text-neutral-300 pl-4">
              <span>Less: Showroom Rent &amp; LESCO Utilities</span>
              <span className="font-mono text-red-400">- Rs. 62,000</span>
            </div>

            <div className="py-2.5 flex justify-between text-neutral-300 pl-4">
              <span>Less: Packaging &amp; Garment Travel Covers</span>
              <span className="font-mono text-red-400">- Rs. 48,000</span>
            </div>

            <div className="py-3 flex justify-between font-bold text-sm text-emerald-400 border-t-2 border-neutral-700">
              <span>Net Atelier Operating Profit</span>
              <span className="font-mono">Rs. {financialSummary.netProfitPKR?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payments */}
      {activeTab === 'payments' && (
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-medium bg-neutral-950/60">
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Payment Type</th>
                  <th className="py-3.5 px-4">Channel / Method</th>
                  <th className="py-3.5 px-4">Reference #</th>
                  <th className="py-3.5 px-4 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                      No payment transactions recorded yet. Click <span className="text-emerald-400 font-semibold">&quot;Record Payment&quot;</span> above to log an advance or balance payment.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-800/40">
                      <td className="py-3.5 px-4 font-mono text-neutral-400">{p.date}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-medium">{p.orderNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{p.customerName}</td>
                      <td className="py-3.5 px-4">{p.type}</td>
                      <td className="py-3.5 px-4">{p.method}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400">{p.referenceNumber}</td>
                      <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-emerald-400">
                        Rs. {p.amountPKR.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Expenses */}
      {activeTab === 'expenses' && (
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-medium bg-neutral-950/60">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Vendor / Payee</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Receipt / Voucher</th>
                  <th className="py-3.5 px-4 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                      No operational expenses recorded yet. Click <span className="text-amber-400 font-semibold">&quot;Record Expense&quot;</span> above to log tailoring wages, fabric procurement, or overheads.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-neutral-800/40">
                      <td className="py-3.5 px-4 font-mono text-neutral-400">{e.date}</td>
                      <td className="py-3.5 px-4 font-medium text-amber-300">{e.category}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-neutral-300">{e.description}</td>
                      <td className="py-3.5 px-4 text-white">{e.vendorName}</td>
                      <td className="py-3.5 px-4">{e.paymentMethod}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400">{e.receiptNumber}</td>
                      <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-red-400">
                        Rs. {e.amountPKR.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-white">Record Atelier Operational Expense</h2>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-neutral-400 mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Tailor Master Wages">Tailor Master Wages</option>
                  <option value="Fabric & Lining Procurement">Fabric &amp; Lining Procurement</option>
                  <option value="Packaging & Suit Covers">Packaging &amp; Suit Covers</option>
                  <option value="Showroom Rent & Utilities">Showroom Rent &amp; Utilities</option>
                  <option value="Logistics & Courier">Logistics &amp; Courier</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Aslam cutting team weekly wages"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Payment Method</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / Raast</option>
                    <option value="Cheque">Crossed Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  required
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-white">Record Customer Payment</h2>
              <button
                onClick={() => setIsAddPaymentOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-neutral-400 mb-1">Order # Reference</label>
                <input
                  type="text"
                  required
                  value={payOrderNo}
                  onChange={(e) => setPayOrderNo(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={payCustName}
                  onChange={(e) => setPayCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Amount Received (PKR)</label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Payment Type</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Balance Settlement">Balance Settlement</option>
                    <option value="Advance Deposit">Advance Deposit</option>
                    <option value="Full Payment">Full Payment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Method / Channel</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Raast / Online Bank">Raast / Online Bank</option>
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="POS Debit/Credit Card">POS Debit/Credit Card</option>
                    <option value="Cash">Cash at Atelier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Transaction Ref / Slip #</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
