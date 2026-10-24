/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Customer, ExpenseCategory, ExpenseEntry, Invoice, Order, PaymentEntry, Product, UserAccount } from '../types/index.ts';

export interface ExcelExportOptions {
  periodLabel?: string;
  startDate?: string;
  endDate?: string;
  currentUser?: UserAccount;
  businessName?: string;
}

export function exportAllBusinessDataToExcel(
  data: {
    invoices: Invoice[];
    orders: Order[];
    customers: Customer[];
    payments: PaymentEntry[];
    expenses: ExpenseEntry[];
    expenseCategories: ExpenseCategory[];
    products: Product[];
  },
  options: ExcelExportOptions = {}
): void {
  const {
    invoices,
    orders,
    customers,
    payments,
    expenses,
    expenseCategories,
    products,
  } = data;

  const businessName = options.businessName || 'Sartorial Bespoke Atelier & ERP';
  const exportDate = new Date().toISOString().slice(0, 10);
  const periodLabel = options.periodLabel || 'All Historical Records';

  // Create new workbook
  const workbook = XLSX.utils.book_new();

  // 1. FILTERING DATA BY DATE RANGE IF SPECIFIED
  const filterByDate = (dateStr: string) => {
    if (!dateStr) return true;
    const itemDate = dateStr.slice(0, 10);
    if (options.startDate && itemDate < options.startDate) return false;
    if (options.endDate && itemDate > options.endDate) return false;
    return true;
  };

  const filteredInvoices = invoices.filter((inv) => filterByDate(inv.date));
  const filteredOrders = orders.filter((o) => filterByDate(o.createdAt));
  const filteredPayments = payments.filter((p) => filterByDate(p.date));
  const filteredExpenses = expenses.filter((e) => filterByDate(e.date));

  // --- CALCULATION OF FINANCIAL METRICS ---
  const totalSalesRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotalPKR, 0);
  const totalPaymentsReceived = filteredPayments.reduce((sum, p) => sum + p.amountPKR, 0);
  const totalOutstandingReceivables = filteredInvoices.reduce((sum, inv) => sum + inv.balanceDuePKR, 0);

  // Total Direct Cost of Goods Sold (COGS): Fabric, Linings, Artisan Stitching Fees
  let totalCOGS = 0;
  for (const inv of filteredInvoices) {
    for (const it of inv.items) {
      if (it.costPKR) {
        totalCOGS += it.costPKR * (it.quantity || 1);
      } else {
        // Fallback estimate: 45% of retail price
        totalCOGS += (it.unitPricePKR || 0) * (it.quantity || 1) * 0.45;
      }
    }
  }
  // Include direct expenses (e.g. Fabric purchases, Sewing materials, Tailor wages)
  const directExpenses = filteredExpenses.filter((e) => e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
  const operatingExpenses = filteredExpenses.filter((e) => !e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
  const totalBusinessExpenses = directExpenses + operatingExpenses;

  const grossProfit = totalSalesRevenue - totalCOGS;
  const grossProfitMargin = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(2) + '%' : '0.00%';
  const netProfit = grossProfit - operatingExpenses;
  const netProfitMargin = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(2) + '%' : '0.00%';

  const totalSuitsSold = filteredInvoices.reduce((count, inv) => {
    return count + inv.items.filter((it) => it.type === 'ready_made' || it.title.toLowerCase().includes('suit')).reduce((c, it) => c + it.quantity, 0);
  }, 0);

  const completedStitchingOrders = filteredOrders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;
  const pendingStitchingOrders = filteredOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Completed' && o.status !== 'Cancelled').length;

  // -------------------------------------------------------------
  // WORKSHEET 1: DASHBOARD & FINANCIAL SUMMARY
  // -------------------------------------------------------------
  const summaryRows = [
    [businessName, '', ''],
    ['FINANCIAL & OPERATIONAL AUDIT REPORT', '', ''],
    ['Generated On:', exportDate, ''],
    ['Selected Scope / Filter:', periodLabel, ''],
    ['Date Range:', `${options.startDate || 'Beginning'} to ${options.endDate || 'Present'}`, ''],
    ['', '', ''],
    ['KEY PERFORMANCE INDICATORS (KPI)', 'AMOUNT (PKR)', 'REMARKS / BASIS'],
    ['Total Sales Revenue (Accrual)', totalSalesRevenue, 'Total invoiced value of suits, stitching, fabric & alterations'],
    ['Total Cash / Payments Collected', totalPaymentsReceived, 'Actual cash received through Bank, Raast, Card & Cash'],
    ['Total Outstanding Customer Balances', totalOutstandingReceivables, 'Pending accounts receivable owed by customers'],
    ['Total Cost of Goods Sold (COGS)', totalCOGS, 'Direct fabric procurement, threads, canvases, tailor artisan labor'],
    ['Gross Profit', grossProfit, 'Sales Revenue minus Direct Cost of Goods Sold'],
    ['Gross Profit Margin', grossProfitMargin, 'Gross Profit as a percentage of Total Sales Revenue'],
    ['Total Operating Expenses', operatingExpenses, 'Showroom rent, electricity, maintenance, logistics, overheads'],
    ['Total Business Expenses (All)', totalBusinessExpenses, 'Direct materials + operating expenses combined'],
    ['Net Profit', netProfit, 'Gross Profit minus Operating Overheads'],
    ['Net Profit Margin', netProfitMargin, 'Net bottom-line earnings percentage'],
    ['', '', ''],
    ['OPERATIONAL TAILORING WORKLOAD', 'COUNT', 'REMARKS'],
    ['Total Ready-Made Suits Sold', totalSuitsSold, 'Ready-to-wear luxury garments sold'],
    ['Stitching Orders Completed & Delivered', completedStitchingOrders, 'Finished custom bespoke tailoring garments'],
    ['Stitching Orders In-Progress / Pending', pendingStitchingOrders, 'Currently in cutting, canvassing, or trial fitting queue'],
    ['Active Registered Customers', customers.length, 'Total registered client accounts in database'],
    ['Total Invoices Generated', filteredInvoices.length, 'Invoices issued during the scope'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 38 }, { wch: 22 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Dashboard Summary');

  // -------------------------------------------------------------
  // WORKSHEET 2: SALES & INVOICES
  // -------------------------------------------------------------
  const invoicesData = filteredInvoices.map((inv) => ({
    'Invoice #': inv.invoiceNumber,
    'Date': inv.date,
    'Customer Name': inv.customerName,
    'Phone': inv.customerPhone,
    'City': inv.customerCity,
    'Sale Type': inv.saleType,
    'Items Summary': inv.items.map((it) => `${it.quantity}x ${it.title}`).join('; '),
    'Subtotal (PKR)': inv.subtotalPKR,
    'Tailoring Fee (PKR)': inv.tailoringFeePKR,
    'Discount (PKR)': inv.discountPKR,
    'Tax (PKR)': inv.taxPKR,
    'Grand Total (PKR)': inv.grandTotalPKR,
    'Paid Amount (PKR)': inv.paidAmountPKR,
    'Balance Due (PKR)': inv.balanceDuePKR,
    'Payment Status': inv.paymentStatus,
    'Payment Method': inv.paymentMethod,
    'Order Reference': inv.orderNumber || '-',
    'Print Count': inv.printHistory?.length || 0,
    'Notes': inv.notes || '',
  }));

  const wsInvoices = XLSX.utils.json_to_sheet(invoicesData.length ? invoicesData : [{ 'Invoice #': 'No Records' }]);
  wsInvoices['!cols'] = [
    { wch: 16 }, { wch: 12 }, { wch: 24 }, { wch: 18 }, { wch: 14 },
    { wch: 16 }, { wch: 35 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
    { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 },
    { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsInvoices, 'Sales & Invoices');

  // -------------------------------------------------------------
  // WORKSHEET 3: CUSTOMERS & MEASUREMENTS DIRECTORY
  // -------------------------------------------------------------
  const customersData = customers.map((c) => ({
    'Customer ID': c.id,
    'Full Name': c.name,
    'Phone Number': c.phone,
    'Email Address': c.email || '-',
    'City': c.city,
    'Address': c.address,
    'Total Orders': c.totalOrdersCount,
    'Total Purchases (PKR)': c.totalSpentPKR,
    'Remaining Balance (PKR)': c.remainingBalancePKR,
    'Family Members Count': c.familyMembers?.length || 1,
    'Chest (in)': c.measurements?.chest || '-',
    'Waist (in)': c.measurements?.waist || '-',
    'Hips (in)': c.measurements?.hip || '-',
    'Shoulder (in)': c.measurements?.shoulder || '-',
    'Sleeve (in)': c.measurements?.sleeve || '-',
    'Jacket Length (in)': c.measurements?.jacketLength || '-',
    'Pant Waist (in)': c.measurements?.trouserWaist || '-',
    'Pant Length (in)': c.measurements?.trouserLength || '-',
    'Inseam (in)': c.measurements?.inseam || '-',
    'Lapel Cut': c.measurements?.lapelStyle || '-',
    'Vent Style': c.measurements?.ventStyle || '-',
    'Client Notes': c.notes || '-',
    'Registered Date': c.createdAt ? c.createdAt.slice(0, 10) : '-',
  }));

  const wsCustomers = XLSX.utils.json_to_sheet(customersData.length ? customersData : [{ 'Customer ID': 'No Records' }]);
  wsCustomers['!cols'] = [
    { wch: 14 }, { wch: 24 }, { wch: 18 }, { wch: 26 }, { wch: 14 },
    { wch: 32 }, { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 20 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
    { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
    { wch: 14 }, { wch: 30 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsCustomers, 'Customers & Naap');

  // -------------------------------------------------------------
  // WORKSHEET 4: STITCHING ORDERS & TAILORING WORKFLOW
  // -------------------------------------------------------------
  const ordersData = filteredOrders.map((o) => ({
    'Order #': o.orderNumber,
    'Invoice Ref': o.invoiceNumber || '-',
    'Client Name': o.customerName,
    'Member (Attn)': o.familyMemberName ? `${o.familyMemberName} (${o.familyMemberRelationship || 'Member'})` : 'Self',
    'Phone': o.customerPhone,
    'City': o.customerCity,
    'Items Count': o.items.length,
    'Garment Description': o.items.map((it) => `${it.quantity}x ${it.title} [${it.fabric}]`).join('; '),
    'Tailoring Stage': o.status,
    'Delivery Due Date': o.deliveryDate,
    'Event Date': o.eventDate || '-',
    'Rush Order': o.isRushOrder ? 'YES (Wedding Rush)' : 'Standard',
    'Tailoring Fee (PKR)': o.tailoringFeePKR,
    'Grand Total (PKR)': o.grandTotalPKR,
    'Advance Paid (PKR)': o.advancePaidPKR,
    'Balance Outstanding (PKR)': o.balanceDuePKR,
    'Payment Status': o.paymentStatus,
    'Payment Method': o.paymentMethod,
    'Special Instructions': o.specialInstructions || '',
    'Booked Date': o.createdAt ? o.createdAt.slice(0, 10) : '-',
  }));

  const wsOrders = XLSX.utils.json_to_sheet(ordersData.length ? ordersData : [{ 'Order #': 'No Records' }]);
  wsOrders['!cols'] = [
    { wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 22 }, { wch: 18 },
    { wch: 14 }, { wch: 12 }, { wch: 36 }, { wch: 18 }, { wch: 16 },
    { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 18 },
    { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 32 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsOrders, 'Stitching Orders');

  // -------------------------------------------------------------
  // WORKSHEET 5: PAYMENTS RECEIVED & RECEIPTS
  // -------------------------------------------------------------
  const paymentsData = filteredPayments.map((p) => ({
    'Receipt #': p.receiptNumber || `RCP-${p.id.slice(-6)}`,
    'Date / Time': p.date,
    'Invoice #': p.invoiceNumber || '-',
    'Order #': p.orderNumber || '-',
    'Customer Name': p.customerName,
    'Amount Received (PKR)': p.amountPKR,
    'Payment Type': p.type,
    'Payment Method / Channel': p.method,
    'Transaction Ref / Slip #': p.referenceNumber,
    'Recorded By': p.recordedBy,
    'Notes': p.notes || '',
  }));

  const wsPayments = XLSX.utils.json_to_sheet(paymentsData.length ? paymentsData : [{ 'Receipt #': 'No Records' }]);
  wsPayments['!cols'] = [
    { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 24 },
    { wch: 22 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 26 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsPayments, 'Payments Received');

  // -------------------------------------------------------------
  // WORKSHEET 6: EXPENSES LEDGER
  // -------------------------------------------------------------
  const expensesData = filteredExpenses.map((e) => ({
    'Voucher #': e.receiptNumber || `VCH-${e.id.slice(-6)}`,
    'Date': e.date,
    'Expense Category': e.category,
    'Classification': e.isDirectCost ? 'Direct COGS (Materials/Wages)' : 'General Operating Overhead',
    'Description': e.description,
    'Vendor / Payee': e.vendorName,
    'Payment Method': e.paymentMethod,
    'Amount (PKR)': e.amountPKR,
    'Recorded By': e.recordedBy,
  }));

  const wsExpenses = XLSX.utils.json_to_sheet(expensesData.length ? expensesData : [{ 'Voucher #': 'No Records' }]);
  wsExpenses['!cols'] = [
    { wch: 16 }, { wch: 12 }, { wch: 26 }, { wch: 30 }, { wch: 36 },
    { wch: 24 }, { wch: 20 }, { wch: 18 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsExpenses, 'Expenses Ledger');

  // -------------------------------------------------------------
  // WORKSHEET 7: EXPENSE CATEGORIES SUMMARY
  // -------------------------------------------------------------
  const catSummary = expenseCategories.map((cat) => {
    const catExpenses = filteredExpenses.filter((e) => e.category.toLowerCase() === cat.name.toLowerCase());
    const totalSpent = catExpenses.reduce((sum, e) => sum + e.amountPKR, 0);
    return {
      'Category Name': cat.name,
      'Cost Classification': cat.isDirectCost ? 'Direct COGS Cost' : 'Operating Overhead',
      'Transactions Count': catExpenses.length,
      'Total Spent (PKR)': totalSpent,
      'Share of Expenses': totalBusinessExpenses > 0 ? ((totalSpent / totalBusinessExpenses) * 100).toFixed(2) + '%' : '0.00%',
      'Description': cat.description || '-',
    };
  });

  const wsCategories = XLSX.utils.json_to_sheet(catSummary);
  wsCategories['!cols'] = [
    { wch: 28 }, { wch: 24 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 38 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsCategories, 'Expense Categories');

  // -------------------------------------------------------------
  // WORKSHEET 8: MONTHLY FINANCIAL BREAKDOWN
  // -------------------------------------------------------------
  // Group invoices, payments, expenses by Month (YYYY-MM)
  const allMonthsSet = new Set<string>();
  invoices.forEach((i) => { if (i.date) allMonthsSet.add(i.date.slice(0, 7)); });
  payments.forEach((p) => { if (p.date) allMonthsSet.add(p.date.slice(0, 7)); });
  expenses.forEach((e) => { if (e.date) allMonthsSet.add(e.date.slice(0, 7)); });

  const sortedMonths = Array.from(allMonthsSet).sort().reverse();
  const monthlyStatement = sortedMonths.map((m) => {
    const mInvoices = invoices.filter((i) => i.date?.startsWith(m));
    const mPayments = payments.filter((p) => p.date?.startsWith(m));
    const mExpenses = expenses.filter((e) => e.date?.startsWith(m));

    const mSales = mInvoices.reduce((sum, i) => sum + i.grandTotalPKR, 0);
    const mCash = mPayments.reduce((sum, p) => sum + p.amountPKR, 0);
    const mOutstanding = mInvoices.reduce((sum, i) => sum + i.balanceDuePKR, 0);

    let mCOGS = 0;
    for (const inv of mInvoices) {
      for (const it of inv.items) {
        mCOGS += (it.costPKR || it.unitPricePKR * 0.45) * (it.quantity || 1);
      }
    }
    const mDirectExp = mExpenses.filter((e) => e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
    const mOperatingExp = mExpenses.filter((e) => !e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
    const mTotalExpenses = mDirectExp + mOperatingExp;

    const mGrossProfit = mSales - mCOGS;
    const mNetProfit = mGrossProfit - mOperatingExp;

    return {
      'Month': m,
      'Sales Revenue (PKR)': mSales,
      'Cash Received (PKR)': mCash,
      'Customer Balances Due (PKR)': mOutstanding,
      'COGS Direct Cost (PKR)': mCOGS,
      'Gross Profit (PKR)': mGrossProfit,
      'Gross Margin %': mSales > 0 ? ((mGrossProfit / mSales) * 100).toFixed(1) + '%' : '0.0%',
      'Operating Overhead (PKR)': mOperatingExp,
      'Total Expenses (PKR)': mTotalExpenses,
      'Net Profit (PKR)': mNetProfit,
      'Net Margin %': mSales > 0 ? ((mNetProfit / mSales) * 100).toFixed(1) + '%' : '0.0%',
      'Invoices Count': mInvoices.length,
      'Orders Booked': orders.filter((o) => o.createdAt?.startsWith(m)).length,
    };
  });

  const wsMonthly = XLSX.utils.json_to_sheet(monthlyStatement.length ? monthlyStatement : [{ 'Month': 'No Records' }]);
  wsMonthly['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 26 }, { wch: 22 },
    { wch: 20 }, { wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsMonthly, 'Monthly Financial P&L');

  // Trigger download
  const cleanName = businessName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${cleanName}_Financial_Export_${exportDate}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
