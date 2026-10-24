/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Package,
  Cpu,
  Layers,
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Order, ThermalPrinterConfig, UserAccount } from '../types/index.ts';

interface ThermalReceiptViewProps {
  orders: Order[];
  currentUser: UserAccount;
  printerConfig: ThermalPrinterConfig;
  selectedOrder?: Order | null;
  onUpdatePrinterConfig: (config: ThermalPrinterConfig) => void;
}

export type ReceiptDocType = 'receipt' | 'invoice' | 'packing_slip' | 'test_pattern';

export const ThermalReceiptView: React.FC<ThermalReceiptViewProps> = ({
  orders,
  currentUser,
  printerConfig,
  selectedOrder,
  onUpdatePrinterConfig,
}) => {
  const [activeOrder, setActiveOrder] = useState<Order | null>(
    selectedOrder || (orders.length > 0 ? orders[0] : null)
  );
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(printerConfig.paperWidth);
  const [docType, setDocType] = useState<ReceiptDocType>('receipt');
  const [isPrinting, setIsPrinting] = useState(false);

  // Sync if selectedOrder prop changes or if orders list changes
  React.useEffect(() => {
    if (selectedOrder) {
      setActiveOrder(selectedOrder);
    } else if (orders.length > 0) {
      if (!activeOrder || !orders.some((o) => o.id === activeOrder.id)) {
        setActiveOrder(orders[0]);
      }
    } else {
      setActiveOrder(null);
    }
  }, [selectedOrder, orders]);

  const handleTriggerPrint = (type: ReceiptDocType) => {
    setDocType(type);
    if (type !== 'test_pattern' && !activeOrder) {
      return;
    }
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 250);
  };

  const is58mm = paperWidth === '58mm';
  // 58mm is ~32 characters per line in standard font; 80mm is ~48 characters per line
  const containerWidthClass = is58mm ? 'w-[260px]' : 'w-[360px]';

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900/90 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
            <span>POS Hardware Printing Station</span>
            <span aria-hidden="true">·</span>
            <span>ESC/POS Standard Roll Emulation</span>
          </div>
          <h1 className="text-xl font-bold text-white font-serif-display">
            Thermal Receipt &amp; Invoice Engine
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real thermal layout rendered in monospace tabular typography for 58mm (narrow) and 80mm (standard) POS rolls.
          </p>
        </div>

        {/* Paper width toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => {
                setPaperWidth('58mm');
                onUpdatePrinterConfig({ ...printerConfig, paperWidth: '58mm' });
              }}
              className={`px-3 py-1.5 rounded-md font-mono font-medium transition-colors ${
                paperWidth === '58mm'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              58mm Roll (2-Inch)
            </button>
            <button
              onClick={() => {
                setPaperWidth('80mm');
                onUpdatePrinterConfig({ ...printerConfig, paperWidth: '80mm' });
              }}
              className={`px-3 py-1.5 rounded-md font-mono font-medium transition-colors ${
                paperWidth === '80mm'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              80mm Roll (3-Inch)
            </button>
          </div>
        </div>
      </div>

      {/* Action Deck: 4 Real Print Operations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => handleTriggerPrint('receipt')}
          className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
            docType === 'receipt'
              ? 'bg-neutral-800 border-amber-500/80 text-white'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono text-neutral-400">Action 1</span>
          </div>
          <div>
            <div className="font-semibold text-xs">Print Receipt</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Client advance deposit slip
            </div>
          </div>
        </button>

        <button
          onClick={() => handleTriggerPrint('invoice')}
          className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
            docType === 'invoice'
              ? 'bg-neutral-800 border-amber-500/80 text-white'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-mono text-neutral-400">Action 2</span>
          </div>
          <div>
            <div className="font-semibold text-xs">Print Tax Invoice</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              NTN breakdown &amp; VAT
            </div>
          </div>
        </button>

        <button
          onClick={() => handleTriggerPrint('packing_slip')}
          className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
            docType === 'packing_slip'
              ? 'bg-neutral-800 border-amber-500/80 text-white'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono text-neutral-400">Action 3</span>
          </div>
          <div>
            <div className="font-semibold text-xs">Print Packing Slip</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Workshop &amp; courier tag
            </div>
          </div>
        </button>

        <button
          onClick={() => handleTriggerPrint('test_pattern')}
          className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
            docType === 'test_pattern'
              ? 'bg-neutral-800 border-amber-500/80 text-white'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-mono text-neutral-400">Action 4</span>
          </div>
          <div>
            <div className="font-semibold text-xs">Print Test Receipt</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Cutter &amp; boundary test
            </div>
          </div>
        </button>
      </div>

      {/* Main Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Selector & Hardware Specs */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Select Bespoke Order to Print
            </label>
            {orders.length === 0 ? (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-400 text-xs">
                No orders found in database. Create an order in the Orders tab to generate receipts.
              </div>
            ) : (
              <select
                value={activeOrder?.id || ''}
                onChange={(e) => {
                  const found = orders.find((o) => o.id === e.target.value);
                  if (found) setActiveOrder(found);
                }}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customerName} (Rs. {o.grandTotalPKR.toLocaleString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Hardware Configuration Summary */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3 text-xs">
            <div className="font-semibold text-neutral-300 uppercase tracking-wider">
              Printer Hardware Specs
            </div>
            <div className="space-y-2 text-neutral-400">
              <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                <span>Active Paper Width:</span>
                <strong className="text-white font-mono">{paperWidth}</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                <span>Printable Column Pitch:</span>
                <strong className="text-white font-mono">{is58mm ? '32 chars/line' : '48 chars/line'}</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                <span>Emulation Protocol:</span>
                <strong className="text-white font-mono">ESC/POS Thermal</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-1">
                <span>Auto-Cutter Signal:</span>
                <strong className="text-emerald-400 font-mono">GS V 0 Enabled</strong>
              </div>
              <div className="flex justify-between">
                <span>Privacy Role Filter:</span>
                <strong className="text-amber-400 font-mono">{currentUser.role} Active</strong>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400 leading-relaxed space-y-2">
            <p>
              <strong>Printer Driver Note:</strong> Clicking any print action directly launches the browser print dialog styled for standard POS roll printers (Epson TM-T20, Xprinter XP-58/80, Rongta, Star Micronics).
            </p>
          </div>
        </div>

        {/* Center / Right Column: Thermal Receipt Preview Screen */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-neutral-950 rounded-xl border border-neutral-800 overflow-x-auto min-h-[600px]">
          {/* Visual roll simulation container */}
          <div className="text-center mb-3 text-xs text-neutral-500 font-mono">
            {paperWidth === '58mm' ? '58mm (2-inch narrow receipt preview)' : '80mm (3-inch standard receipt preview)'}
          </div>

          {/* Actual Thermal Paper Element (High contrast black on white) */}
          <div
            id="thermal-printable-area"
            className={`${containerWidthClass} bg-white text-black p-4 font-mono text-[11px] leading-tight shadow-2xl rounded-sm transition-all duration-200 border-t-8 border-neutral-300 selection:bg-neutral-300 selection:text-black`}
            style={{
              fontFamily: "'JetBrains Mono', Courier, monospace",
            }}
          >
            {docType === 'test_pattern' ? (
              /* TEST PATTERN RECEIPT */
              <div className="space-y-2">
                <div className="text-center font-bold text-sm tracking-wider">
                  *** THERMAL HARDWARE TEST ***
                </div>
                <div className="text-center text-[10px]">
                  ZUBAIR &amp; SONS BESPOKE TAILORS
                </div>
                <div className="text-center text-[10px]">
                  GULBERG III, LAHORE · PAKISTAN
                </div>
                <div className="border-t border-dashed border-black my-2" />

                <div className="text-[10px]">
                  MODE: {paperWidth} ROLL EMULATION<br />
                  CHARS: {is58mm ? '32 COLUMNS' : '48 COLUMNS'}<br />
                  DATE: {new Date().toISOString().slice(0, 16)}<br />
                  FIRMWARE: ESC/POS v4.11
                </div>

                <div className="border-t border-dashed border-black my-2" />

                <div className="font-bold text-[10px]">COLUMN BOUNDARY TEST:</div>
                <div className="text-[9px] break-all">
                  {is58mm ? '12345678901234567890123456789012' : '123456789012345678901234567890123456789012345678'}
                </div>

                <div className="border-t border-dashed border-black my-2" />

                <div className="font-bold text-[10px]">DENSITY CHECK:</div>
                <div className="bg-black text-white text-center py-1 text-[10px] font-bold">
                  [100% BLACK BLOCK PRINT TEST]
                </div>

                <div className="border-t border-dashed border-black my-2" />

                {/* Simulated QR Code */}
                <div className="text-center my-3">
                  <div className="inline-block p-2 border border-black bg-white">
                    <div className="w-16 h-16 bg-black flex items-center justify-center text-white text-[9px] font-bold">
                      [QR-TEST]
                    </div>
                  </div>
                  <div className="text-[9px] mt-1">VERIFICATION CODE OK</div>
                </div>

                <div className="text-center text-[10px] pt-2">
                  *** CUT PAPER TEST: OK ***
                </div>
              </div>
            ) : !activeOrder ? (
              /* EMPTY ORDER STATE ON THERMAL ROLL */
              <div className="space-y-2.5 py-4 text-center text-black">
                <div>
                  <div className="font-bold text-sm tracking-wide">
                    {printerConfig.businessName}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-neutral-600">
                    {printerConfig.tagline}
                  </div>
                  <div className="text-[9px] mt-0.5 text-neutral-600">
                    {printerConfig.address} · {printerConfig.city}
                  </div>
                  <div className="text-[9px] text-neutral-600">
                    Tel: {printerConfig.phone}
                  </div>
                  {printerConfig.websiteUrl && (
                    <div className="text-[9px] font-medium text-neutral-800">
                      Web: {printerConfig.websiteUrl}
                    </div>
                  )}
                  <div className="text-[9px] font-bold mt-0.5">
                    {printerConfig.ntnNumber}
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-2" />

                <div className="py-4 space-y-2">
                  <div className="font-bold text-[11px] uppercase tracking-wider">
                    *** NO BESPOKE ORDER SELECTED ***
                  </div>
                  <div className="text-[10px] text-neutral-600 max-w-[240px] mx-auto leading-relaxed">
                    {orders.length === 0
                      ? 'No orders are booked in the system yet. Once you book a bespoke suit in the Orders tab, receipts and tax invoices will render here automatically.'
                      : 'Please select an order from the selector above to preview and print.'}
                  </div>
                  <div className="text-[9px] text-neutral-500 font-mono pt-1">
                    Printer Emulation: {paperWidth} ESC/POS Ready
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-2" />

                <div className="text-[8px] text-center leading-tight text-neutral-600">
                  {printerConfig.footerNote}
                </div>
              </div>
            ) : (
              /* STANDARD RECEIPT / INVOICE / PACKING SLIP */
              <div className="space-y-1.5">
                {/* Header */}
                <div className="text-center">
                  <div className="font-bold text-sm tracking-wide">
                    {printerConfig.businessName}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider">
                    {printerConfig.tagline}
                  </div>
                  <div className="text-[9px] mt-0.5">
                    {printerConfig.address}
                  </div>
                  <div className="text-[9px]">
                    {printerConfig.city}
                  </div>
                  <div className="text-[9px]">
                    Tel: {printerConfig.phone}
                  </div>
                  {printerConfig.websiteUrl && (
                    <div className="text-[9px] font-medium">
                      Web: {printerConfig.websiteUrl}
                    </div>
                  )}
                  <div className="text-[9px] font-bold mt-0.5">
                    {printerConfig.ntnNumber}
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-1.5" />

                {/* Document Title */}
                <div className="text-center font-bold text-xs uppercase">
                  {docType === 'receipt' && 'CUSTOMER BESPOKE RECEIPT'}
                  {docType === 'invoice' && 'SALES TAX INVOICE'}
                  {docType === 'packing_slip' && 'WORKSHOP & PACKING MANIFEST'}
                </div>

                <div className="border-t border-dashed border-black my-1.5" />

                {/* Meta details */}
                <div className="text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>INVOICE #:</span>
                    <span className="font-bold">{activeOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{activeOrder.createdAt.slice(0, 10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TARGET DUE:</span>
                    <span className="font-bold">{activeOrder.deliveryDate}</span>
                  </div>
                  {activeOrder.eventDate && (
                    <div className="flex justify-between">
                      <span>EVENT DATE:</span>
                      <span>{activeOrder.eventDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>OPERATOR:</span>
                    <span>{currentUser.name} ({currentUser.role})</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-1.5" />

                {/* Client info with Role Privacy Masking */}
                <div className="text-[10px] space-y-0.5">
                  <div className="font-bold">CLIENT: {activeOrder.customerName}</div>
                  {activeOrder.familyMemberName && activeOrder.familyMemberRelationship !== 'Self' && (
                    <div className="font-bold">
                      ATTN / MEMBER: {activeOrder.familyMemberName} ({activeOrder.familyMemberRelationship})
                    </div>
                  )}
                  <div>PHONE: {currentUser.permissions.canViewCustomerPhone ? activeOrder.customerPhone : '••••••••••••'}</div>
                  <div>CITY: {activeOrder.customerCity}</div>
                  <div>ADDR: {currentUser.permissions.canViewCustomerAddress ? activeOrder.customerAddress : `${activeOrder.customerCity} [Restricted Address]`}</div>
                </div>

                <div className="border-t border-dashed border-black my-1.5" />

                {/* Items Table */}
                <div className="text-[10px]">
                  <div className="flex justify-between font-bold border-b border-black pb-0.5 mb-1">
                    <span>ITEM / FABRIC</span>
                    <span>PKR</span>
                  </div>

                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="mb-1.5">
                      <div className="flex justify-between font-semibold">
                        <span>{item.quantity}x {item.title}</span>
                        <span>{item.totalPricePKR.toLocaleString()}</span>
                      </div>
                      <div className="text-[9px] text-neutral-800">
                        {item.fabric} [{item.sizeOrTailoring}]
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-black my-1.5" />

                {/* Financial Summary */}
                <div className="text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>Rs. {activeOrder.subtotalPKR.toLocaleString()}</span>
                  </div>
                  {activeOrder.tailoringFeePKR > 0 && (
                    <div className="flex justify-between">
                      <span>TAILORING / CUTTING:</span>
                      <span>Rs. {activeOrder.tailoringFeePKR.toLocaleString()}</span>
                    </div>
                  )}
                  {activeOrder.discountPKR > 0 && (
                    <div className="flex justify-between">
                      <span>DISCOUNT APPLIED:</span>
                      <span>- Rs. {activeOrder.discountPKR.toLocaleString()}</span>
                    </div>
                  )}
                  {activeOrder.shippingFeePKR > 0 && (
                    <div className="flex justify-between">
                      <span>COURIER SHIPPING:</span>
                      <span>Rs. {activeOrder.shippingFeePKR.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t border-black pt-1 my-1 flex justify-between font-bold text-xs">
                    <span>TOTAL AMOUNT:</span>
                    <span>Rs. {activeOrder.grandTotalPKR.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>ADVANCE RECEIVED:</span>
                    <span>Rs. {activeOrder.advancePaidPKR.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between font-bold">
                    <span>BALANCE OUTSTANDING:</span>
                    <span>Rs. {activeOrder.balanceDuePKR.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span>METHOD:</span>
                    <span>{activeOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span>{activeOrder.status.toUpperCase()}</span>
                  </div>
                </div>

                {activeOrder.specialInstructions && (
                  <>
                    <div className="border-t border-dashed border-black my-1.5" />
                    <div className="text-[9px]">
                      <span className="font-bold">ATELIER NOTES:</span><br />
                      {activeOrder.specialInstructions}
                    </div>
                  </>
                )}

                <div className="border-t border-dashed border-black my-1.5" />

                {/* Footer notes */}
                <div className="text-[8px] text-center leading-tight">
                  {printerConfig.footerNote}
                </div>
                {printerConfig.websiteUrl && (
                  <div className="text-[8px] text-center font-semibold tracking-tight mt-1">
                    🌐 Online Atelier: {printerConfig.websiteUrl}
                  </div>
                )}

                {/* Simulated Thermal Barcode */}
                <div className="text-center pt-2">
                  <div className="font-mono text-sm tracking-widest font-bold">
                    ||||| | |||| |||||| || |
                  </div>
                  <div className="text-[9px] tracking-wider mt-0.5">
                    *{activeOrder.orderNumber}*
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Direct Print trigger floating button */}
          <button
            onClick={() => handleTriggerPrint(docType)}
            disabled={docType !== 'test_pattern' && !activeOrder}
            className={`mt-6 flex items-center gap-2 px-6 py-2.5 font-bold text-xs rounded-xl shadow-lg transition-colors ${
              docType !== 'test_pattern' && !activeOrder
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
                : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>
              {docType !== 'test_pattern' && !activeOrder
                ? 'Select an order to print'
                : `Send to POS Thermal Printer Now (${paperWidth})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
