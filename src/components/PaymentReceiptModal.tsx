/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  X,
  Receipt,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';
import { PaymentEntry, ThermalPrinterConfig, UserAccount } from '../types/index.ts';

interface PaymentReceiptModalProps {
  payment: PaymentEntry | null;
  printerConfig: ThermalPrinterConfig;
  currentUser: UserAccount;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  printerConfig,
  currentUser,
  onClose,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!payment) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 250);
  };

  const businessName = printerConfig.businessName || 'Zubair & Sons Bespoke Tailors';
  const address = printerConfig.address || 'Shop 12-14, Pace Shopping Mall, Gulberg III';
  const city = printerConfig.city || 'Lahore, Pakistan';
  const phone = printerConfig.phone || '+92 300 8472910';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-xs print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm">Payment Receipt Voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Slip */}
        <div className="p-6 bg-white text-stone-900 font-mono text-xs leading-relaxed print:p-0">
          <div className="text-center pb-3 border-b border-dashed border-stone-800">
            <h2 className="text-base font-bold font-serif uppercase tracking-tight text-stone-900">
              {businessName}
            </h2>
            <div className="text-[10px] text-stone-600 mt-0.5">{address}, {city}</div>
            <div className="text-[10px] text-stone-600">Tel: {phone}</div>
            <div className="mt-2 inline-block px-2.5 py-0.5 bg-stone-900 text-white text-[10px] font-bold uppercase rounded">
              OFFICIAL PAYMENT ACKNOWLEDGEMENT
            </div>
          </div>

          <div className="py-3 border-b border-dashed border-stone-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-600">Receipt Voucher #:</span>
              <strong className="text-stone-900">{payment.receiptNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Date &amp; Time:</span>
              <span>{payment.date}</span>
            </div>
            {payment.invoiceNumber && (
              <div className="flex justify-between">
                <span className="text-stone-600">Invoice Ref:</span>
                <span className="font-bold text-stone-800">{payment.invoiceNumber}</span>
              </div>
            )}
            {payment.orderNumber && (
              <div className="flex justify-between">
                <span className="text-stone-600">Stitching Order:</span>
                <span>#{payment.orderNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-600">Received From (Client):</span>
              <strong className="text-stone-900 font-serif">{payment.customerName}</strong>
            </div>
          </div>

          {/* Amount Box */}
          <div className="my-3 p-3 bg-stone-100 border border-stone-300 rounded text-center space-y-0.5">
            <div className="text-[10px] text-stone-600 uppercase tracking-wider">Amount Received (PKR)</div>
            <div className="text-xl font-bold text-stone-900 font-mono">
              Rs. {payment.amountPKR.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold uppercase">
              {payment.type}
            </div>
          </div>

          <div className="py-2 border-b border-dashed border-stone-800 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-600">Payment Channel:</span>
              <strong>{payment.method}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Reference / Slip #:</span>
              <span>{payment.referenceNumber}</span>
            </div>
            {payment.previousBalancePKR !== undefined && (
              <div className="flex justify-between">
                <span className="text-stone-600">Previous Balance Due:</span>
                <span>Rs. {payment.previousBalancePKR.toLocaleString()}</span>
              </div>
            )}
            {payment.newBalancePKR !== undefined && (
              <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>Remaining Customer Balance:</span>
                <span className={payment.newBalancePKR > 0 ? 'text-amber-800' : 'text-emerald-800'}>
                  Rs. {payment.newBalancePKR.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {payment.notes && (
            <div className="py-2 text-[10px] text-stone-600 italic">
              Note: {payment.notes}
            </div>
          )}

          <div className="pt-4 flex justify-between items-end text-[10px] text-stone-600">
            <div>
              <div className="border-b border-stone-400 pb-0.5 mb-1 font-mono text-stone-800">
                {payment.recordedBy}
              </div>
              <span>Cashier / Operator</span>
            </div>
            <div className="text-right">
              <div className="border-b border-stone-400 pb-0.5 mb-1 font-mono text-stone-800">
                Verified
              </div>
              <span>Atelier Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
