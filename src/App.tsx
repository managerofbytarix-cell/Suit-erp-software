/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ADMIN_USER,
  EMPLOYEE_USER,
  db
} from './db/demoDatabase.ts';
import {
  AuditLog,
  Customer,
  FamilyMember,
  AlterationRecord,
  BespokeMeasurements,
  ExpenseCategory,
  ExpenseEntry,
  Invoice,
  Order,
  OrderStatus,
  PaymentEntry,
  Product,
  SaleType,
  SystemNotification,
  ThermalPrinterConfig,
  UserAccount,
  WhatsAppCloudApiConfig,
  WhatsAppConversation
} from './types/index.ts';

// Components
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { SalesInvoicesView } from './components/SalesInvoicesView.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { CustomersView } from './components/CustomersView.tsx';
import { PaymentsView } from './components/PaymentsView.tsx';
import { ExpensesView } from './components/ExpensesView.tsx';
import { FinancialReportsView } from './components/FinancialReportsView.tsx';
import { ProductsView } from './components/ProductsView.tsx';
import { ThermalReceiptView } from './components/ThermalReceiptView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { AuditLogView } from './components/AuditLogView.tsx';
import { GuidedTourModal } from './components/GuidedTourModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { AIAssistantModal } from './components/AIAssistantModal.tsx';
import { SoftwareGuideModal } from './components/SoftwareGuideModal.tsx';
import { InvoicePrintModal } from './components/InvoicePrintModal.tsx';
import { exportAllBusinessDataToExcel } from './utils/excelExport.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => db.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => db.getTheme() === 'dark');

  // Application Data States
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [categories, setCategories] = useState<string[]>(() => db.getCategories());
  const [invoices, setInvoices] = useState<Invoice[]>(() => db.getInvoices(currentUser.role));
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders(currentUser.role));
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers(currentUser.role));
  const [payments, setPayments] = useState<PaymentEntry[]>(() => db.getPayments());
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => {
    try {
      return db.getExpenses(currentUser.role);
    } catch {
      return [];
    }
  });
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => db.getExpenseCategories());
  const [whatsappConversations, setWhatsappConversations] = useState<WhatsAppConversation[]>(() =>
    db.getWhatsAppConversations(currentUser.role)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => db.getAuditLogs());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => db.getNotifications());
  const [printerConfig, setPrinterConfig] = useState<ThermalPrinterConfig>(() => db.getPrinterConfig());
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppCloudApiConfig>(() => db.getWhatsAppConfig());

  // Interactive UI modals & authentication states
  const [isSessionAuthenticated, setIsSessionAuthenticated] = useState<boolean>(() => db.isSessionAuthenticated());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [tourStep, setTourStep] = useState(1);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [preselectedOrderCustomer, setPreselectedOrderCustomer] = useState<Customer | undefined>(undefined);
  const [preselectedOrderMember, setPreselectedOrderMember] = useState<FamilyMember | undefined>(undefined);
  const [orderForPrint, setOrderForPrint] = useState<Order | null>(null);
  const [invoiceForPrint, setInvoiceForPrint] = useState<Invoice | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Hidden file input for backup restore
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Refresh reactive data
  const refreshAllData = (user: UserAccount) => {
    setProducts(db.getProducts());
    setCategories(db.getCategories());
    setInvoices(db.getInvoices(user.role));
    setOrders(db.getOrders(user.role));
    setCustomers(db.getCustomers(user.role));
    setPayments(db.getPayments());
    try {
      setExpenses(db.getExpenses(user.role));
    } catch {
      setExpenses([]);
    }
    setExpenseCategories(db.getExpenseCategories());
    setWhatsappConversations(db.getWhatsAppConversations(user.role));
    setAuditLogs(db.getAuditLogs());
    setNotifications(db.getNotifications());
    setPrinterConfig(db.getPrinterConfig());
    setWhatsappConfig(db.getWhatsAppConfig());
  };

  useEffect(() => {
    refreshAllData(currentUser);
    // Role & permissions based navigation enforcement
    if (currentUser.role === 'EMPLOYEE') {
      const allowed = currentUser.permissions.allowedViews || ['orders', 'sales_invoices', 'products', 'customers', 'payments', 'thermal'];
      if (!allowed.includes(currentTab)) {
        setCurrentTab(allowed[0] || 'sales_invoices');
      }
    }
  }, [currentUser]);

  // Tab navigation with role & granular permissions authorization
  const handleSelectTab = (tab: string) => {
    if (currentUser.role === 'EMPLOYEE') {
      const allowed = currentUser.permissions.allowedViews || ['orders', 'sales_invoices', 'products', 'customers', 'payments', 'thermal'];
      if (!allowed.includes(tab)) {
        return;
      }
    }
    setCurrentTab(tab);
  };

  // Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    db.setTheme(nextTheme);
  };

  // Auth & Session Handlers
  const handleSwitchUserRole = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    db.logoutUser(currentUser);
    setIsSessionAuthenticated(false);
    setIsLoginModalOpen(true);
  };

  const handleLogin = (user: UserAccount) => {
    db.setCurrentUser(user);
    db.setSessionAuthenticated(true, user);
    setIsSessionAuthenticated(true);
    setCurrentUser(user);
    refreshAllData(user);
    const allowed = user.permissions.allowedViews || ['orders', 'sales_invoices', 'products', 'customers', 'payments', 'thermal'];
    if (user.role === 'EMPLOYEE' && !allowed.includes(currentTab)) {
      setCurrentTab(allowed[0] || 'sales_invoices');
    }
    setIsLoginModalOpen(false);
  };

  // 1-CLICK EXCEL EXPORT HANDLER
  const handleExportAllToExcel = () => {
    exportAllBusinessDataToExcel(
      {
        invoices,
        orders,
        customers,
        payments,
        expenses,
        expenseCategories,
        products,
      },
      {
        businessName: printerConfig.businessName || 'Sartorial Bespoke Atelier & ERP',
        currentUser,
      }
    );
  };

  // Audit Log Handlers
  const handleClearAuditLogs = () => {
    try {
      db.clearAuditLogs(currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Failed to clear audit logs');
    }
  };

  const handleAddManualAuditLog = (action: string, details: string, entityType: AuditLog['entityType']) => {
    db.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      entityType,
    });
    refreshAllData(currentUser);
  };

  // Product Actions
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    db.addProduct(newProductData, currentUser);
    refreshAllData(currentUser);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    db.updateProduct(id, updates, currentUser);
    refreshAllData(currentUser);
  };

  const handleUpdateStock = (id: string, delta: number, reason: string) => {
    db.updateStock(id, delta, reason, currentUser);
    refreshAllData(currentUser);
  };

  const handleDeleteProduct = (id: string) => {
    try {
      db.deleteProduct(id, currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Cannot delete product');
    }
  };

  // Category Actions
  const handleAddCategory = (name: string) => {
    const updated = db.addCategory(name, currentUser);
    setCategories([...updated]);
    refreshAllData(currentUser);
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const updated = db.renameCategory(oldName, newName, currentUser);
    setCategories([...updated]);
    refreshAllData(currentUser);
  };

  const handleDeleteCategory = (name: string) => {
    try {
      const updated = db.deleteCategory(name, currentUser);
      setCategories([...updated]);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Sales & Invoice Actions
  const handleRecordSale = (saleData: any) => {
    const result = db.createSale(saleData, currentUser);
    refreshAllData(currentUser);
    if (result.invoice) {
      setInvoiceForPrint(result.invoice);
    }
  };

  const handleRecordInvoicePayment = (
    invoiceNumber: string,
    amount: number,
    method: string,
    ref: string,
    notes: string
  ) => {
    try {
      db.recordInvoicePayment(invoiceNumber, amount, method, ref, notes, currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const handleRecordInvoicePrint = (invoiceId: string, format: 'A4' | '80mm') => {
    db.recordInvoicePrint(invoiceId, format, currentUser);
    refreshAllData(currentUser);
  };

  // Order Actions
  const handleCreateOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const created = db.createOrder(orderData, currentUser);
    refreshAllData(currentUser);
    setOrderForPrint(created);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    db.updateOrderStatus(orderId, newStatus, currentUser);
    refreshAllData(currentUser);
  };

  const handleCancelOrder = (orderId: string, restock: boolean, reason: string) => {
    db.cancelOrder(orderId, restock, reason, currentUser);
    refreshAllData(currentUser);
  };

  // Customer & Family Member Actions
  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'totalOrdersCount' | 'totalSpentPKR' | 'remainingBalancePKR' | 'createdAt'>) => {
    db.addCustomer(customerData, currentUser);
    refreshAllData(currentUser);
  };

  const handleUpdateCustomer = (customerId: string, updates: Partial<Customer>) => {
    db.updateCustomer(customerId, updates, currentUser);
    refreshAllData(currentUser);
  };

  const handleDeleteCustomer = (customerId: string) => {
    try {
      db.deleteCustomer(customerId, currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Cannot delete customer account');
    }
  };

  const handleAddCity = (city: string) => {
    db.addCity(city, currentUser);
    refreshAllData(currentUser);
  };

  const handleUpdateMeasurements = (customerId: string, measurements: Customer['measurements']) => {
    db.updateCustomerMeasurements(customerId, measurements, currentUser);
    refreshAllData(currentUser);
  };

  const handleAddFamilyMember = (
    customerId: string,
    memberData: Omit<FamilyMember, 'id' | 'customerId' | 'createdAt' | 'updatedAt' | 'isArchived' | 'measurementHistory' | 'alterations'>
  ) => {
    db.addFamilyMember(customerId, memberData, currentUser);
    refreshAllData(currentUser);
  };

  const handleUpdateFamilyMember = (customerId: string, memberId: string, updates: Partial<FamilyMember>) => {
    db.updateFamilyMember(customerId, memberId, updates, currentUser);
    refreshAllData(currentUser);
  };

  const handleArchiveFamilyMember = (customerId: string, memberId: string) => {
    db.archiveFamilyMember(customerId, memberId, currentUser);
    refreshAllData(currentUser);
  };

  const handleUnarchiveFamilyMember = (customerId: string, memberId: string) => {
    db.unarchiveFamilyMember(customerId, memberId, currentUser);
    refreshAllData(currentUser);
  };

  const handleAddMemberMeasurementRevision = (
    customerId: string,
    memberId: string,
    revisionData: {
      measurements: BespokeMeasurements;
      fitNotes?: string;
      customFields?: Record<string, string | number>;
    }
  ) => {
    db.addMemberMeasurementRevision(customerId, memberId, revisionData, currentUser);
    refreshAllData(currentUser);
  };

  const handleAddMemberAlteration = (
    customerId: string,
    memberId: string,
    alteration: Omit<AlterationRecord, 'id' | 'date'>
  ) => {
    db.addMemberAlteration(customerId, memberId, alteration, currentUser);
    refreshAllData(currentUser);
  };

  // WhatsApp Actions
  const handleSendMessage = (conversationId: string, text: string, templateName?: string) => {
    db.sendWhatsAppMessage(conversationId, text, templateName, currentUser);
    refreshAllData(currentUser);
  };

  const handleSimulateReply = (conversationId: string, text: string) => {
    db.simulateCustomerReply(conversationId, text);
    refreshAllData(currentUser);
  };

  const handleLinkNewWhatsAppContact = (
    customerId: string,
    name: string,
    phone: string,
    initialMessage?: string
  ) => {
    db.addWhatsAppContact(customerId, name, phone, initialMessage, currentUser);
    refreshAllData(currentUser);
  };

  const handleUpdateWhatsAppConfig = (cfg: WhatsAppCloudApiConfig) => {
    try {
      db.updateWhatsAppConfig(cfg, currentUser);
      setWhatsappConfig(cfg);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error updating WhatsApp config');
    }
  };

  // Expenses & Categories Actions
  const handleRecordExpense = (expenseData: Omit<ExpenseEntry, 'id'>) => {
    try {
      db.recordExpense(expenseData, currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error recording expense');
    }
  };

  const handleDeleteExpense = (id: string) => {
    try {
      db.deleteExpense(id, currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error deleting expense');
    }
  };

  const handleAddExpenseCategory = (name: string, description: string, isDirectCost: boolean) => {
    try {
      db.addExpenseCategory(name, description, isDirectCost, currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error creating category');
    }
  };

  const handleUpdateExpenseCategory = (id: string, updates: Partial<ExpenseCategory>) => {
    try {
      db.updateExpenseCategory(id, updates, currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error updating category');
    }
  };

  const handleDeleteExpenseCategory = (id: string) => {
    try {
      db.deleteExpenseCategory(id, currentUser);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  const handleRecordPayment = (paymentData: Omit<PaymentEntry, 'id'>) => {
    db.recordPayment(paymentData, currentUser);
    refreshAllData(currentUser);
  };

  // Settings Actions
  const handleUpdatePrinterConfig = (config: ThermalPrinterConfig) => {
    try {
      db.updatePrinterConfig(config, currentUser);
      setPrinterConfig(config);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error updating printer settings');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset store data? All records will revert to initial factory settings.')) {
      db.resetDemoData();
      const freshUser = db.getCurrentUser();
      setCurrentUser(freshUser);
      refreshAllData(freshUser);
    }
  };

  const handleClearAllData = () => {
    db.clearAllData(currentUser);
    refreshAllData(currentUser);
  };

  const handleClearSettingsData = () => {
    try {
      const cleanCfg = db.clearSettingsData(currentUser);
      setPrinterConfig(cleanCfg);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error clearing settings');
    }
  };

  const handleRemoveAllDemoData = () => {
    try {
      const cleanCfg = db.removeAllDemoData(currentUser);
      setPrinterConfig(cleanCfg);
      refreshAllData(currentUser);
    } catch (err: any) {
      alert(err.message || 'Error removing demo data');
    }
  };

  const handleLoadSampleData = () => {
    db.loadSampleData(currentUser);
    refreshAllData(currentUser);
  };

  const handleMarkNotificationRead = (id: string) => {
    db.markNotificationRead(id);
    setNotifications(db.getNotifications());
  };

  // Backup & Import/Export
  const handleExportBackup = () => {
    const jsonStr = db.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailor_erp_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    backupFileInputRef.current?.click();
  };

  const handleBackupFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        db.importFullBackup(reader.result as string, currentUser);
        refreshAllData(currentUser);
        alert('Database backup restored successfully!');
      } catch (err: any) {
        alert(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExportProductsCSV = () => {
    const csv = db.exportProductsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportProductsJSON = () => {
    const jsonStr = JSON.stringify(db.getProducts(), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_catalog_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProductsCSV = (csvText: string) => {
    const res = db.importProductsCSV(csvText, currentUser);
    refreshAllData(currentUser);
    return res;
  };

  // AI Assistant Action Handlers
  const handleExecuteAICreateOrder = (payload: any) => {
    const defaultProduct = products[0];
    const customer = customers.find((c) => c.name.toLowerCase().includes((payload.customerName || '').toLowerCase())) || customers[0];
    const orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
      customerId: customer?.id || 'cust_ai',
      customerName: payload.customerName || customer?.name || 'Distinguished Client',
      customerPhone: customer?.phone || '+92 300 0000000',
      customerCity: customer?.city || 'Lahore',
      customerAddress: customer?.address || 'Gulberg III, Lahore',
      items: [
        {
          productId: defaultProduct?.id || 'prod_1',
          productCode: defaultProduct?.code || 'ZS-701',
          title: payload.itemTitle || defaultProduct?.title || 'Bespoke Suit',
          fabric: defaultProduct?.fabric || 'Super 150s Merino Wool',
          color: defaultProduct?.color || 'Navy Blue',
          sizeOrTailoring: '40R',
          quantity: 1,
          unitPricePKR: defaultProduct?.pricePKR || 85000,
          costPKR: defaultProduct?.costPKR || 42000,
          totalPricePKR: defaultProduct?.pricePKR || 85000,
        },
      ],
      subtotalPKR: defaultProduct?.pricePKR || 85000,
      tailoringFeePKR: 4000,
      discountPKR: 0,
      shippingFeePKR: 0,
      grandTotalPKR: (defaultProduct?.pricePKR || 85000) + 4000,
      advancePaidPKR: Number(payload.advancePKR) || 40000,
      balanceDuePKR: Math.max(0, ((defaultProduct?.pricePKR || 85000) + 4000) - (Number(payload.advancePKR) || 40000)),
      paymentStatus: 'Partial',
      paymentMethod: 'Bank Transfer / Raast',
      status: 'In Tailoring',
      isRushOrder: false,
      deliveryDate: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10),
      specialInstructions: payload.notes || 'Created via Sartorial AI Assistant',
    };

    const newOrder = db.createOrder(orderPayload, currentUser);
    refreshAllData(currentUser);
    setOrderForPrint(newOrder);
    setCurrentTab('sales_invoices');
    setIsAIAssistantOpen(false);
  };

  const handleExecuteAIUpdateStock = (productCode: string, delta: number, reason: string) => {
    const target = products.find((p) => p.code.toLowerCase() === productCode.toLowerCase());
    if (target) {
      db.updateStock(target.id, delta, reason, currentUser);
      refreshAllData(currentUser);
      setIsAIAssistantOpen(false);
    }
  };

  const handleExecuteAIGenerateInvoice = (orderNumber: string) => {
    const targetInv = invoices.find((i) => i.invoiceNumber.toLowerCase() === orderNumber.toLowerCase() || i.orderNumber?.toLowerCase() === orderNumber.toLowerCase());
    if (targetInv) {
      setInvoiceForPrint(targetInv);
    }
    setCurrentTab('sales_invoices');
    setIsAIAssistantOpen(false);
  };

  const handleExecuteAIAddCategory = (categoryName: string) => {
    handleAddCategory(categoryName);
    setIsAIAssistantOpen(false);
  };

  // Cross-Navigation Shortcuts
  const handleSelectOrderForPrint = (order: Order) => {
    setOrderForPrint(order);
    setCurrentTab('thermal');
  };

  const handleSelectInvoiceForPrint = (invoice: Invoice) => {
    setInvoiceForPrint(invoice);
  };

  const handleStartTour = () => {
    setTourStep(1);
    setIsTourOpen(true);
    setCurrentTab('dashboard');
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDarkMode ? 'bg-[#0B101B] text-slate-100' : 'bg-[#FAF9F6] text-slate-900'
    }`}>
      {/* Hidden file input for backup restore */}
      <input
        type="file"
        ref={backupFileInputRef}
        accept=".json,application/json"
        onChange={handleBackupFileSelected}
        className="hidden"
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        businessName={printerConfig.businessName}
        websiteUrl={printerConfig.websiteUrl}
        onOpenGuide={() => setIsGuideOpen(true)}
        onSwitchUser={handleSwitchUserRole}
        onLogout={handleLogout}
        onResetData={handleResetData}
        onStartTour={handleStartTour}
        onOpenAI={() => setIsAIAssistantOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onExportExcel={handleExportAllToExcel}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          currentUser={currentUser}
          notifications={notifications}
          businessName={printerConfig.businessName}
          websiteUrl={printerConfig.websiteUrl}
          autoSaveEnabled={printerConfig.autoSaveEnabled}
          onOpenGuide={() => setIsGuideOpen(true)}
          onMarkNotificationRead={handleMarkNotificationRead}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onStartTour={handleStartTour}
          onSwitchUser={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onNavigateTab={handleSelectTab}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onExportExcel={handleExportAllToExcel}
        />

        {/* View Router */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              invoices={invoices}
              payments={payments}
              expenses={expenses}
              products={products}
              customers={customers}
              currentUser={currentUser}
              onNavigateTab={setCurrentTab}
              onOpenCreateOrder={() => setIsCreateOrderModalOpen(true)}
              onOpenNewSale={() => {
                setCurrentTab('sales_invoices');
              }}
              onOpenRecordPayment={() => {
                setCurrentTab('payments');
              }}
              onOpenRecordExpense={() => {
                setCurrentTab('expenses');
              }}
              onOpenAddProduct={() => setCurrentTab('products')}
              onSelectOrderForPrint={handleSelectOrderForPrint}
              onSelectInvoiceForPrint={handleSelectInvoiceForPrint}
              onStartTour={handleStartTour}
              onExportExcel={handleExportAllToExcel}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB: SALES & INVOICES */}
          {currentTab === 'sales_invoices' && (
            <SalesInvoicesView
              invoices={invoices}
              customers={customers}
              products={products}
              printerConfig={printerConfig}
              currentUser={currentUser}
              onRecordSale={handleRecordSale}
              onRecordInvoicePayment={handleRecordInvoicePayment}
              onRecordPrint={handleRecordInvoicePrint}
              onExportExcel={handleExportAllToExcel}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB: BESPOKE STITCHING ORDERS */}
          {currentTab === 'orders' && (
            <OrdersView
              orders={orders}
              products={products}
              customers={customers}
              currentUser={currentUser}
              preselectedCustomer={preselectedOrderCustomer}
              preselectedMember={preselectedOrderMember}
              onCreateOrder={handleCreateOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onCancelOrder={handleCancelOrder}
              onSelectOrderForPrint={handleSelectOrderForPrint}
              isCreateModalOpen={isCreateOrderModalOpen}
              onCloseCreateModal={() => {
                setIsCreateOrderModalOpen(false);
                setPreselectedOrderMember(undefined);
              }}
              onOpenCreateModal={() => {
                setPreselectedOrderCustomer(undefined);
                setPreselectedOrderMember(undefined);
                setIsCreateOrderModalOpen(true);
              }}
              availableCities={db.getCities()}
              onAddCity={handleAddCity}
            />
          )}

          {/* TAB: CUSTOMERS & NAAP DIRECTORY */}
          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              currentUser={currentUser}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              availableCities={db.getCities()}
              onAddCity={handleAddCity}
              onUpdateMeasurements={handleUpdateMeasurements}
              onAddFamilyMember={handleAddFamilyMember}
              onUpdateFamilyMember={handleUpdateFamilyMember}
              onArchiveFamilyMember={handleArchiveFamilyMember}
              onUnarchiveFamilyMember={handleUnarchiveFamilyMember}
              onAddMemberMeasurementRevision={handleAddMemberMeasurementRevision}
              onAddMemberAlteration={handleAddMemberAlteration}
              onSelectCustomerForOrder={(cust, member) => {
                setPreselectedOrderCustomer(cust);
                setPreselectedOrderMember(member);
                setIsCreateOrderModalOpen(true);
                setCurrentTab('orders');
              }}
              onSelectOrderForPrint={handleSelectOrderForPrint}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB: PAYMENTS & RECEIVABLES */}
          {currentTab === 'payments' && (
            <PaymentsView
              payments={payments}
              invoices={invoices}
              customers={customers}
              currentUser={currentUser}
              printerConfig={printerConfig}
              onRecordPayment={handleRecordPayment}
              onRecordInvoicePayment={handleRecordInvoicePayment}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB: EXPENSES MANAGEMENT */}
          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              expenseCategories={expenseCategories}
              currentUser={currentUser}
              onRecordExpense={handleRecordExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddCategory={handleAddExpenseCategory}
              onUpdateCategory={handleUpdateExpenseCategory}
              onDeleteCategory={handleDeleteExpenseCategory}
              onExportExcel={handleExportAllToExcel}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB: FINANCIAL REPORTS & P&L */}
          {currentTab === 'finance' && (
            <FinancialReportsView
              invoices={invoices}
              orders={orders}
              customers={customers}
              payments={payments}
              expenses={expenses}
              expenseCategories={expenseCategories}
              products={products}
              currentUser={currentUser}
              onExportExcel={handleExportAllToExcel}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB: SUIT CATALOG & FABRICS */}
          {currentTab === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              currentUser={currentUser}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onUpdateStock={handleUpdateStock}
              onDeleteProduct={handleDeleteProduct}
              onAddCategory={handleAddCategory}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
              onExportCSV={handleExportProductsCSV}
              onExportJSON={handleExportProductsJSON}
              onImportCSV={handleImportProductsCSV}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB: THERMAL STATION */}
          {currentTab === 'thermal' && (
            <ThermalReceiptView
              orders={orders}
              currentUser={currentUser}
              printerConfig={printerConfig}
              selectedOrder={orderForPrint}
              onUpdatePrinterConfig={handleUpdatePrinterConfig}
            />
          )}

          {/* TAB: SETTINGS & ACCESS */}
          {currentTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              printerConfig={printerConfig}
              auditLogs={auditLogs}
              onUpdatePrinterConfig={handleUpdatePrinterConfig}
              onResetData={handleResetData}
              onClearAllData={handleClearAllData}
              onClearSettingsData={handleClearSettingsData}
              onRemoveAllDemoData={handleRemoveAllDemoData}
              onLoadSampleData={handleLoadSampleData}
              onSwitchUser={() => setIsLoginModalOpen(true)}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onReloadUsers={() => {
                const updatedCurrentUser = db.getCurrentUser();
                setCurrentUser(updatedCurrentUser);
                refreshAllData(updatedCurrentUser);
              }}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB: AUDIT LOG */}
          {currentTab === 'audit' && (
            <AuditLogView
              auditLogs={auditLogs}
              currentUser={currentUser}
              onAddManualLog={handleAddManualAuditLog}
              onClearLogs={handleClearAuditLogs}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>

      {/* INVOICE PRINT MODAL (Available across the app) */}
      <InvoicePrintModal
        invoice={invoiceForPrint}
        printerConfig={printerConfig}
        currentUser={currentUser}
        onClose={() => setInvoiceForPrint(null)}
        onRecordPrint={handleRecordInvoicePrint}
      />

      {/* Sartorial AI Atelier Manager Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        currentUser={currentUser}
        products={products}
        orders={orders}
        customers={customers}
        categories={categories}
        onExecuteCreateOrder={handleExecuteAICreateOrder}
        onExecuteUpdateStock={handleExecuteAIUpdateStock}
        onExecuteGenerateInvoice={handleExecuteAIGenerateInvoice}
        onExecuteAddCategory={handleExecuteAIAddCategory}
        isDarkMode={isDarkMode}
      />

      {/* Interactive Software User Manual & Step-by-Step Guide */}
      <SoftwareGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        printerConfig={printerConfig}
        onNavigateTab={setCurrentTab}
        isDarkMode={isDarkMode}
      />

      {/* Guided Tour Walkthrough Modal */}
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        currentStep={tourStep}
        onStepChange={setTourStep}
        onNavigateTab={setCurrentTab}
      />

      {/* Mandatory Password Login & Session Lock Modal */}
      <LoginModal
        isOpen={isLoginModalOpen || !isSessionAuthenticated}
        isLocked={!isSessionAuthenticated}
        onClose={() => {
          if (isSessionAuthenticated) {
            setIsLoginModalOpen(false);
          }
        }}
        onLogin={handleLogin}
        activeUser={currentUser}
      />
    </div>
  );
}
