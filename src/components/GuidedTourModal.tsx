/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Layers, 
  Scissors, 
  Users,
  Receipt, 
  Printer,
  CreditCard,
  TrendingDown,
  LayoutDashboard,
  BarChart3,
  FileSpreadsheet,
  Globe,
  ExternalLink
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Atelier Setup & Store Website',
    tab: 'settings',
    icon: Globe,
    description: 'Configure your tailoring business identity: shop name, official website URL, phone number, and physical store address. These automatically print on all commercial invoices and 80mm thermal receipts.',
    highlights: [
      'Official Website URL: Click "Test / Visit Website" to verify live link',
      'Store branding, NTN tax ID, and custom invoice header/footer notes',
      'Clean database initialized with zero demo data ready for production',
      'Option to toggle Auto-Save and configure thermal printer paper roll width',
    ],
  },
  {
    step: 2,
    title: '2. Suit Catalogue & Fabric Stock',
    tab: 'products',
    icon: Scissors,
    description: 'Record your bespoke suit collection, fabric rolls, colors, sizes, and stock quantities with direct Cost of Goods Sold (COGS) tracking.',
    highlights: [
      'Product codes, fabrics (Merino Wool, Silk, Velvet), colors, and sizes',
      'Separate Sale Price (PKR) and Cost Price (COGS) to calculate profit accurately',
      'Automatic low-stock threshold alerts (<= 2 suits remaining)',
      'Bulk product import and export via standard CSV spreadsheet',
    ],
  },
  {
    step: 3,
    title: '3. Customers & Naap Directory',
    tab: 'customers',
    icon: Users,
    description: 'Dedicated customer management profiles with complete bespoke tailoring measurements (Chest, Waist, Hip, Shoulder, Sleeve, Collar, Trousers) and linked family members.',
    highlights: [
      'Customer name, phone number, city, and delivery street address',
      'Complete tailor measurement card with revision history logs',
      'Support for unlimited custom tailoring measurements (Sherwani, Kamiz Daman)',
      'Family member cards (Father, Son, Brother) under one household account',
    ],
  },
  {
    step: 4,
    title: '4. Sales & Automatic Invoicing',
    tab: 'sales_invoices',
    icon: Receipt,
    description: 'Record all sale types: Ready-made suits, custom stitching orders, fabric sales, and alterations. The system automatically creates unique invoice numbers and records transactions.',
    highlights: [
      'Unique invoice number generated automatically for every sale',
      'Support for full payment, partial deposit, and credit sales',
      'Automatic deduction of product stock quantities upon sale',
      'Instant customer remaining balance and transaction ledger updates',
    ],
  },
  {
    step: 5,
    title: '5. Professional Invoice Printing',
    tab: 'sales_invoices',
    icon: Printer,
    description: 'Print professional invoices directly on A4 paper or 80mm thermal receipt rolls. Reprint previous invoices without creating duplicate sales.',
    highlights: [
      '1-click switch between A4 Commercial Invoice and 80mm POS Slip',
      'Automatic shop branding, website URL, itemized prices, and balance due',
      'Reprint counter and timestamp tracking in audit log',
      'Search and filter previous invoices by number, customer, or date',
    ],
  },
  {
    step: 6,
    title: '6. Payment Tracking & Receivables',
    tab: 'payments',
    icon: CreditCard,
    description: 'Dedicated payment management ledger tracking payments received, outstanding customer receivables, and overdue balances.',
    highlights: [
      'Record additional payments and installment settlements against invoices',
      'Complete payment history with dates, methods (Raast, Cash, Card), and references',
      'Generate and print official Customer Payment Vouchers / Receipts',
      'Instant list of unpaid and partially paid customer accounts',
    ],
  },
  {
    step: 7,
    title: '7. Expense Management & Categories',
    tab: 'expenses',
    icon: TrendingDown,
    description: 'Track daily business expenses (tailor wages, fabric purchases, rent, utilities) and create unlimited custom expense categories.',
    highlights: [
      'Record daily expenses with date, vendor, amount, and payment method',
      'Create and edit unlimited custom categories with Direct Cost (COGS) distinction',
      'Time filters: Today, This Week, This Month, and Yearly totals',
      'Accurate separation of production costs from operating overheads',
    ],
  },
  {
    step: 8,
    title: '8. Executive Real-Time Dashboard',
    tab: 'dashboard',
    icon: LayoutDashboard,
    description: 'Executive dashboard displaying live sales, cash payments collected, customer receivables, business expenses, net profit, and suit counts.',
    highlights: [
      'Section 1 KPIs: Sales, Collected Cash, Receivables, Expenses, Profit',
      'Tailoring workload: Total suits sold and pending vs completed orders',
      'Today\'s sales and expenses with weekly and monthly financial summaries',
      'All figures update automatically whenever new transactions are saved',
    ],
  },
  {
    step: 9,
    title: '9. Financial Reports & Profit Ledger',
    tab: 'finance',
    icon: BarChart3,
    description: 'Detailed financial statements with Daily, Weekly, Monthly, Yearly, and Custom date range filters. Track Gross Profit, Net Profit, and COGS breakdown.',
    highlights: [
      'Accurate Profit & Loss: Revenue minus COGS minus Overheads = Net Profit',
      'Customer-wise revenue rankings and outstanding balance breakdown',
      'Expense category distribution and suit type performance',
      'Clear distinction between sales revenue and actual cash collected',
    ],
  },
  {
    step: 10,
    title: '10. Excel (.xlsx) Export & Backup',
    tab: 'finance',
    icon: FileSpreadsheet,
    description: 'Export all business data into a multi-worksheet Excel workbook (.xlsx) containing formatted tables for all sales, customers, orders, payments, expenses, and P&L.',
    highlights: [
      '8 dedicated worksheets: Dashboard, Sales, Customers, Orders, Payments, Expenses, Categories, P&L',
      'Preserves all historical records without overwriting or erasing data',
      'Formatted columns, currencies in PKR, and calculated totals',
      'Complete JSON database backup download for 100% offline security',
    ],
  },
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  currentStep,
  onStepChange,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const stepInfo = TOUR_STEPS[currentStep - 1] || TOUR_STEPS[0];
  const StepIcon = stepInfo.icon;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length) {
      const nextStep = currentStep + 1;
      onStepChange(nextStep);
      onNavigateTab(TOUR_STEPS[nextStep - 1].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      onStepChange(prevStep);
      onNavigateTab(TOUR_STEPS[prevStep - 1].tab);
    }
  };

  const handleSelectStep = (sNum: number) => {
    onStepChange(sNum);
    onNavigateTab(TOUR_STEPS[sNum - 1].tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0E1524] border border-[#1F2C45] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2C45] bg-[#0A0F1D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <span>Step-by-Step System Walkthrough</span>
                <span aria-hidden="true">·</span>
                <span>Step {currentStep} of {TOUR_STEPS.length}</span>
              </div>
              <h2 className="text-base font-bold text-white font-serif-display">{stepInfo.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#16223B] transition-colors"
            title="Close walkthrough"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage step indicators */}
        <div className="flex items-center px-4 py-2 bg-[#090D18] border-b border-[#18233A] overflow-x-auto gap-1">
          {TOUR_STEPS.map((s) => {
            const isActive = s.step === currentStep;
            const isCompleted = s.step < currentStep;
            return (
              <button
                key={s.step}
                onClick={() => handleSelectStep(s.step)}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : isCompleted
                    ? 'text-slate-300 hover:text-white bg-[#141C30]'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <span>{s.step}.</span>
                <span className="hidden sm:inline">{s.title.split(' ')[1] || s.tab}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          <p className="text-slate-300 leading-relaxed text-sm">
            {stepInfo.description}
          </p>

          <div className="bg-[#090E1A] border border-[#1B273E] rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Core Capabilities in this Step
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {stepInfo.highlights.map((h, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 bg-[#121A2D] p-3 rounded-xl border border-[#1F2C45]">
            <span>Screen for this step:</span>
            <button
              onClick={() => {
                onNavigateTab(stepInfo.tab);
                onClose();
              }}
              className="flex items-center gap-1 font-semibold text-amber-400 hover:underline"
            >
              <span>Open /{stepInfo.tab} tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#1F2C45] bg-[#0A0F1D]">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentStep === 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white bg-[#141C30] hover:bg-[#1C2742]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Exit
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              {currentStep === TOUR_STEPS.length ? 'Finish Walkthrough' : `Next: Step ${currentStep + 1}`}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
