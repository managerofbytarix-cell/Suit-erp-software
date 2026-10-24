/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  Receipt,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  X,
  Clock,
  Filter,
  DollarSign
} from 'lucide-react';
import { Customer, Invoice, PaymentEntry, ThermalPrinterConfig, UserAccount } from '../types/index.ts';
import { PaymentReceiptModal } from './PaymentReceiptModal.tsx';

interface PaymentsViewProps {
  payments: PaymentEntry[];
  invoices: Invoice[];
  customers: Customer[];
  currentUser: UserAccount;
  printerConfig: ThermalPrinterConfig;
  onRecordPayment: (paymentData: any) => void;
  onRecordInvoicePayment: (invoiceNumber: string, amount: number, method: string, ref: string, notes: string) => void;
  isDarkMode: boolean;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  invoices,
  customers,
  currentUser,
  printerConfig,
  onRecordPayment,
  onRecordInvoicePayment,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'outstanding'>('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>('All');
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentEntry | null>(null);

  // New Payment Modal
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [amountInput, setAmountInput] = useState<number>(0);
  const [methodInput, setMethodInput] = useState<string>('Raast / Online Bank');
  const [refInput, setRefInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');

  // Calculations
  const totalReceivedPKR = payments.reduce((sum, p) => sum + p.amountPKR, 0);
  const totalReceivablesPKR = invoices.reduce((sum, i) => sum + i.balanceDuePKR, 0);
  const unpaidInvoices = invoices.filter((i) => i.balanceDuePKR > 0);

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.customerName.toLowerCase().includes(q) ||
      p.receiptNumber?.toLowerCase().includes(q) ||
      p.invoiceNumber?.toLowerCase().includes(q) ||
      p.referenceNumber.toLowerCase().includes(q) ||
      p.method.toLowerCase().includes(q);

    const matchMethod = selectedMethodFilter === 'All' || p.method === selectedMethodFilter;
    return matchSearch && matchMethod;
  });

