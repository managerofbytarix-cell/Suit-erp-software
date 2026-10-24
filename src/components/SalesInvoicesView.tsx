/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Printer,
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  Download,
  Scissors,
  Package,
  Layers,
  ArrowUpRight,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Customer, Invoice, OrderItem, PaymentStatus, Product, SaleType, ThermalPrinterConfig, UserAccount } from '../types/index.ts';
import { InvoicePrintModal } from './InvoicePrintModal.tsx';
import { exportAllBusinessDataToExcel } from '../utils/excelExport.ts';

interface SalesInvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  printerConfig: ThermalPrinterConfig;
  currentUser: UserAccount;
  onRecordSale: (saleData: any) => void;
  onRecordInvoicePayment: (invoiceNumber: string, amount: number, method: string, ref: string, notes: string) => void;
  onRecordPrint: (invoiceId: string, format: 'A4' | '80mm') => void;
  onExportExcel: () => void;
  isDarkMode: boolean;
}

export const SalesInvoicesView: React.FC<SalesInvoicesViewProps> = ({
  invoices,
  customers,
  products,
  printerConfig,
  currentUser,
  onRecordSale,
  onRecordInvoicePayment,
  onRecordPrint,
  onExportExcel,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Unpaid'>('All');
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('All');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // New Sale / Invoice Modal
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('Bank Transfer / Raast');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // New Sale Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [isNewCustomer, setIsNewCustomer] = useState(customers.length === 0);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('+92 300 ');
  const [custCity, setCustCity] = useState('Lahore');
  const [custAddress, setCustAddress] = useState('');
  const [saleType, setSaleType] = useState<SaleType>('ready_made');

  const [saleItems, setSaleItems] = useState<OrderItem[]>([
    {
      productId: products[0]?.id || '',
      productCode: products[0]?.code || '',
      title: products[0]?.title || '',
      fabric: products[0]?.fabric || '',
      color: products[0]?.color || '',
      sizeOrTailoring: 'Bespoke',
      quantity: 1,
      unitPricePKR: products[0]?.pricePKR || 0,
      costPKR: products[0]?.costPKR || 0,
      totalPricePKR: products[0]?.pricePKR || 0,
    },
  ]);

  const [tailoringFee, setTailoringFee] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(products[0]?.pricePKR || 0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer / Raast');
  const [deliveryDate, setDeliveryDate] = useState<string>(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10));
  const [eventDate, setEventDate] = useState<string>('');
  const [isRushOrder, setIsRushOrder] = useState<boolean>(false);
  const [saleNotes, setSaleNotes] = useState<string>('');

  // Calculations
  const itemsSubtotal = saleItems.reduce((sum, it) => sum + it.totalPricePKR, 0);
  const grandTotal = Math.max(0, itemsSubtotal + tailoringFee + taxAmount - discountAmount);
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  // Filter Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      (currentUser.permissions.canViewCustomerPhone && inv.customerPhone.toLowerCase().includes(q)) ||
      inv.customerCity.toLowerCase().includes(q) ||
      inv.items.some((it) => it.title.toLowerCase().includes(q) || it.productCode.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;
    const matchType = saleTypeFilter === 'All' || inv.saleType === saleTypeFilter;

    return matchSearch && matchStatus && matchType;
  });

  // KPI Metrics for Sales
  const totalSalesRevenue = invoices.reduce((sum, i) => sum + i.grandTotalPKR, 0);
  const totalPaidRevenue = invoices.reduce((sum, i) => sum + i.paidAmountPKR, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.balanceDuePKR, 0);
  const unpaidCount = invoices.filter((i) => i.balanceDuePKR > 0).length;

  const handleOpenPaymentModal = (inv: Invoice) => {
    setPaymentTargetInvoice(inv);
    setPayAmount(inv.balanceDuePKR);
    setPayMethod('Bank Transfer / Raast');
    setPayRef(`REF-${Date.now().toString().slice(-6)}`);
    setPayNotes(`Balance settlement for ${inv.invoiceNumber}`);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetInvoice || payAmount <= 0) return;
    onRecordInvoicePayment(
      paymentTargetInvoice.invoiceNumber,
      payAmount,
      payMethod,
      payRef,
      payNotes
    );
    setIsPaymentModalOpen(false);
    setPaymentTargetInvoice(null);
  };

  const handleAddItem = () => {
    const firstP = products[0];
    setSaleItems([
      ...saleItems,
      {
        productId: firstP?.id || '',
        productCode: firstP?.code || '',
        title: firstP?.title || '',
        fabric: firstP?.fabric || '',
        color: firstP?.color || '',
        sizeOrTailoring: 'Custom',
        quantity: 1,
        unitPricePKR: firstP?.pricePKR || 0,
        costPKR: firstP?.costPKR || 0,
        totalPricePKR: firstP?.pricePKR || 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (saleItems.length <= 1) return;
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleItemFieldChange = (index: number, field: keyof OrderItem, val: any) => {
    const updated = [...saleItems];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === val);
      if (prod) {
        updated[index].productId = prod.id;
        updated[index].productCode = prod.code;
        updated[index].title = prod.title;
        updated[index].fabric = prod.fabric;
        updated[index].color = prod.color;
        updated[index].unitPricePKR = prod.pricePKR;
        updated[index].costPKR = prod.costPKR;
        updated[index].totalPricePKR = prod.pricePKR * updated[index].quantity;
      }
    } else if (field === 'quantity') {
      const q = Math.max(1, Number(val));
      updated[index].quantity = q;
      updated[index].totalPricePKR = updated[index].unitPricePKR * q;
    } else if (field === 'unitPricePKR') {
      const p = Math.max(0, Number(val));
      updated[index].unitPricePKR = p;
      updated[index].totalPricePKR = p * updated[index].quantity;
    } else {
      (updated[index] as any)[field] = val;
    }
    setSaleItems(updated);
  };

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCustId = selectedCustomerId;
    let finalCustName = custName;
    let finalCustPhone = custPhone;
    let finalCustCity = custCity;
    let finalCustAddress = custAddress;

    if (!isNewCustomer && customers.length > 0) {
      const existing = customers.find((c) => c.id === selectedCustomerId);
      if (existing) {
        finalCustId = existing.id;
        finalCustName = existing.name;
        finalCustPhone = existing.phone;
        finalCustCity = existing.city;
        finalCustAddress = existing.address;
      }
    }

    onRecordSale({
      customerId: finalCustId,
      customerName: finalCustName.trim() || 'Valued Client',
      customerPhone: finalCustPhone.trim(),
      customerCity: finalCustCity.trim(),
      customerAddress: finalCustAddress.trim() || `${finalCustCity}, Pakistan`,
      saleType,
      items: saleItems,
      subtotalPKR: itemsSubtotal,
      tailoringFeePKR: tailoringFee,
      discountPKR: discountAmount,
      taxPKR: taxAmount,
      grandTotalPKR: grandTotal,
      paidAmountPKR: advancePaid,
      balanceDuePKR: balanceDue,
      paymentMethod,
      deliveryDate,
      eventDate,
      isRushOrder,
      notes: saleNotes,
    });

    setIsNewSaleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold mb-1">
            <FileText className="w-4 h-4" />
            <span>SALES &amp; AUTOMATIC INVOICING ENGINE</span>
          </div>
          <h1 className={`text-xl md:text-2xl font-bold font-serif-display ${
            isDarkMode ? 'text-white' : 'text-stone-900'
          }`}>
            Sales Invoices &amp; Billing Ledger
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Ready-made suit sales, custom stitching orders, fabric sales &amp; alterations with instant A4 &amp; 80mm thermal printing.
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
            title="Export all sales and invoices to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export to Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (customers.length > 0 && !selectedCustomerId) {
                setSelectedCustomerId(customers[0].id);
              }
              setIsNewSaleModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#E6CA85] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Sale / Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Invoiced Sales</span>
            <FileText className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Rs. {totalSalesRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {invoices.length} Invoices generated
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Payments Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-500">
            Rs. {totalPaidRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cash, Raast, Card &amp; Online cleared
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Outstanding Customer Balances</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            Rs. {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {unpaidCount} unpaid / partial invoices
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Average Invoice Value</span>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Rs. {invoices.length > 0 ? Math.round(totalSalesRevenue / invoices.length).toLocaleString() : '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Average ticket size
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice # (e.g. INV-2026-1001), client, item, city..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none ${
                isDarkMode
                  ? 'bg-[#090E18] border-[#182338] text-white focus:border-[#D4AF37]'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['All', 'Paid', 'Partial', 'Unpaid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-xs'
                    : isDarkMode
                    ? 'bg-[#121A2C] text-slate-300 hover:bg-[#18233C]'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Sale Type Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
          <span className="text-slate-400 whitespace-nowrap text-[11px]">Type:</span>
          {[
            { id: 'All', label: 'All Sale Types' },
            { id: 'ready_made', label: 'Ready-Made Suit' },
            { id: 'custom_stitching', label: 'Bespoke Stitching' },
            { id: 'fabric', label: 'Fabric Sales' },
            { id: 'alteration', label: 'Alterations' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSaleTypeFilter(type.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                saleTypeFilter === type.id
                  ? 'bg-amber-500/20 text-[#E6CA85] border border-amber-500/40 font-semibold'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200 bg-[#090E18]'
                  : 'text-stone-600 hover:text-stone-900 bg-stone-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
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
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Sale Type</th>
                <th className="py-3 px-4">Items / Garments</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'
            }`}>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No invoices found. Click &quot;Record New Sale / Invoice&quot; to issue your first commercial invoice.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                    <td className="py-3 px-4 font-mono font-bold text-[#E6CA85]">
                      {inv.invoiceNumber}
                      {inv.orderNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">Order: #{inv.orderNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {inv.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {inv.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {inv.customerCity}   {currentUser.permissions.canViewCustomerPhone ? inv.customerPhone : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="capitalize text-[11px] font-medium text-slate-300">
                        {inv.saleType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {inv.items.map((it, idx) => (
                        <div key={idx} className="truncate text-slate-300">
                          {it.quantity}x {it.title}
                        </div>
                      ))}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                      Rs. {inv.grandTotalPKR.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-500 font-medium">
                      Rs. {inv.paidAmountPKR.toLocaleString()}
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
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Print Invoice Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="p-1.5 rounded-lg bg-[#D4AF37]/15 text-[#E6CA85] hover:bg-[#D4AF37]/25 transition-colors"
                          title="Print Invoice (A4 Paper or 80mm Thermal Receipt)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Add Payment Button if balance remaining */}
                        {inv.balanceDuePKR > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 transition-colors"
                            title="Record payment against this invoice"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && paymentTargetInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-xs space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-sm font-bold font-serif-display">
                  Record Payment against #{paymentTargetInvoice.invoiceNumber}
                </h2>
                <div className="text-[11px] text-slate-400">
                  Client: {paymentTargetInvoice.customerName}   Remaining: Rs. {paymentTargetInvoice.balanceDuePKR.toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Payment Amount Received (PKR)</label>
                <input
                  type="number"
                  min={1}
                  max={paymentTargetInvoice.balanceDuePKR}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Payment Method / Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Bank Transfer / Raast">Bank Transfer / Raast</option>
                  <option value="Cash at Atelier">Cash at Atelier</option>
                  <option value="POS Debit/Credit Card">POS Debit/Credit Card</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Cheque">Crossed Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Transaction Reference / Slip #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. RAAST-9912048 or Slip-120"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid in cash at fitting room"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg shadow-sm"
                >
                  Confirm &amp; Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD NEW SALE / INVOICE MODAL */}
      {isNewSaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
              <div>
                <h2 className="text-base font-bold text-white font-serif-display">
                  Record New Sale &amp; Generate Invoice
                </h2>
                <div className="text-xs text-slate-400">
                  Select sale type, client, garments, fabrics, costs, discounts &amp; payment
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewSaleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSale} className="p-6 space-y-4 overflow-y-auto text-xs bg-[#0E1524]">
              {/* Sale Type Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Select Sale Type:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ready_made', label: 'Ready-Made Suit' },
                    { id: 'custom_stitching', label: 'Bespoke Stitching' },
                    { id: 'fabric', label: 'Fabric Sale' },
                    { id: 'alteration', label: 'Alteration / Service' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSaleType(st.id as SaleType)}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        saleType === st.id
                          ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37] shadow-sm'
                          : 'bg-[#090E18] text-slate-300 border-[#182338] hover:border-slate-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Selector */}
              <div className="p-4 rounded-xl bg-[#080D17] border border-[#182338] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Client Information</span>
                  {customers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsNewCustomer(!isNewCustomer)}
                      className="text-[#D4AF37] hover:underline font-semibold"
                    >
                      {isNewCustomer ? 'Select Existing Client' : '+ New Client'}
                    </button>
                  )}
                </div>

                {!isNewCustomer && customers.length > 0 ? (
                  <div>
                    <label className="block text-slate-400 mb-1">Select Client Account</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city} - {c.phone})   Bal: Rs. {(c.remainingBalancePKR || 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Client Full Name</label>
                      <input
                        type="text"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="e.g. Tariq Bajwa"
                        className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+92 300 0000000"
                        className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={custCity}
                        onChange={(e) => setCustCity(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Delivery Address</label>
                      <input
                        type="text"
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                        placeholder="House, Street, Sector"
                        className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Sale Items &amp; Services</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {saleItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#080D17] border border-[#182338] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono">Item #{idx + 1}</span>
                      {saleItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 mb-1">Pick from Catalog (Or Type Below)</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemFieldChange(idx, 'productId', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code} - {p.title} (Rs. {p.pricePKR.toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Size / Custom Naap</label>
                        <input
                          type="text"
                          value={item.sizeOrTailoring}
                          onChange={(e) => handleItemFieldChange(idx, 'sizeOrTailoring', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemFieldChange(idx, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Unit Price (PKR)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPricePKR}
                          onChange={(e) => handleItemFieldChange(idx, 'unitPricePKR', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Direct Cost / COGS (PKR)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.costPKR}
                          onChange={(e) => handleItemFieldChange(idx, 'costPKR', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-xl bg-[#080D17] border border-[#182338] space-y-3">
                <span className="font-bold text-white text-xs uppercase tracking-wider block">Billing &amp; Payments</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Tailoring / Cutting Fee (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={tailoringFee}
                      onChange={(e) => setTailoringFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Discount (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tax / Courier (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Bank Transfer / Raast">Bank Transfer / Raast</option>
                      <option value="POS Card">POS Card Swipe</option>
                      <option value="Cash at Atelier">Cash at Atelier</option>
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Payment Received Now (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      max={grandTotal}
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#182338]">
                  <span>Grand Total: <strong className="text-white font-mono text-base">Rs. {grandTotal.toLocaleString()}</strong></span>
                  <span>Remaining Balance: <strong className="text-amber-400 font-mono text-base">Rs. {balanceDue.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Delivery date & Rush flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Delivery Target Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="rush-sale-check"
                    checked={isRushOrder}
                    onChange={(e) => setIsRushOrder(e.target.checked)}
                    className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="rush-sale-check" className="text-slate-300 font-medium cursor-pointer">
                    Prioritize as Rush Wedding Order
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Invoice Notes</label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="e.g. Horn buttons, peak lapel, bespoke fitting on Wednesday"
                  className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#182338]">
                <button
                  type="button"
                  onClick={() => setIsNewSaleModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-xl shadow-xs"
                >
                  Confirm &amp; Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE PRINT MODAL */}
      <InvoicePrintModal
        invoice={selectedInvoiceForPrint}
        printerConfig={printerConfig}
        currentUser={currentUser}
        onClose={() => setSelectedInvoiceForPrint(null)}
        onRecordPrint={onRecordPrint}
      />
    </div>
  );
};
