/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Search,
  Globe,
  Scissors,
  Users,
  Receipt,
  Printer,
  CreditCard,
  TrendingDown,
  LayoutDashboard,
  BarChart3,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Circle,
  HelpCircle,
  Languages,
  ArrowRight,
  Check
} from 'lucide-react';
import { ThermalPrinterConfig } from '../types/index.ts';

interface SoftwareGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  printerConfig?: ThermalPrinterConfig;
  onNavigateTab?: (tab: string) => void;
  isDarkMode?: boolean;
}

interface StepGuideItem {
  stepNumber: number;
  id: string;
  tabTarget: string;
  tabLabel: string;
  icon: any;
  badge: string;
  titleEn: string;
  titleUr: string;
  summaryEn: string;
  summaryUr: string;
  actionsEn: {
    instruction: string;
    details: string;
    tip?: string;
  }[];
  actionsUr: {
    instruction: string;
    details: string;
    tip?: string;
  }[];
}

const STEP_BY_STEP_GUIDE: StepGuideItem[] = [
  {
    stepNumber: 1,
    id: 'store_setup',
    tabTarget: 'settings',
    tabLabel: 'Settings',
    icon: Globe,
    badge: 'Step 1: Foundation',
    titleEn: '1. Atelier Setup: Shop Name, Address & Official Website',
    titleUr: '۱. دکان کی معلومات، پتہ اور آفیشل ویب سائٹ کا اندراج',
    summaryEn: 'Configure your tailoring business name, phone number, address, NTN number, and official website URL. These appear on all printed invoices, thermal receipts, and reports.',
    summaryUr: 'Apni tailoring shop ka naam, telephone number, pata aur website link darj karein jo tamam raseedon aur invoices par khud ba khud print hoga.',
    actionsEn: [
      {
        instruction: 'Navigate to Atelier Settings',
        details: 'Click "Atelier Settings & Access Control" in the sidebar navigation (or click the Settings icon).',
        tip: 'Ensure you are in the ADMIN role to edit store settings.'
      },
      {
        instruction: 'Enter Shop Name & Contact Info',
        details: 'Fill in your Business Name (e.g. "Royal Sartorial Tailors"), Store Tagline, City, Phone Number, and Street Address.',
      },
      {
        instruction: 'Add Your Official Website URL',
        details: 'Enter your website (e.g. "https://www.yourdomain.com"). You can click "Test / Visit Website" to confirm it opens properly.',
        tip: 'Once saved, your website link is automatically shown on the top bar, A4 invoices, and 80mm thermal receipts.'
      },
      {
        instruction: 'Click "Save Business Profile & Website"',
        details: 'Changes will be saved permanently to your local database storage.',
      }
    ],
    actionsUr: [
      {
        instruction: 'Settings tab par jayein',
        details: 'Sidebar menu se "Atelier Settings & Access Control" par click karein.',
        tip: 'Yad rahe sirf ADMIN user dukan ki settings tabdeel kar sakta hai.'
      },
      {
        instruction: 'Dukan ka naam aur pata likhein',
        details: 'Apni shop ka naam, phone number, shehar aur mukammal pata darj karein.',
      },
      {
        instruction: 'Website ka URL link shamil karein',
        details: '"Official Website URL" ke khane mein apni website likhein aur test button se check karein.',
        tip: 'Ye link raseed aur invoices par print hoga.'
      },
      {
        instruction: '"Save Business Profile" dabayein',
        details: 'Button dabane se aapka data hamesha ke liye save ho jayega.',
      }
    ]
  },
  {
    stepNumber: 2,
    id: 'products_fabrics',
    tabTarget: 'products',
    tabLabel: 'Products',
    icon: Scissors,
    badge: 'Step 2: Stock Catalogue',
    titleEn: '2. Add Ready-Made Suits, Fabric Catalogue & Categories',
    titleUr: '۲. تیار سوٹ، کپڑے اور کیٹیگریز شامل کرنا',
    summaryEn: 'Record your bespoke and ready-made suit inventory with fabric specs, stock counts, sale price, and Cost of Goods Sold (COGS) to calculate profit accurately.',
    summaryUr: 'Apni dukan ke suits, unka kapra, stock ki tadaad, sale price aur khareedari cost (COGS) software mein darj karein.',
    actionsEn: [
      {
        instruction: 'Open the "Suit Catalogue & Fabric Stock" Tab',
        details: 'Click on "Products & Fabrics" from the left navigation bar.',
      },
      {
        instruction: 'Click "+ Add Bespoke Product"',
        details: 'Fill in Product Code (e.g. "ZS-701"), Title (e.g. "Italian Wool 3-Piece"), Category, and Fabric description.',
      },
      {
        instruction: 'Set Sale Price (PKR) and Cost Price (COGS)',
        details: 'Enter what you sell the suit for (e.g. 85,000 PKR) and your cost price (e.g. 42,000 PKR). The system uses this to compute Gross Profit and Net Profit automatically.',
        tip: 'Cost Price is strictly hidden from Sales Employees to protect your business margins.'
      },
      {
        instruction: 'Set Available Sizes & Initial Stock Quantity',
        details: 'Enter current pieces in stock (e.g. 5) and minimum stock alert threshold (e.g. 2).',
      }
    ],
    actionsUr: [
      {
        instruction: 'Products & Fabrics tab open karein',
        details: 'Sidebar se "Suit Catalogue & Fabric Stock" par click karein.',
      },
      {
        instruction: '"+ Add Bespoke Product" par click karein',
        details: 'Soot ka code (maslan ZS-701), naam, category aur kapray ki quality likhein.',
      },
      {
        instruction: 'Sale Price aur Cost Price (COGS) darj karein',
        details: 'Frokh ki keemat aur khareedari cost likhein taake software nafa khud nikal sake.',
        tip: 'Cost price sales staff se chupai jati hai.'
      },
      {
        instruction: 'Stock ki tadaad aur sizes likhein',
        details: 'Dukan mein mojood suits ki tadaad (stock) darj karke Save karein.',
      }
    ]
  },
  {
    stepNumber: 3,
    id: 'customer_naap',
    tabTarget: 'customers',
    tabLabel: 'Customers',
    icon: Users,
    badge: 'Step 3: Client Directory',
    titleEn: '3. Register Customers & Record Bespoke Measurements (Naap)',
    titleUr: '۳. کسٹمرز کا اندراج اور مکمل درزی کا ناپ',
    summaryEn: 'Create dedicated profiles for customers, record complete tailoring measurements (chest, waist, jacket length, sleeve, collar, trousers), and add linked family members.',
    summaryUr: 'Har customer ka profile banayein, unka mukammal naap darj karein aur unke khandan ke afrad (Beta, Bhai, Walid) ke alag naap mehfooz karein.',
    actionsEn: [
      {
        instruction: 'Open "Customers & Naap Directory"',
        details: 'Navigate to the Customers tab from the sidebar menu.',
      },
      {
        instruction: 'Click "+ New Customer"',
        details: 'Enter the Customer\'s Full Name, Phone Number, City, and Street Address.',
      },
      {
        instruction: 'Record Tailoring Measurements',
        details: 'Fill in Chest, Waist, Hip, Shoulder, Sleeve, Jacket Length, Collar, Trouser Length, and Inseam.',
        tip: 'You can also add unlimited Custom Measurement fields (e.g. Sherwani length, Kamiz Daman, Armhole depth).'
      },
      {
        instruction: 'Add Family Members if Needed',
        details: 'Inside any customer profile, click "+ Add Family Member" to maintain separate measurement cards for their Father, Son, Brother, or In-Laws under the same household balance.',
      }
    ],
    actionsUr: [
      {
        instruction: 'Customers & Naap tab kholein',
        details: 'Menu se "Customers & Naap Directory" par jayein.',
      },
      {
        instruction: '"+ New Customer" dabayein',
        details: 'Gahak ka pura naam, phone number, shehar aur pata darj karein.',
      },
      {
        instruction: 'Darzi ka mukammal naap darj karein',
        details: 'Seena (Chest), Kamar (Waist), Teera (Shoulder), Bazu (Sleeve), Collar aur Shalwar/Trouser ka naap likhein.',
        tip: 'Khas kapron ke liye custom naap ke fields bhi shamil kar sakte hain.'
      },
      {
        instruction: 'Family members shamil karein',
        details: 'Ek sarbarah customer ke andar unke betay ya bhai ka alag naap shamil karein.',
      }
    ]
  },
  {
    stepNumber: 4,
    id: 'sales_invoicing',
    tabTarget: 'sales_invoices',
    tabLabel: 'Sales & Invoices',
    icon: Receipt,
    badge: 'Step 4: Transactions',
    titleEn: '4. Record Sales & Automatically Generate Invoices',
    titleUr: '۴. سیل کا اندراج اور خودکار انوائس تیار کرنا',
    summaryEn: 'Record Ready-Made Suit Sales, Custom Stitching Orders, Fabric Sales, and Alterations. The system automatically creates unique invoice numbers, deducts stock, and updates customer balances.',
    summaryUr: 'Tayar suit ki frokht, stitching order, kapray ki sale ya alteration darj karein. System foran unique invoice banata hai aur baqaya balance update karta hai.',
    actionsEn: [
      {
        instruction: 'Open "Sales & Automatic Invoicing"',
        details: 'Click on the "Sales & Automatic Invoicing" tab from the sidebar.',
      },
      {
        instruction: 'Click "+ New Sale & Auto Invoice"',
        details: 'Select an existing customer or enter a new customer\'s name and phone number on the spot.',
      },
      {
        instruction: 'Choose Sale Type & Add Items',
        details: 'Select Ready-Made Suit, Custom Stitching, Fabric, or Alteration. Pick garments from your catalogue or enter custom descriptions and prices.',
      },
      {
        instruction: 'Record Payment & Generate Invoice',
        details: 'Enter any discount, tailoring fee, and the Advance/Paid Amount received (via Cash, Raast, or Card). Click "Create Sale & Generate Invoice".',
        tip: 'Full payment, partial payment, and credit sales are fully supported with automatic remaining balance tracking.'
      }
    ],
    actionsUr: [
      {
        instruction: 'Sales & Automatic Invoicing tab kholein',
        details: 'Left menu se "Sales & Automatic Invoicing" par click karein.',
      },
      {
        instruction: '"+ New Sale & Auto Invoice" dabayein',
        details: 'Pehle se mojood customer chunein ya naye gahak ka naam foran darj karein.',
      },
      {
        instruction: 'Sale ki noiyat chunein aur items dalein',
        details: 'Ready-made suit, custom silai, kapra ya alteration ka intekhab karein aur keemat likhein.',
      },
      {
        instruction: 'Wasool shuda raqam darj karein',
        details: 'Customer ne jitni raqam advance ya full di wo likhein aur sale confirm karein. Invoice khud ban jayegi.',
      }
    ]
  },
  {
    stepNumber: 5,
    id: 'invoice_printing',
    tabTarget: 'sales_invoices',
    tabLabel: 'Sales & Invoices',
    icon: Printer,
    badge: 'Step 5: Printing',
    titleEn: '5. Print Professional Invoices (A4 Commercial & 80mm Thermal POS)',
    titleUr: '۵. انوائس پرنٹنگ: اے۴ سائز اور تھرمل رسید',
    summaryEn: 'Print invoices directly on A4 paper or standard 80mm POS thermal receipt rolls. Reprint past invoices anytime with automatic reprint counter tracking (never creating duplicate sales).',
    summaryUr: 'Apni dukan ke computer se A4 paper par commercial invoice ya 80mm thermal printer se raseed print karein.',
    actionsEn: [
      {
        instruction: 'Locate Any Invoice in the Table',
        details: 'In the Sales & Invoices view, search by Invoice Number, Customer Name, or Date.',
      },
      {
        instruction: 'Click the "Print" Button',
        details: 'The professional Invoice Print Modal opens instantly.',
      },
      {
        instruction: 'Switch Between A4 Commercial & 80mm Thermal Receipt',
        details: 'Use the layout toggle at top right to select either Full A4 Commercial Invoice or Compact 80mm POS Slip.',
        tip: 'Both formats include your shop name, logo, website, address, NTN, customer details, items, discounts, paid amount, and remaining balance.'
      },
      {
        instruction: 'Click "Print Invoice Now" / Browser Print',
        details: 'The system triggers your hardware printer and records a reprint timestamp in the audit log without altering sales figures.',
      }
    ],
    actionsUr: [
      {
        instruction: 'Invoice table mein print button dabayein',
        details: 'Kisi bhi sale ya invoice ke aagay "Print" button par click karein.',
      },
      {
        instruction: 'A4 ya 80mm Thermal format chunein',
        details: 'Modal mein upar se A4 commercial invoice ya choti 80mm thermal receipt select karein.',
        tip: 'Dono formats par aapki dukan ka naam, website, phone aur baqaya hisab likha hota hai.'
      },
      {
        instruction: 'Direct print karein',
        details: '"Print Invoice Now" dabane se printer se raseed nikal aayegi. Purani invoice dobara print karne se duplicate sale nahi banti.',
      }
    ]
  },
  {
    stepNumber: 6,
    id: 'payments_receivables',
    tabTarget: 'payments',
    tabLabel: 'Payments',
    icon: CreditCard,
    badge: 'Step 6: Receivables',
    titleEn: '6. Payment Tracking, Installments & Outstanding Balances',
    titleUr: '۶. بقایا رقوم کی وصولی اور قسطوں کا حساب',
    summaryEn: 'Track customer receivables, overdue balances, and record subsequent installment payments against invoices. Generate printable customer payment receipts.',
    summaryUr: 'Gahak ki baqaya raqam (receivables) dekhein, mazeed payments wasool karein aur payment receipt print karein.',
    actionsEn: [
      {
        instruction: 'Open "Payment Tracking & Receivables"',
        details: 'Click on the "Payments" tab in the navigation menu.',
      },
      {
        instruction: 'Review Total Receivables & Unpaid Invoices',
        details: 'The top KPI cards display Total Payments Received, Total Receivables Due, and Overdue Count in real-time.',
      },
      {
        instruction: 'Record an Additional Payment',
        details: 'Click "+ Record Payment" or click "Collect" directly on any partially paid invoice. Enter amount, payment method (Raast, Cash, Card), and reference number.',
      },
      {
        instruction: 'Print Payment Voucher / Receipt',
        details: 'Click "Receipt" on any payment row to open and print a dedicated customer payment voucher.',
        tip: 'The invoice and customer balance automatically recalculate to reflect the updated paid amount.'
      }
    ],
    actionsUr: [
      {
        instruction: 'Payments tab open karein',
        details: 'Menu se "Payment Tracking & Receivables" par jayein.',
      },
      {
        instruction: 'Baqaya raqam aur unpaid invoices check karein',
        details: 'Upar card mein kul wasool shuda raqam aur baqaya receivables nazar aate hain.',
      },
      {
        instruction: 'Baqaya raqam wasool karein',
        details: 'Invoice ke samnay "Collect" dabayein aur wasool shuda raqam darj karein.',
      },
      {
        instruction: 'Payment Receipt print karein',
        details: 'Gahak ko dukan ki stamp aur sign ke sath payment receipt print karke dein.',
      }
    ]
  },
  {
    stepNumber: 7,
    id: 'expense_management',
    tabTarget: 'expenses',
    tabLabel: 'Expenses',
    icon: TrendingDown,
    badge: 'Step 7: Cost Control',
    titleEn: '7. Expense Management & Creating Unlimited Custom Categories',
    titleUr: '۷. دکان کے اخراجات اور کسٹم کیٹیگریز بنانا',
    summaryEn: 'Record daily business expenses (tailor wages, fabric purchases, rent, utilities) and create unlimited custom expense categories with Direct Cost (COGS) vs Operating Overheads classification.',
    summaryUr: 'Rozana ke karobari kharche darj karein (maslan darziyon ki dihadi, bijli ka bill, dukan ka kiraya) aur apni marzi ki categories banayein.',
    actionsEn: [
      {
        instruction: 'Open "Expense Management & Categories"',
        details: 'Navigate to the "Expenses" tab from the sidebar navigation.',
      },
      {
        instruction: 'Record a Daily Expense',
        details: 'Click "+ Record Expense". Select the category, enter amount (PKR), vendor name, payment method, and description.',
      },
      {
        instruction: 'Manage & Add Custom Categories',
        details: 'Click "Manage Categories" &rarr; "+ New Expense Category". Name your category (e.g. "Generator Fuel", "Tea & Refreshments", "Thread Procurement").',
      },
      {
        instruction: 'Classify as Direct Cost (COGS) vs Operating Overhead',
        details: 'Mark items directly tied to garment production (fabrics, tailor wages) as Direct Costs. Rent and electricity are operating overheads. This ensures accurate Gross and Net profit calculations.',
        tip: 'Filter expenses by Today, Week, Month, Year, or Category anytime.'
      }
    ],
    actionsUr: [
      {
        instruction: 'Expenses tab open karein',
        details: 'Menu se "Expense Management & Categories" par click karein.',
      },
      {
        instruction: 'Rozana ka kharcha darj karein',
        details: '"+ Record Expense" dabayein. Category chunein, raqam likhein aur save karein.',
      },
      {
        instruction: 'Nayi custom category banayein',
        details: '"Manage Categories" par click karke apni zaroorat ke mutabiq nayi category shamil karein.',
      },
      {
        instruction: 'Direct Cost aur General Expense ka farq',
        details: 'Kapra aur silai direct cost hain jabke kiraya aur bijli overhead hain. Is se nafa bilkul sahi nikalta hai.',
      }
    ]
  },
  {
    stepNumber: 8,
    id: 'dashboard_monitoring',
    tabTarget: 'dashboard',
    tabLabel: 'Dashboard',
    icon: LayoutDashboard,
    badge: 'Step 8: Real-Time KPIs',
    titleEn: '8. Monitor the Executive Real-Time Dashboard',
    titleUr: '۸. ایگزیکٹو ڈیش بورڈ اور لائیو کاروباری اعداد و شمار',
    summaryEn: 'View real-time sales, payments received, customer receivables, business expenses, net profit, total suits sold, and pending stitching orders updating automatically with every transaction.',
    summaryUr: 'Dashboard par kul sale, wasooli, baqaya raqam, kharche, nafa aur suits ki tadad lائیو update hoti hai.',
    actionsEn: [
      {
        instruction: 'Open "Executive Dashboard"',
        details: 'Click "Dashboard" at the top of the sidebar navigation.',
      },
      {
        instruction: 'Review Core Section 1 Financial Cards',
        details: 'Inspect Total Sales, Total Payments Received, Total Outstanding Payments, Total Business Expenses, and Net Profit.',
      },
      {
        instruction: 'Track Tailoring Workload',
        details: 'Check Total Suits Sold, Stitching Orders Completed, and Pending Stitching Orders.',
      },
      {
        instruction: 'Check Daily & Monthly Summaries',
        details: 'Review Today\'s Sales and Expenses alongside weekly and monthly financial summaries.',
        tip: 'Every figure updates instantly without requiring a page refresh whenever you record a sale, payment, or expense.'
      }
    ],
    actionsUr: [
      {
        instruction: 'Dashboard open karein',
        details: 'Sidebar mein sab se upar "Executive Dashboard" par click karein.',
      },
      {
        instruction: 'Maliati cards check karein',
        details: 'Kul sales, cash wasooli, customer ka baqaya balance, dukan ke kharche aur mukammal nafa dekhein.',
      },
      {
        instruction: 'Suits aur stitching order ka status',
        details: 'Kitne suits bikay aur kitne stitching orders tayar ho chukay hain ya pending hain.',
      },
      {
        instruction: 'Aaj ka hisab (Today\'s summary)',
        details: 'Aaj ki sale aur aaj ke kharche khud ba khud har transaction par update hotay hain.',
      }
    ]
  },
  {
    stepNumber: 9,
    id: 'financial_reports',
    tabTarget: 'finance',
    tabLabel: 'Financial Reports',
    icon: BarChart3,
    badge: 'Step 9: Financial Analysis',
    titleEn: '9. Review Advanced Financial Reports & Profit & Loss',
    titleUr: '۹. مالیاتی رپورٹس اور نفع و نقصان (P&L) کا تجزیہ',
    summaryEn: 'Analyze performance using Daily, Weekly, Monthly, Yearly, and Custom date filters. Track Cost of Goods Sold (COGS), Gross Profit, Net Profit, and customer rankings.',
    summaryUr: 'Daily, weekly, monthly ya yearly filters ke zariye karobar ki mukammal aamdani, kharche, COGS aur nafa check karein.',
    actionsEn: [
      {
        instruction: 'Open "Financial Reports & Profit Ledger"',
        details: 'Navigate to the "Financial Reports" tab in the sidebar.',
      },
      {
        instruction: 'Select a Date Range Filter',
        details: 'Choose Today, This Week, This Month (or pick any specific year/month, or custom date range).',
      },
      {
        instruction: 'Analyze the Profit & Loss Statement (P&L)',
        details: 'See Total Sales Revenue minus Cost of Goods Sold (COGS) = Gross Profit. Gross Profit minus Operating Expenses = Net Profit.',
        tip: 'The software distinguishes sales revenue from actual cash received so credit sales don\'t distort your cash flow.'
      },
      {
        instruction: 'Inspect Customer Rankings & Category Breakdowns',
        details: 'See top spending clients, outstanding balances by customer, and sales distribution across 3-piece suits, sherwanis, and alterations.',
      }
    ],
    actionsUr: [
      {
        instruction: 'Financial Reports tab par jayein',
        details: 'Sidebar menu se "Financial Reports & Profit Ledger" kholein.',
      },
      {
        instruction: 'Tareekh (Date Filter) select karein',
        details: 'Daily, Weekly, Monthly ya kisi khas maheenay ka intekhab karein.',
      },
      {
        instruction: 'Nafa aur Nuqsan (P&L) statement dekhein',
        details: 'Kul aamdani mein se kapray aur silai ki cost nikal kar Gross Profit aur phir baki kharche nikal kar Net Profit check karein.',
      },
      {
        instruction: 'Customers aur categories ki tafseel',
        details: 'Dekhein kaunse gahak ne kitna maal khareeda aur kaunse suit sab se zyada bikay.',
      }
    ]
  },
  {
    stepNumber: 10,
    id: 'excel_export',
    tabTarget: 'finance',
    tabLabel: 'Excel Export',
    icon: FileSpreadsheet,
    badge: 'Step 10: Excel & Backup',
    titleEn: '10. Export All Business Data to Multi-Sheet Excel (.xlsx) & Backup',
    titleUr: '۱۰. تمام کاروباری ڈیٹا کو ایکسل (.xlsx) فائل میں ایکسپورٹ کرنا',
    summaryEn: 'Export real transaction records to Excel (.xlsx) with 8 dedicated worksheets: Dashboard Summary, Sales & Invoices, Customers & Naap, Stitching Orders, Payments, Expenses, Categories, and Monthly P&L.',
    summaryUr: 'Aik click se apne puray karobar ka data professional Excel file mein export karein aur complete backup download karein.',
    actionsEn: [
      {
        instruction: 'Click "Export to Excel (.xlsx)"',
        details: 'Click the green "Export Excel (.xlsx)" button in the top header, Financial Reports tab, or Settings.',
      },
      {
        instruction: 'Automatic Multi-Sheet Generation',
        details: 'The system generates a formatted `.xlsx` workbook containing 8 dedicated worksheets with column widths, formatted currencies (PKR), and transaction details.',
      },
      {
        instruction: 'Historical Records Preserved',
        details: 'Exporting preserves all your historical transactions and does not erase or overwrite saved business data.',
      },
      {
        instruction: 'Download Full JSON Database Backup',
        details: 'In Atelier Settings, you can also click "Download Full Database Backup" to create a permanent JSON backup file for complete offline safety.',
        tip: 'You can restore this backup at any time using "Restore Database Backup".'
      }
    ],
    actionsUr: [
      {
        instruction: 'Excel Export button dabayein',
        details: 'Header mein ya Financial Reports tab mein green "Export to Excel (.xlsx)" button dabayein.',
      },
      {
        instruction: '8 alag worksheets banti hain',
        details: 'Excel file mein Dashboard Summary, Sales, Customers ka Naap, Orders, Payments aur Expenses ki alag sheets hoti hain.',
      },
      {
        instruction: 'Data hamesha mehfooz rehta hai',
        details: 'Excel export karne se purana data kabi delete nahi hota.',
      },
      {
        instruction: 'Full Database Backup download karein',
        details: 'Settings tab se JSON backup file download karein taake aapka data 100% mehfooz rahay.',
      }
    ]
  }
];