  // Filter unpaid invoices
  const filteredUnpaid = unpaidInvoices.filter((i) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q) ||
      i.customerPhone.toLowerCase().includes(q) ||
      i.customerCity.toLowerCase().includes(q)
    );
  });

  const handleOpenAddPayment = (prefillInvoice?: Invoice) => {
    if (prefillInvoice) {
      setSelectedInvoiceNumber(prefillInvoice.invoiceNumber);
      setSelectedCustomerId(prefillInvoice.customerId);
      setAmountInput(prefillInvoice.balanceDuePKR);
      setNotesInput(`Settlement payment for ${prefillInvoice.invoiceNumber}`);
    } else if (unpaidInvoices.length > 0) {
      setSelectedInvoiceNumber(unpaidInvoices[0].invoiceNumber);
      setSelectedCustomerId(unpaidInvoices[0].customerId);
      setAmountInput(unpaidInvoices[0].balanceDuePKR);
      setNotesInput('');
    } else {
      setSelectedInvoiceNumber('');
      setSelectedCustomerId(customers[0]?.id || '');
      setAmountInput(10000);
      setNotesInput('');
    }
    setRefInput(`REF-${Date.now().toString().slice(-6)}`);
    setIsNewPaymentModalOpen(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountInput <= 0) return;

    if (selectedInvoiceNumber) {
      onRecordInvoicePayment(
        selectedInvoiceNumber,
        amountInput,
        methodInput,
        refInput.trim() || `REF-${Date.now().toString().slice(-6)}`,
        notesInput
      );
    } else {
      const cust = customers.find((c) => c.id === selectedCustomerId) || customers[0];
      onRecordPayment({
        receiptNumber: `RCP-2026-${1000 + payments.length + 1}`,
        invoiceNumber: 'GENERAL_CREDIT',
        orderNumber: 'GENERAL',
        customerId: cust?.id || 'cust_gen',
        customerName: cust?.name || 'Valued Client',
        amountPKR: amountInput,
        type: 'General Deposit',
        method: methodInput,
        referenceNumber: refInput.trim() || `REF-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        notes: notesInput,
        recordedBy: currentUser.name,
      });
    }

    setIsNewPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold mb-1">
            <CreditCard className="w-4 h-4" />
            <span>PAYMENT TRACKING &amp; RECEIVABLES RECONCILIATION</span>
          </div>
          <h1 className={`text-xl md:text-2xl font-bold font-serif-display ${
            isDarkMode ? 'text-white' : 'text-stone-900'
          }`}>
            Customer Payments &amp; Accounts Receivable
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Track client advance deposits, balance settlements, partial payments, and generate printable payment receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddPayment()}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Customer Payment</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Payments Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-500">
            Rs. {totalReceivedPKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {payments.length} transactions recorded
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Outstanding Receivables</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            Rs. {totalReceivablesPKR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pending client balances across all invoices
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Unpaid &amp; Partial Invoices</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {unpaidInvoices.length} Invoices
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Awaiting full settlement
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tab buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                  : isDarkMode ? 'text-slate-400 hover:text-white bg-[#090E18]' : 'text-stone-600 hover:text-stone-900 bg-stone-100'
              }`}
            >
              Payment History ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('outstanding')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'outstanding'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : isDarkMode ? 'text-slate-400 hover:text-white bg-[#090E18]' : 'text-stone-600 hover:text-stone-900 bg-stone-100'
              }`}
            >
              <span>Unpaid Invoices</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[10px] font-mono">
                {unpaidInvoices.length}
              </span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, receipt #, invoice..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-none ${
                isDarkMode
                  ? 'bg-[#090E18] border-[#182338] text-white focus:border-[#D4AF37]'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: PAYMENT HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className={`rounded-xl border overflow-hidden transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-medium ${
                  isDarkMode ? 'border-[#182338] text-slate-400 bg-[#090E18]' : 'border-stone-200 text-stone-500 bg-stone-50'
                }`}>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Payment Type</th>
                  <th className="py-3 px-4">Method / Channel</th>
                  <th className="py-3 px-4">Reference Slip #</th>
                  <th className="py-3 px-4 text-right">Amount (PKR)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'
              }`}>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No payment records found. Click &quot;Record Customer Payment&quot; above to log a payment.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                      <td className="py-3 px-4 font-mono font-bold text-[#E6CA85]">
                        {p.receiptNumber || `RCP-${p.id.slice(-6)}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {p.date}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-400">
                        {p.invoiceNumber}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {p.customerName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-slate-300">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.method}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {p.referenceNumber}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-500">
                        Rs. {p.amountPKR.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForReceipt(p)}
                          className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 transition-colors"
                          title="Print Customer Payment Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: UNPAID & PARTIAL INVOICES TABLE */}
      {activeTab === 'outstanding' && (
        <div className={`rounded-xl border overflow-hidden transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-medium ${
                  isDarkMode ? 'border-[#182338] text-slate-400 bg-[#090E18]' : 'border-stone-200 text-stone-500 bg-stone-50'
                }`}>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-right">Total Invoiced</th>
                  <th className="py-3 px-4 text-right">Paid So Far</th>
                  <th className="py-3 px-4 text-right">Outstanding Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Settle Payment</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'
              }`}>
                {filteredUnpaid.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-emerald-400 font-semibold">
                      Excellent! There are zero outstanding invoices. All client balances are paid in full.
                    </td>
                  </tr>
                ) : (
                  filteredUnpaid.map((inv) => (
                    <tr key={inv.id} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                      <td className="py-3 px-4 font-mono font-bold text-[#E6CA85]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {inv.date}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {inv.dueDate}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {inv.customerName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {inv.customerPhone}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>
                        Rs. {inv.grandTotalPKR.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-500">
                        Rs. {inv.paidAmountPKR.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                        Rs. {inv.balanceDuePKR.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950 text-amber-400 border border-amber-800">
                          {inv.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenAddPayment(inv)}
                          className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg shadow-xs transition-colors"
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isNewPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-bold font-serif-display flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Record Customer Payment Receipt</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsNewPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3">
              {/* Select Invoice */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Apply Payment to Invoice (Optional)</label>
                <select
                  value={selectedInvoiceNumber}
                  onChange={(e) => {
                    const invNo = e.target.value;
                    setSelectedInvoiceNumber(invNo);
                    const found = invoices.find((i) => i.invoiceNumber === invNo);
                    if (found) {
                      setAmountInput(found.balanceDuePKR);
                      setSelectedCustomerId(found.customerId);
                    }
                  }}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- General Payment / Credit --</option>
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} - {inv.customerName} (Due: Rs. {inv.balanceDuePKR.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedInvoiceNumber && (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Select Customer Account</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city} - {c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Payment Amount (PKR)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Payment Method / Channel</label>
                <select
                  value={methodInput}
                  onChange={(e) => setMethodInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Raast / Online Bank">Raast / Online Bank</option>
                  <option value="Cash at Atelier">Cash at Atelier</option>
                  <option value="POS Debit/Credit Card">POS Debit/Credit Card</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Cheque">Crossed Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Reference Slip # / Transaction ID</label>
                <input
                  type="text"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="e.g. RAAST-8812049"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Receipt Notes</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Received at fitting room"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewPaymentModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg shadow-sm"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT PAYMENT RECEIPT MODAL */}
      <PaymentReceiptModal
        payment={selectedPaymentForReceipt}
        printerConfig={printerConfig}
        currentUser={currentUser}
        onClose={() => setSelectedPaymentForReceipt(null)}
      />
    </div>
  );
};
