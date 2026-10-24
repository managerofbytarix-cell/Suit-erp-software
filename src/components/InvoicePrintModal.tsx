/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Receipt,
  Download,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Scissors
} from 'lucide-react';
import { Invoice, ThermalPrinterConfig, UserAccount } from '../types/index.ts';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  printerConfig: ThermalPrinterConfig;
  currentUser: UserAccount;
  onClose: () => void;
  onRecordPrint: (invoiceId: string, format: 'A4' | '80mm') => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  printerConfig,
  currentUser,
  onClose,
  onRecordPrint,
}) => {
  const [printFormat, setPrintFormat] = useState<'A4' | '80mm'>('A4');
  const [isPrinting, setIsPrinting] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    onRecordPrint(invoice.id, printFormat);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 250);
  };

  const businessName = printerConfig.businessName || 'Zubair & Sons Bespoke Tailors';
  const tagline = printerConfig.tagline || 'Master Tailors & Fine Bespoke Attire Since 1988';
  const address = printerConfig.address || 'Shop 12-14, Pace Shopping Mall, Main Boulevard, Gulberg III';
  const city = printerConfig.city || 'Lahore, Pakistan';
  const phone = printerConfig.phone || '+92 300 8472910';
  const websiteUrl = printerConfig.websiteUrl || 'https://www.zubairtailors.com';
  const ntnNumber = printerConfig.ntnNumber || 'PK-NTN: 3894102-7';
  const footerNote = printerConfig.footerNote || 'Bespoke garments strictly handcrafted to individual client specifications. Alterations honoured within 14 days of delivery. Thank you for your distinguished patronage.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="w-full max-w-4xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs print:border-none print:shadow-none print:max-w-none print:max-h-none print:bg-white print:text-black">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-serif-display">
                  Official Invoice #{invoice.invoiceNumber}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  invoice.paymentStatus === 'Paid'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : invoice.paymentStatus === 'Partial'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {invoice.paymentStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Switch layout between Full Commercial A4 and 80mm Thermal Slip. Re-printing will never duplicate records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Format toggle */}
            <div className="flex items-center p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('A4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  printFormat === 'A4'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Paper Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('80mm')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  printFormat === '80mm'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>80mm Thermal Receipt</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {printFormat} Invoice</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-950/80 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          {printFormat === 'A4' ? (
            /* ========================================================
               A4 COMMERCIAL TAILORING INVOICE TEMPLATE
               ======================================================== */
            <div
              id="invoice-printable-area"
              className="w-full max-w-[780px] bg-white text-stone-900 p-8 sm:p-12 shadow-2xl rounded-sm font-sans text-xs print:shadow-none print:p-6 print:w-full print:max-w-none"
              style={{ minHeight: '1020px' }}
            >
              {/* Top Header & Branding */}
              <div className="flex justify-between items-start border-b-2 border-stone-800 pb-6 mb-6">
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-stone-900 text-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold">
                      Z
                    </div>
                    <div>
                      <h1 className="text-xl font-bold font-serif tracking-tight text-stone-900 uppercase">
                        {businessName}
                      </h1>
                      <div className="text-[10px] tracking-[0.2em] uppercase text-stone-500 font-semibold">
                        {tagline}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-0.5 pt-1">
                    <div>{address}, {city}</div>
                    <div className="flex items-center gap-3">
                      <span>Tel: {phone}</span>
                      <span>NTN: {ntnNumber}</span>
                    </div>
                    {websiteUrl && (
                      <div className="text-stone-700 font-medium">Web: {websiteUrl}</div>
                    )}
                  </div>
                </div>

                {/* Invoice Meta Box */}
                <div className="text-right space-y-1">
                  <div className="inline-block px-3 py-1 bg-stone-900 text-white font-mono text-xs font-bold uppercase tracking-wider rounded">
                    TAX INVOICE
                  </div>
                  <div className="text-base font-bold font-mono text-stone-900 mt-2">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Issue Date: <strong className="text-stone-800 font-mono">{invoice.date}</strong>
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Due Date: <strong className="text-stone-800 font-mono">{invoice.dueDate}</strong>
                  </div>
                  {invoice.orderNumber && (
                    <div className="text-stone-500 text-[11px]">
                      Stitching Ref: <strong className="text-stone-800 font-mono">#{invoice.orderNumber}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Bill To Customer Information Box */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-stone-50 border border-stone-200 rounded-lg mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">
                    Billed To (Client):
                  </div>
                  <div className="text-sm font-bold text-stone-900 font-serif">
                    {invoice.customerName}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Phone: <span className="font-mono">{invoice.customerPhone}</span>
                  </div>
                  <div className="text-[11px] text-stone-600">
                    City: {invoice.customerCity}
                  </div>
                  <div className="text-[11px] text-stone-600">
                    Address: {invoice.customerAddress}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">
                    Payment Terms &amp; Status:
                  </div>
                  <div className="flex justify-end gap-1.5 items-center">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                      invoice.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : invoice.paymentStatus === 'Partial'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {invoice.paymentStatus === 'Paid' ? 'PAID IN FULL' : (invoice.paymentStatus === 'Partial' ? 'PARTIALLY PAID' : 'UNPAID / OUTSTANDING')}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    Payment Channel: <strong>{invoice.paymentMethod}</strong>
                  </div>
                  <div className="text-[11px] text-stone-600">
                    Sale Type: <strong className="capitalize">{invoice.saleType.replace('_', ' ')}</strong>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse mb-6">
                <thead>
                  <tr className="border-b-2 border-stone-800 bg-stone-100 text-stone-700 text-[11px] font-bold uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Item / Service Description</th>
                    <th className="py-2.5 px-3">Fabric &amp; Cut</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/60">
                      <td className="py-3 px-3 font-mono text-stone-500">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900">{item.title}</div>
                        {item.productCode && (
                          <div className="text-[10px] text-stone-500 font-mono">Code: {item.productCode}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        <div>{item.fabric || 'Bespoke Selection'}</div>
                        <div className="text-[10px] text-stone-500">{item.sizeOrTailoring || 'Custom Naap'}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">Rs. {item.unitPricePKR.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                        Rs. {item.totalPricePKR.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculations Box */}
              <div className="grid grid-cols-2 gap-6 pt-2 mb-8 border-t border-stone-200">
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-stone-500">
                    Atelier Notes &amp; Instructions:
                  </div>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded text-[11px] text-stone-700 leading-relaxed min-h-[64px]">
                    {invoice.notes || 'All bespoke garments require trial fitting before final delivery. Fabric inspections completed by cutting master.'}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Reprint Count: {invoice.printHistory?.length || 0} times   Original transaction unchanged.
                  </div>
                </div>

                <div className="space-y-1.5 text-stone-700">
                  <div className="flex justify-between py-1 text-xs">
                    <span>Items Subtotal:</span>
                    <span className="font-mono">Rs. {invoice.subtotalPKR.toLocaleString()}</span>
                  </div>
                  {invoice.tailoringFeePKR > 0 && (
                    <div className="flex justify-between py-1 text-xs">
                      <span>Bespoke Tailoring &amp; Stitching Fee:</span>
                      <span className="font-mono">Rs. {invoice.tailoringFeePKR.toLocaleString()}</span>
                    </div>
                  )}
                  {invoice.discountPKR > 0 && (
                    <div className="flex justify-between py-1 text-xs text-emerald-700 font-semibold">
                      <span>Special Discount:</span>
                      <span className="font-mono">- Rs. {invoice.discountPKR.toLocaleString()}</span>
                    </div>
                  )}
                  {invoice.taxPKR > 0 && (
                    <div className="flex justify-between py-1 text-xs">
                      <span>Sales Tax / Shipping:</span>
                      <span className="font-mono">Rs. {invoice.taxPKR.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-b-2 border-stone-800 text-sm font-bold text-stone-900">
                    <span>Grand Total:</span>
                    <span className="font-mono">Rs. {invoice.grandTotalPKR.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs text-emerald-800 font-semibold">
                    <span>Total Payments Received:</span>
                    <span className="font-mono">Rs. {invoice.paidAmountPKR.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between py-1 text-xs font-bold font-mono ${
                    invoice.balanceDuePKR > 0 ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    <span>Remaining Balance Due:</span>
                    <span>Rs. {invoice.balanceDuePKR.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Bank Details */}
              <div className="pt-6 border-t border-stone-200 mt-auto">
                <div className="grid grid-cols-3 gap-6 text-center text-[10px] text-stone-600 pt-6">
                  <div>
                    <div className="border-b border-stone-400 pb-1 mb-1 font-mono text-stone-800">
                      {currentUser.name}
                    </div>
                    <span>Prepared &amp; Verified By</span>
                  </div>
                  <div>
                    <div className="border-b border-stone-400 pb-1 mb-1 font-mono text-stone-800">
                      Master Cutter Sign
                    </div>
                    <span>Quality Assurance</span>
                  </div>
                  <div>
                    <div className="border-b border-stone-400 pb-1 mb-1 font-mono text-stone-800">
                      Client Acceptance Sign
                    </div>
                    <span>Client Signature</span>
                  </div>
                </div>

                <div className="text-[10px] text-center text-stone-500 mt-6 leading-tight border-t border-stone-200 pt-3">
                  {footerNote}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               80MM POS THERMAL RECEIPT SLIP TEMPLATE
               ======================================================== */
            <div
              id="invoice-printable-area"
              className="w-[360px] bg-white text-black p-4 font-mono text-[11px] leading-tight shadow-2xl rounded-sm border-t-8 border-neutral-300 selection:bg-neutral-300 print:shadow-none print:p-0 print:w-full"
              style={{ fontFamily: "'JetBrains Mono', Courier, monospace" }}
            >
              {/* Header */}
              <div className="text-center">
                <div className="font-bold text-sm tracking-wide uppercase">
                  {businessName}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-neutral-700 mt-0.5">
                  {tagline}
                </div>
                <div className="text-[9px] text-neutral-700 mt-0.5">
                  {address}
                </div>
                <div className="text-[9px] text-neutral-700">
                  {city}
                </div>
                <div className="text-[9px] text-neutral-700">
                  Tel: {phone}
                </div>
                {websiteUrl && (
                  <div className="text-[9px] font-medium text-neutral-900 mt-0.5">
                    Web: {websiteUrl}
                  </div>
                )}
                <div className="text-[9px] font-bold mt-0.5">
                  {ntnNumber}
                </div>
              </div>

              <div className="border-t border-dashed border-black my-2" />

              <div className="text-center font-bold text-xs uppercase tracking-wider">
                *** SALES INVOICE ***
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Meta */}
              <div className="text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>INVOICE #:</span>
                  <span className="font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{invoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>TARGET DUE:</span>
                  <span className="font-bold">{invoice.dueDate}</span>
                </div>
                {invoice.orderNumber && (
                  <div className="flex justify-between">
                    <span>ORDER REF:</span>
                    <span>#{invoice.orderNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>OPERATOR:</span>
                  <span>{currentUser.name}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Customer */}
              <div className="text-[10px] space-y-0.5">
                <div className="font-bold">CLIENT: {invoice.customerName}</div>
                <div>PHONE: {invoice.customerPhone}</div>
                <div>CITY: {invoice.customerCity}</div>
                <div className="truncate">ADDR: {invoice.customerAddress}</div>
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Items */}
              <div className="text-[10px]">
                <div className="flex justify-between font-bold border-b border-black pb-0.5 mb-1">
                  <span>ITEM / FABRIC</span>
                  <span>AMOUNT</span>
                </div>
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="mb-1.5">
                    <div className="flex justify-between font-semibold">
                      <span>{item.quantity}x {item.title}</span>
                      <span>Rs. {item.totalPricePKR.toLocaleString()}</span>
                    </div>
                    <div className="text-[9px] text-neutral-800">
                      {item.fabric} [{item.sizeOrTailoring}]
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-black my-2" />

              {/* Summary */}
              <div className="text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>Rs. {invoice.subtotalPKR.toLocaleString()}</span>
                </div>
                {invoice.tailoringFeePKR > 0 && (
                  <div className="flex justify-between">
                    <span>STITCHING / TAILORING:</span>
                    <span>Rs. {invoice.tailoringFeePKR.toLocaleString()}</span>
                  </div>
                )}
                {invoice.discountPKR > 0 && (
                  <div className="flex justify-between">
                    <span>DISCOUNT:</span>
                    <span>- Rs. {invoice.discountPKR.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-black pt-1 my-1 flex justify-between font-bold text-xs">
                  <span>TOTAL AMOUNT:</span>
                  <span>Rs. {invoice.grandTotalPKR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAID AMOUNT:</span>
                  <span>Rs. {invoice.paidAmountPKR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>REMAINING BALANCE:</span>
                  <span>Rs. {invoice.balanceDuePKR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>PAYMENT METHOD:</span>
                  <span>{invoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>PAYMENT STATUS:</span>
                  <span>{invoice.paymentStatus.toUpperCase()}</span>
                </div>
              </div>

              {invoice.notes && (
                <>
                  <div className="border-t border-dashed border-black my-2" />
                  <div className="text-[9px]">
                    <span className="font-bold">INSTRUCTIONS:</span><br />
                    {invoice.notes}
                  </div>
                </>
              )}

              <div className="border-t border-dashed border-black my-2" />

              <div className="text-[8px] text-center leading-tight text-neutral-700">
                {footerNote}
              </div>

              {/* Barcode Emulation */}
              <div className="text-center pt-2">
                <div className="font-mono text-sm tracking-widest font-bold">
                  ||||| | |||| |||||| || |
                </div>
                <div className="text-[9px] tracking-wider mt-0.5">
                  *{invoice.invoiceNumber}*
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