export const SoftwareGuideModal: React.FC<SoftwareGuideModalProps> = ({
  isOpen,
  onClose,
  printerConfig,
  onNavigateTab,
  isDarkMode = true,
}) => {
  const [viewMode, setViewMode] = useState<'step_by_step' | 'full_manual'>('step_by_step');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [language, setLanguage] = useState<'both' | 'en' | 'ur'>('both');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const currentItem = STEP_BY_STEP_GUIDE[currentStepIndex] || STEP_BY_STEP_GUIDE[0];
  const StepIcon = currentItem.icon;

  const handleNextStep = () => {
    if (currentStepIndex < STEP_BY_STEP_GUIDE.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const toggleStepCompleted = (stepNum: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]
    );
  };

  const handleGoToTab = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
      onClose();
    }
  };

  // Filtered for manual search
  const filteredSteps = STEP_BY_STEP_GUIDE.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.titleEn.toLowerCase().includes(q) ||
      item.titleUr.toLowerCase().includes(q) ||
      item.summaryEn.toLowerCase().includes(q) ||
      item.summaryUr.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
        isDarkMode
          ? 'bg-[#0E1524] border-[#1F2C45] text-slate-100'
          : 'bg-white border-stone-300 text-stone-900'
      }`}>
        {/* Modal Top Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b gap-3 ${
          isDarkMode ? 'bg-[#0A0F1D] border-[#1F2C45]' : 'bg-[#FAF8F5] border-[#E8E2D6]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight font-serif-display">
                  Tailoring System Step-by-Step Guide
                </h2>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30">
                  Rahnumai (رہنمائی)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive guide instructing you one by one from zero data to full sales, invoicing, expenses, and accounting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* View Mode Toggle: Step by Step vs Full Manual */}
            <div className={`flex items-center p-0.5 rounded-lg border text-xs ${
              isDarkMode ? 'bg-[#121A2D] border-[#1F2C45]' : 'bg-stone-100 border-stone-200'
            }`}>
              <button
                onClick={() => setViewMode('step_by_step')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'step_by_step'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                One by One
              </button>
              <button
                onClick={() => setViewMode('full_manual')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'full_manual'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All 10 Steps
              </button>
            </div>

            {/* Language Switcher */}
            <div className={`flex items-center p-0.5 rounded-lg border text-xs ${
              isDarkMode ? 'bg-[#121A2D] border-[#1F2C45]' : 'bg-stone-100 border-stone-200'
            }`}>
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => setLanguage('both')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  language === 'both' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  language === 'en' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ur')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  language === 'ur' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                اردو
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'border-[#1F2C45] text-slate-400 hover:text-white hover:bg-[#16223B]'
                  : 'border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-200'
              }`}
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STEPPER PROGRESS BAR (ONE BY ONE MODE) */}
        {viewMode === 'step_by_step' && (
          <div className={`px-5 py-2.5 border-b overflow-x-auto flex items-center gap-1.5 shrink-0 ${
            isDarkMode ? 'bg-[#0B101E] border-[#18233A]' : 'bg-[#F5F2EC] border-[#E8E2D6]'
          }`}>
            <span className="text-[11px] font-semibold text-amber-400 mr-2 uppercase tracking-wider shrink-0">
              Step {currentItem.stepNumber} of 10
            </span>
            <div className="flex items-center gap-1 min-w-max">
              {STEP_BY_STEP_GUIDE.map((st, idx) => {
                const isActive = idx === currentStepIndex;
                const isDone = completedSteps.includes(st.stepNumber);
                return (
                  <button
                    key={st.id}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : isDone
                        ? isDarkMode
                          ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                          : 'bg-emerald-100 text-emerald-800'
                        : isDarkMode
                        ? 'bg-[#121A2D] text-slate-400 hover:text-slate-200 hover:bg-[#18233C]'
                        : 'bg-white text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className="font-mono text-[10px]">{st.stepNumber}.</span>
                    )}
                    <span className="truncate max-w-[110px]">{st.tabLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {viewMode === 'step_by_step' ? (
            /* ================= ONE BY ONE ACTIVE STEP VIEW ================= */
            <div className="space-y-6">
              {/* Active Step Feature Banner */}
              <div className={`p-5 rounded-2xl border transition-all ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#121A2D] to-[#0A101F] border-[#22314E]'
                  : 'bg-gradient-to-r from-amber-50 to-stone-50 border-amber-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0 mt-0.5">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {currentItem.badge}
                        </span>
                        <button
                          onClick={() => toggleStepCompleted(currentItem.stepNumber)}
                          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border transition-colors ${
                            completedSteps.includes(currentItem.stepNumber)
                              ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                              : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {completedSteps.includes(currentItem.stepNumber) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5" />
                              <span>Mark as Done</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h3 className={`text-lg sm:text-xl font-bold mt-1.5 font-serif-display ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>
                        {currentItem.titleEn}
                      </h3>
                      <p className="text-xs text-amber-400 font-medium mt-0.5">
                        {currentItem.titleUr}
                      </p>
                    </div>
                  </div>

                  {/* Direct Action Button: Navigate to Tab */}
                  <button
                    onClick={() => handleGoToTab(currentItem.tabTarget)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all self-start sm:self-center shrink-0 cursor-pointer"
                  >
                    <span>Open {currentItem.tabLabel} Screen Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Summaries */}
                <div className="mt-4 pt-3.5 border-t border-[#1F2C45]/80 space-y-2 text-xs">
                  {(language === 'both' || language === 'en') && (
                    <p className={`${isDarkMode ? 'text-slate-300' : 'text-stone-700'} leading-relaxed`}>
                      <strong className="text-amber-400">Purpose:</strong> {currentItem.summaryEn}
                    </p>
                  )}
                  {(language === 'both' || language === 'ur') && (
                    <p className={`${isDarkMode ? 'text-amber-200/90' : 'text-amber-900'} leading-relaxed`}>
                      <strong className="text-amber-400">Khulasa (خلاصہ):</strong> {currentItem.summaryUr}
                    </p>
                  )}
                </div>
              </div>

              {/* Numbered Step-by-Step Instructions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Exact Action Items for Step {currentItem.stepNumber}</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Follow these {currentItem.actionsEn.length} actions in sequence
                  </span>
                </div>

                <div className="space-y-3.5">
                  {currentItem.actionsEn.map((actEn, idx) => {
                    const actUr = currentItem.actionsUr[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-colors ${
                          isDarkMode
                            ? 'bg-[#101728]/80 border-[#1B273E] hover:border-[#27385A]'
                            : 'bg-white border-stone-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>

                          <div className="flex-1 space-y-2 min-w-0">
                            {(language === 'both' || language === 'en') && (
                              <div>
                                <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                  {actEn.instruction}
                                </div>
                                <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}>
                                  {actEn.details}
                                </p>
                                {actEn.tip && (
                                  <div className={`mt-2 p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                                    isDarkMode
                                      ? 'bg-[#090E1A] border-[#1F2C45] text-amber-300'
                                      : 'bg-amber-50 border-amber-200 text-amber-900'
                                  }`}>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>{actEn.tip}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {(language === 'both' || language === 'ur') && actUr && (
                              <div className={`${language === 'both' ? 'pt-2.5 border-t border-[#1F2C45]/60' : ''}`}>
                                <div className="text-xs font-bold text-amber-400">
                                  {actUr.instruction}
                                </div>
                                <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-amber-100/90' : 'text-amber-950'}`}>
                                  {actUr.details}
                                </p>
                                {actUr.tip && (
                                  <div className={`mt-2 p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                                    isDarkMode
                                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                                      : 'bg-amber-50 border-amber-200 text-amber-900'
                                  }`}>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>{actUr.tip}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ================= ALL 10 STEPS FULL INDEX VIEW ================= */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter steps by topic (e.g. invoice, measurement, expense, excel, cogs)..."
                  className={`w-full p-2.5 rounded-xl border text-xs ${
                    isDarkMode
                      ? 'bg-[#101728] border-[#1F2C45] text-white placeholder-slate-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredSteps.map((item, idx) => {
                  const Icon = item.icon;
                  const isDone = completedSteps.includes(item.stepNumber);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCurrentStepIndex(STEP_BY_STEP_GUIDE.findIndex(s => s.id === item.id));
                        setViewMode('step_by_step');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isDarkMode
                          ? 'bg-[#101728] border-[#1B273E] hover:border-amber-500/50 hover:bg-[#152035]'
                          : 'bg-white border-stone-200 hover:border-amber-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                              {item.badge}
                            </span>
                            {isDone && (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                <Check className="w-3 h-3" /> Done
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5 truncate">
                            {language === 'ur' ? item.titleUr : item.titleEn}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {language === 'ur' ? item.summaryUr : item.summaryEn}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-amber-400 font-medium">
                            <span>Open Step Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer: Previous / Next Navigation */}
        <div className={`px-5 py-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-[#0A0F1D] border-[#1F2C45]' : 'bg-[#FAF8F5] border-[#E8E2D6]'
        }`}>
          {viewMode === 'step_by_step' ? (
            <>
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-medium transition-all ${
                  currentStepIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                    : isDarkMode
                    ? 'border-[#1F2C45] bg-[#121A2D] text-slate-200 hover:bg-[#1A253E]'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <div className="flex items-center gap-2 self-center">
                <span className="text-slate-400 text-[11px]">
                  Guided progress: <strong>{currentStepIndex + 1}</strong> of <strong>{STEP_BY_STEP_GUIDE.length}</strong>
                </span>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => handleGoToTab(currentItem.tabTarget)}
                  className="text-amber-400 hover:underline font-semibold text-[11px] flex items-center gap-1"
                >
                  <span>Go to {currentItem.tabLabel} Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {currentStepIndex < STEP_BY_STEP_GUIDE.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-colors"
                  >
                    <span>Next: Step {currentStepIndex + 2}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete All Steps</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-slate-400 text-xs">
                Click any step above to launch its dedicated one-by-one coaching instructions.
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Close Guide
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
