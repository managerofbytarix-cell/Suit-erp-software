/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AuditLog,
  Customer,
  FamilyMember,
  BespokeMeasurements,
  MeasurementRevision,
  AlterationRecord,
  ExpenseCategory,
  ExpenseEntry,
  Invoice,
  Order,
  OrderItem,
  OrderStatus,
  PaymentEntry,
  PaymentStatus,
  Product,
  SaleType,
  SystemNotification,
  ThermalPrinterConfig,
  UserAccount,
  UserRole,
  WhatsAppCloudApiConfig,
  WhatsAppConversation,
  FinancialFilter
} from '../types/index.ts';

// User Account Definitions with Passwords & Granular Permissions
export const ADMIN_USER: UserAccount = {
  id: 'usr_admin_01',
  username: 'admin',
  password: 'admin123',
  name: 'Administrator',
  email: 'admin@atelier.com',
  role: 'ADMIN',
  title: 'Managing Director & Master Tailor',
  createdAt: '2026-01-01',
  permissions: {
    canViewProfits: true,
    canViewCustomerPhone: true,
    canViewCustomerAddress: true,
    canViewPrivateWhatsApp: true,
    canManageSettings: true,
    canDeleteRecords: true,
    canExportData: true,
    canViewFinancialTotals: true,
    canEditMeasurements: true,
    canApplyDiscounts: true,
    allowedViews: ['dashboard', 'orders', 'sales_invoices', 'products', 'customers', 'payments', 'expenses', 'thermal', 'finance', 'settings', 'audit'],
  },
};

export const EMPLOYEE_USER: UserAccount = {
  id: 'usr_emp_02',
  username: 'sales',
  password: 'sales123',
  name: 'Hamza Farooq',
  email: 'sales@sartoriallibas.pk',
  role: 'EMPLOYEE',
  title: 'Showroom Sales & Fitting Associate',
  createdAt: '2026-01-15',
  permissions: {
    canViewProfits: false,
    canViewCustomerPhone: false, // Salesperson can see name, NOT phone number
    canViewCustomerAddress: false, // Salesperson only sees city, address hidden
    canViewPrivateWhatsApp: false,
    canManageSettings: false,
    canDeleteRecords: false,
    canExportData: false,
    canViewFinancialTotals: false, // Total revenue and cashflow balances hidden
    canEditMeasurements: true,
    canApplyDiscounts: true,
    allowedViews: ['orders', 'sales_invoices', 'products', 'customers', 'payments', 'thermal'],
  },
};

export const INITIAL_USERS: UserAccount[] = [ADMIN_USER, EMPLOYEE_USER];

// Automatic cleanup of legacy demo records from previous versions
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.includes('_v1') || k.includes('_v2') || k.includes('_v3') || k.includes('_orders') || k.includes('_products') || k.includes('_customers') || k.includes('_invoices'))) {
        if (!k.includes('_v4_clean')) {
          keysToRemove.push(k);
        }
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
} catch {
  // Ignore in SSR
}

const STORAGE_KEYS = {
  PRODUCTS: 'zs_tailor_products_v4_clean',
  ORDERS: 'zs_tailor_orders_v4_clean',
  INVOICES: 'zs_tailor_invoices_v4_clean',
  CUSTOMERS: 'zs_tailor_customers_v4_clean',
  PAYMENTS: 'zs_tailor_payments_v4_clean',
  EXPENSES: 'zs_tailor_expenses_v4_clean',
  EXPENSE_CATEGORIES: 'zs_tailor_expense_cats_v4_clean',
  WHATSAPP: 'zs_tailor_whatsapp_v4_clean',
  AUDIT_LOGS: 'zs_tailor_audit_logs_v4_clean',
  NOTIFICATIONS: 'zs_tailor_notifications_v4_clean',
  PRINTER_CONFIG: 'zs_tailor_printer_v4_clean',
  WHATSAPP_CONFIG: 'zs_tailor_whatsapp_cfg_v4_clean',
  CURRENT_USER: 'zs_tailor_current_user_v4_clean',
  USERS: 'zs_tailor_users_v4_clean',
  AUTH_SESSION: 'zs_tailor_auth_session_v4_clean',
  CATEGORIES: 'zs_tailor_categories_v4_clean',
  CITIES: 'zs_tailor_cities_v4_clean',
  THEME: 'zs_tailor_theme_v4_clean',
};

const DEFAULT_CATEGORIES: string[] = [
  'Three-Piece Suit',
  'Two-Piece Italian Suit',
  'Tuxedo',
  'Prince Coat',
  'Sherwani',
  'Waistcoat',
  'Luxury Kurta Pajama',
  'Safari Suit',
  'Bespoke Blazer',
  'Premium Suiting Fabric',
  'Stitching Service',
  'Alteration Service',
];

export const DEFAULT_CITIES: string[] = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Peshawar',
  'Multan',
  'Sialkot',
  'Gujranwala',
  'Quetta',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Mirpur (AJK)',
  'Overseas (UK / UAE / USA)'
];

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'exp_cat_1',
    name: 'Tailor Master & Artisan Wages',
    description: 'Weekly and monthly cutting, stitching, and finishing wages paid to master craftsmen',
    isDirectCost: true,
    isDefault: true,
  },
  {
    id: 'exp_cat_2',
    name: 'Fabric & Lining Procurement',
    description: 'Direct purchase of suiting wool, raw silks, velvets, and Bemberg silk linings',
    isDirectCost: true,
    isDefault: true,
  },
  {
    id: 'exp_cat_3',
    name: 'Sewing Materials & Horsehair Canvases',
    description: 'Floating canvases, shoulder pads, chest felts, silk threads, and undercollars',
    isDirectCost: true,
    isDefault: true,
  },
  {
    id: 'exp_cat_4',
    name: 'Buttons, Zippers & Trimmings',
    description: 'Real horn buttons, mother-of-pearl buttons, metallic blazer buttons, YKK brass zippers',
    isDirectCost: true,
    isDefault: true,
  },
  {
    id: 'exp_cat_5',
    name: 'Showroom Rent & Space',
    description: 'Commercial showroom and tailoring workshop lease',
    isDirectCost: false,
    isDefault: true,
  },
  {
    id: 'exp_cat_6',
    name: 'Electricity & Commercial Utilities',
    description: 'LESCO commercial power, generator fuel, and utility bills',
    isDirectCost: false,
    isDefault: true,
  },
  {
    id: 'exp_cat_7',
    name: 'Packaging & Luxury Suit Carriers',
    description: 'Custom embossed garment travel covers, wooden hangers, and presentation boxes',
    isDirectCost: false,
    isDefault: true,
  },
  {
    id: 'exp_cat_8',
    name: 'Logistics, Courier & Shipping',
    description: 'TCS / Leopards courier dispatch for client suits across Pakistan and abroad',
    isDirectCost: false,
    isDefault: true,
  },
  {
    id: 'exp_cat_9',
    name: 'Machinery & Steam Iron Maintenance',
    description: 'Industrial Juki sewing machine oiling, vacuum steam tables, and iron service',
    isDirectCost: false,
    isDefault: true,
  },
  {
    id: 'exp_cat_10',
    name: 'Tea, Refreshments & Hospitality',
    description: 'Client tea, coffee, mineral water, and artisan workshop refreshments',
    isDirectCost: false,
    isDefault: true,
  },
  {
    id: 'exp_cat_11',
    name: 'Marketing & Atelier Display',
    description: 'Mannequins, storefront illumination, catalog photography, and social marketing',
    isDirectCost: false,
    isDefault: true,
  },
  {
    id: 'exp_cat_12',
    name: 'Miscellaneous Shop Expenses',
    description: 'Office stationery, cleaning supplies, and incidental costs',
    isDirectCost: false,
    isDefault: true,
  },
];

// INITIAL ZERO-DEMO DATA (100% Clean Production Slate)
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_PAYMENTS: PaymentEntry[] = [];
export const INITIAL_EXPENSES: ExpenseEntry[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_init',
    timestamp: '2026-10-24 10:00',
    userName: 'Administrator',
    userRole: 'ADMIN',
    action: 'DATABASE_INITIALIZED',
    details: 'Tailoring Shop ERP initialized with clean database ready for your business data.',
    entityType: 'AUTH',
  },
];

export const INITIAL_PRINTER_CONFIG: ThermalPrinterConfig = {
  paperWidth: '80mm',
  businessName: '',
  tagline: '',
  address: '',
  city: '',
  phone: '',
  websiteUrl: '',
  ntnNumber: '',
  footerNote: '',
  printBarcode: true,
  cutPaperAfterPrint: true,
  autoSaveEnabled: true,
};

// SAMPLE DATA (Only loaded if user explicitly clicks "Load Sample Demo Data" in Settings)
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    code: 'ZS-701',
    title: 'Super 150s Royal Navy 3-Piece Bespoke Suit',
    category: 'Three-Piece Suit',
    fabric: 'Super 150s Merino Wool (Dormeuil England)',
    color: 'Royal Navy Blue',
    pricePKR: 85000,
    costPKR: 42000,
    stockQty: 8,
    minStockAlert: 3,
    sizesAvailable: ['38R', '40R', '42R', '44L', 'Bespoke Custom'],
    imageUrl: '/src/assets/images/suit_royal_navy_3piece_1792162981461.jpg',
    description: 'Hand-canvassed Italian cut 3-piece suit with tailored waistcoat, peak lapel, horn buttons and Bemberg silk lining.',
  },
  {
    id: 'prod_2',
    code: 'ZS-702',
    title: 'Sartorial Charcoal Tuxedo with Satin Peak Lapel',
    category: 'Tuxedo',
    fabric: 'Fine Worsted Wool & Grosgrain Satin',
    color: 'Midnight Charcoal Black',
    pricePKR: 98000,
    costPKR: 48000,
    stockQty: 5,
    minStockAlert: 2,
    sizesAvailable: ['38R', '40R', '42R', 'Bespoke Custom'],
    imageUrl: '/src/assets/images/suit_charcoal_tuxedo_1792162980954.jpg',
    description: 'Black-tie luxury tuxedo. Satin facings on lapel and jetted pockets, single silk covered button, satin side stripe trouser.',
  },
];

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Tariq Mehmood Bajwa',
    phone: '+92 300 8472910',
    email: 'tariq.bajwa@textilegroup.pk',
    city: 'Lahore',
    address: 'House 42, Block L, Gulberg III, Lahore',
    measurements: {
      chest: 42.5,
      waist: 36.0,
      hip: 41.0,
      shoulder: 18.5,
      sleeve: 25.5,
      jacketLength: 30.0,
      collar: 16.5,
      bicep: 14.5,
      wrist: 6.75,
      trouserWaist: 36.0,
      trouserLength: 41.5,
      inseam: 31.0,
      thigh: 24.5,
      bottomHem: 8.25,
      lapelStyle: 'Peak Lapel',
      ventStyle: 'Double Vent',
    },
    notes: 'Regular bespoke client for 3-piece business suits.',
    totalOrdersCount: 1,
    totalSpentPKR: 88000,
    remainingBalancePKR: 38000,
    createdAt: '2026-10-10T10:30:00Z',
  },
];

export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'inv_1001',
    invoiceNumber: 'INV-2026-1001',
    orderNumber: 'ZS-2026-1042',
    customerId: 'cust_1',
    customerName: 'Tariq Mehmood Bajwa',
    customerPhone: '+92 300 8472910',
    customerAddress: 'House 42, Block L, Gulberg III, Lahore',
    customerCity: 'Lahore',
    date: '2026-10-10',
    dueDate: '2026-10-25',
    saleType: 'custom_stitching',
    items: [
      {
        productId: 'prod_1',
        productCode: 'ZS-701',
        title: 'Super 150s Royal Navy 3-Piece Bespoke Suit',
        type: 'custom_stitching',
        fabric: 'Super 150s Merino Wool (Dormeuil England)',
        color: 'Royal Navy Blue',
        sizeOrTailoring: 'Bespoke Custom (Chest 42.5)',
        quantity: 1,
        unitPricePKR: 85000,
        costPKR: 42000,
        totalPricePKR: 85000,
      },
    ],
    subtotalPKR: 85000,
    tailoringFeePKR: 5000,
    discountPKR: 2000,
    taxPKR: 0,
    grandTotalPKR: 88000,
    paidAmountPKR: 50000,
    balanceDuePKR: 38000,
    paymentStatus: 'Partial',
    paymentMethod: 'Bank Transfer / Raast',
    notes: 'Advance deposit received via Raast.',
    printHistory: [],
    createdAt: '2026-10-10T11:20:00Z',
    updatedAt: '2026-10-10T11:45:00Z',
  },
];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'ZS-2026-1042',
    invoiceNumber: 'INV-2026-1001',
    customerId: 'cust_1',
    customerName: 'Tariq Mehmood Bajwa',
    customerPhone: '+92 300 8472910',
    customerCity: 'Lahore',
    customerAddress: 'House 42, Block L, Gulberg III, Lahore',
    items: [
      {
        productId: 'prod_1',
        productCode: 'ZS-701',
        title: 'Super 150s Royal Navy 3-Piece Bespoke Suit',
        fabric: 'Super 150s Merino Wool (Dormeuil England)',
        color: 'Royal Navy Blue',
        sizeOrTailoring: 'Bespoke Custom (Chest 42.5)',
        quantity: 1,
        unitPricePKR: 85000,
        costPKR: 42000,
        totalPricePKR: 85000,
      },
    ],
    subtotalPKR: 85000,
    tailoringFeePKR: 5000,
    discountPKR: 2000,
    shippingFeePKR: 0,
    grandTotalPKR: 88000,
    advancePaidPKR: 50000,
    balanceDuePKR: 38000,
    paymentStatus: 'Partial',
    paymentMethod: 'Bank Transfer / Raast',
    status: 'In Tailoring',
    isRushOrder: false,
    deliveryDate: '2026-10-25',
    createdAt: '2026-10-10T11:20:00Z',
    updatedAt: '2026-10-14T15:40:00Z',
  },
];

export const SAMPLE_PAYMENTS: PaymentEntry[] = [
  {
    id: 'pay_1',
    receiptNumber: 'RCP-2026-1001',
    invoiceNumber: 'INV-2026-1001',
    orderNumber: 'ZS-2026-1042',
    customerId: 'cust_1',
    customerName: 'Tariq Mehmood Bajwa',
    amountPKR: 50000,
    type: 'Advance Deposit',
    method: 'Raast / Online Bank',
    referenceNumber: 'RAAST-991204882',
    date: '2026-10-10 11:45',
    notes: 'Advance deposit received upon placing order',
    recordedBy: 'Administrator',
  },
];

export const SAMPLE_EXPENSES: ExpenseEntry[] = [
  {
    id: 'exp_1',
    category: 'Tailor Master & Artisan Wages',
    description: 'Artisan master cutting & stitching wages',
    amountPKR: 45000,
    date: '2026-10-10',
    paymentMethod: 'Cash',
    vendorName: 'Master Aslam',
    receiptNumber: 'WAGE-01',
    isDirectCost: true,
    recordedBy: 'Administrator',
  },
];

export const INITIAL_WHATSAPP_CONFIG: WhatsAppCloudApiConfig = {
  mode: 'DEMO',
  phoneNumberId: '',
  businessAccountId: '',
  permanentAccessToken: '',
  webhookVerifyToken: '',
  isConnected: false,
};

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/(\+?\d{2,4}\s?\d{3})\s?(\d{4,7})/, '$1-XXXXXXX');
}

export function maskAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',');
  if (parts.length > 1) {
    const city = parts[parts.length - 1]?.trim() || '';
    return `[Restricted House No.], ${city}`;
  }
  return '[Restricted Client Address]';
}

class DemoDatabaseService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to save to localStorage key ${key}:`, err);
    }
  }

  // --- USER AUTHENTICATION & SESSIONS ---
  getCurrentUser(): UserAccount {
    return this.getItem<UserAccount>(STORAGE_KEYS.CURRENT_USER, ADMIN_USER);
  }

  setCurrentUser(user: UserAccount): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'AUTH_SWITCH_USER',
      details: `Switched active session to ${user.name} (${user.role})`,
      entityType: 'AUTH',
    });
  }

  getUsers(): UserAccount[] {
    return this.getItem<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  authenticateUser(identifier: string, passwordInput: string): { success: boolean; user?: UserAccount; error?: string } {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPw = (passwordInput || '').trim();
    if (!cleanId) return { success: false, error: 'Please enter your username or email address.' };
    if (!cleanPw) return { success: false, error: 'Password is required to log in.' };

    const users = this.getUsers();
    const user = users.find((u) => u.username?.toLowerCase() === cleanId || u.email?.toLowerCase() === cleanId);
    if (!user) return { success: false, error: 'Account not found. Please verify your login ID.' };

    if (user.password !== cleanPw) {
      return { success: false, error: 'Incorrect password. Access denied.' };
    }

    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.setSessionAuthenticated(true, user);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'AUTH_LOGIN_SUCCESS',
      details: `User @${user.username} (${user.name}) logged in.`,
      entityType: 'AUTH',
    });
    return { success: true, user };
  }

  isSessionAuthenticated(): boolean {
    try {
      const auth = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      return auth === 'true';
    } catch {
      return false;
    }
  }

  setSessionAuthenticated(authenticated: boolean, user?: UserAccount): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, authenticated ? 'true' : 'false');
      if (authenticated && user) {
        this.setItem(STORAGE_KEYS.CURRENT_USER, user);
      }
    } catch (err) {
      console.error('Failed to update session auth flag:', err);
    }
  }

  logoutUser(user?: UserAccount): void {
    const active = user || this.getCurrentUser();
    this.setSessionAuthenticated(false);
    this.addAuditLog({
      userName: active?.name || 'Active Session',
      userRole: active?.role || 'EMPLOYEE',
      action: 'AUTH_LOGOUT',
      details: `User @${active?.username || 'user'} logged out. App locked.`,
      entityType: 'AUTH',
    });
  }

  createSalesUser(
    userData: {
      name: string;
      username: string;
      email: string;
      password: string;
      title: string;
      permissions: UserAccount['permissions'];
    },
    adminUser: UserAccount
  ): UserAccount {
    if (adminUser.role !== 'ADMIN') throw new Error('Access Denied: Only Admin can create staff accounts.');
    const cleanUsername = userData.username.trim().toLowerCase();
    const users = this.getUsers();
    if (users.some((u) => u.username?.toLowerCase() === cleanUsername)) {
      throw new Error(`Username "${userData.username}" is already in use.`);
    }

    const newUser: UserAccount = {
      id: `usr_sales_${Date.now()}`,
      name: userData.name.trim(),
      username: cleanUsername,
      email: userData.email.trim().toLowerCase() || `${cleanUsername}@atelier.com`,
      password: userData.password.trim(),
      role: 'EMPLOYEE',
      title: userData.title.trim() || 'Showroom Sales Associate',
      createdAt: new Date().toISOString().slice(0, 10),
      permissions: {
        ...userData.permissions,
        canManageSettings: false,
        canDeleteRecords: false,
        canExportData: false,
      },
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog({
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'SALESPERSON_ACCOUNT_CREATED',
      details: `Created sales login for ${newUser.name} (@${newUser.username})`,
      entityType: 'AUTH',
    });
    return newUser;
  }

  updateSalesUser(id: string, updates: Partial<UserAccount>, adminUser: UserAccount): UserAccount | null {
    if (adminUser.role !== 'ADMIN') throw new Error('Access Denied.');
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      permissions: {
        ...users[index].permissions,
        ...(updates.permissions || {}),
      },
    };
    this.setItem(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  deleteSalesUser(id: string, adminUser: UserAccount): boolean {
    if (adminUser.role !== 'ADMIN') throw new Error('Access Denied.');
    if (id === ADMIN_USER.id) throw new Error('Cannot delete primary admin.');
    const users = this.getUsers().filter((u) => u.id !== id);
    this.setItem(STORAGE_KEYS.USERS, users);
    return true;
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  addProduct(productData: Omit<Product, 'id'>, user: UserAccount): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
    };
    products.unshift(newProduct);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'PRODUCT_CREATED',
      details: `Added new product ${newProduct.code} - ${newProduct.title} (Stock: ${newProduct.stockQty})`,
      entityType: 'PRODUCT',
    });
    return newProduct;
  }

  updateProduct(productId: string, updates: Partial<Product>, user: UserAccount): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'PRODUCT_UPDATED',
      details: `Updated product ${products[index].code} (${products[index].title})`,
      entityType: 'PRODUCT',
    });
    return products[index];
  }

  updateStock(productId: string, delta: number, reason: string, user: UserAccount): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return null;
    const oldQty = products[index].stockQty;
    const newQty = Math.max(0, oldQty + delta);
    products[index].stockQty = newQty;
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'STOCK_ADJUSTMENT',
      details: `Stock adjustment for ${products[index].code}: ${delta > 0 ? '+' : ''}${delta} (${oldQty} -> ${newQty}). Reason: ${reason}`,
      entityType: 'PRODUCT',
    });
    return products[index];
  }

  deleteProduct(productId: string, user: UserAccount): boolean {
    if (user.role !== 'ADMIN') throw new Error('Access Denied: Only Admins can delete products.');
    const products = this.getProducts().filter((p) => p.id !== productId);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    return true;
  }

  // --- INVOICES & AUTOMATIC RECORDING ---
  getInvoices(userRole?: UserRole): Invoice[] {
    const invoices = this.getItem<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    if (userRole === 'EMPLOYEE') {
      return invoices.map((inv) => ({
        ...inv,
        customerPhone: maskPhoneNumber(inv.customerPhone),
        customerAddress: maskAddress(inv.customerAddress),
      }));
    }
    return invoices;
  }

  getInvoiceById(id: string): Invoice | null {
    const invoices = this.getInvoices('ADMIN');
    return invoices.find((i) => i.id === id) || null;
  }

  getInvoiceByNumber(invoiceNumber: string): Invoice | null {
    const invoices = this.getInvoices('ADMIN');
    return invoices.find((i) => i.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase()) || null;
  }

  createInvoice(
    invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'printHistory'>,
    user: UserAccount
  ): Invoice {
    const invoices = this.getItem<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const invoiceNumber = `INV-2026-${1000 + invoices.length + 1}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      invoiceNumber,
      printHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    this.setItem(STORAGE_KEYS.INVOICES, invoices);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'INVOICE_GENERATED',
      details: `Generated Invoice #${invoiceNumber} for ${newInvoice.customerName}. Grand Total: PKR ${newInvoice.grandTotalPKR.toLocaleString()}`,
      entityType: 'INVOICE',
    });

    return newInvoice;
  }

  updateInvoice(id: string, updates: Partial<Invoice>, user: UserAccount): Invoice | null {
    const invoices = this.getItem<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const index = invoices.findIndex((i) => i.id === id);
    if (index === -1) return null;

    invoices[index] = {
      ...invoices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.INVOICES, invoices);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'INVOICE_UPDATED',
      details: `Updated Invoice #${invoices[index].invoiceNumber} details.`,
      entityType: 'INVOICE',
    });

    return invoices[index];
  }

  recordInvoicePayment(
    invoiceNumber: string,
    amountPKR: number,
    paymentMethod: string,
    referenceNumber: string,
    notes: string,
    user: UserAccount
  ): { invoice: Invoice; payment: PaymentEntry } {
    const invoices = this.getItem<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const iIdx = invoices.findIndex((i) => i.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase());
    if (iIdx === -1) {
      throw new Error(`Invoice #${invoiceNumber} not found.`);
    }

    const inv = invoices[iIdx];
    const prevBalance = inv.balanceDuePKR;
    const paymentAmount = Math.min(amountPKR, prevBalance);
    const newPaid = inv.paidAmountPKR + paymentAmount;
    const newBalance = Math.max(0, inv.grandTotalPKR - newPaid);

    inv.paidAmountPKR = newPaid;
    inv.balanceDuePKR = newBalance;
    inv.paymentStatus = newBalance === 0 ? 'Paid' : 'Partial';
    inv.updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.INVOICES, invoices);

    // Also update linked order if exists
    if (inv.orderNumber) {
      const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      const oIdx = orders.findIndex((o) => o.orderNumber === inv.orderNumber);
      if (oIdx !== -1) {
        orders[oIdx].advancePaidPKR = newPaid;
        orders[oIdx].balanceDuePKR = newBalance;
        orders[oIdx].paymentStatus = inv.paymentStatus;
        this.setItem(STORAGE_KEYS.ORDERS, orders);
      }
    }

    // Record Payment Entry
    const payments = this.getPayments();
    const receiptNumber = `RCP-2026-${1000 + payments.length + 1}`;
    const newPayment: PaymentEntry = {
      id: `pay_${Date.now()}`,
      receiptNumber,
      invoiceNumber: inv.invoiceNumber,
      orderNumber: inv.orderNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amountPKR: paymentAmount,
      type: newBalance === 0 ? 'Full Settlement' : 'Installment Payment',
      method: paymentMethod,
      referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      notes: notes || `Payment against invoice ${inv.invoiceNumber}`,
      recordedBy: user.name,
      previousBalancePKR: prevBalance,
      newBalancePKR: newBalance,
    };
    payments.unshift(newPayment);
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);

    // Update customer remaining balance
    this.recalculateCustomerBalance(inv.customerId);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'PAYMENT_RECORDED',
      details: `Recorded PKR ${paymentAmount.toLocaleString()} payment for Invoice #${inv.invoiceNumber}. Remaining: PKR ${newBalance.toLocaleString()}`,
      entityType: 'PAYMENT',
    });

    return { invoice: inv, payment: newPayment };
  }

  recordInvoicePrint(invoiceId: string, format: 'A4' | '80mm', user: UserAccount): Invoice | null {
    const invoices = this.getItem<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const index = invoices.findIndex((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (index === -1) return null;

    const printRecord = {
      id: `prt_${Date.now()}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      printedBy: user.name,
      format,
    };

    if (!invoices[index].printHistory) {
      invoices[index].printHistory = [];
    }
    invoices[index].printHistory.push(printRecord);
    this.setItem(STORAGE_KEYS.INVOICES, invoices);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'INVOICE_PRINTED',
      details: `Printed Invoice #${invoices[index].invoiceNumber} in ${format} format. Reprint does not duplicate sales.`,
      entityType: 'INVOICE',
    });

    return invoices[index];
  }

  // --- SALES TRANSACTION DISPATCHER (UNIFIED SALES & ORDERS) ---
  createSale(
    saleData: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      customerCity: string;
      saleType: SaleType;
      items: OrderItem[];
      subtotalPKR: number;
      tailoringFeePKR: number;
      discountPKR: number;
      taxPKR: number;
      grandTotalPKR: number;
      paidAmountPKR: number;
      balanceDuePKR: number;
      paymentMethod: string;
      deliveryDate?: string;
      eventDate?: string;
      isRushOrder?: boolean;
      measurements?: BespokeMeasurements;
      notes?: string;
    },
    user: UserAccount
  ): { invoice: Invoice; order?: Order; payment?: PaymentEntry } {
    const timestamp = Date.now();
    const invoiceNumber = `INV-2026-${1000 + this.getInvoices('ADMIN').length + 1}`;
    let createdOrder: Order | undefined;

    // If it involves custom stitching or bespoke orders, create an Order record
    if (saleData.saleType === 'custom_stitching' || saleData.saleType === 'alteration' || saleData.tailoringFeePKR > 0) {
      const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      const orderNumber = `ZS-2026-${1040 + orders.length + 1}`;
      createdOrder = {
        id: `ord_${timestamp}`,
        orderNumber,
        invoiceNumber,
        customerId: saleData.customerId,
        customerName: saleData.customerName,
        customerPhone: saleData.customerPhone,
        customerCity: saleData.customerCity,
        customerAddress: saleData.customerAddress,
        items: saleData.items,
        subtotalPKR: saleData.subtotalPKR,
        tailoringFeePKR: saleData.tailoringFeePKR,
        discountPKR: saleData.discountPKR,
        shippingFeePKR: 0,
        grandTotalPKR: saleData.grandTotalPKR,
        advancePaidPKR: saleData.paidAmountPKR,
        balanceDuePKR: saleData.balanceDuePKR,
        paymentStatus: saleData.balanceDuePKR === 0 ? 'Paid' : (saleData.paidAmountPKR > 0 ? 'Partial' : 'Unpaid'),
        paymentMethod: saleData.paymentMethod,
        status: 'In Tailoring',
        isRushOrder: Boolean(saleData.isRushOrder),
        deliveryDate: saleData.deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        eventDate: saleData.eventDate,
        measurementsSnapshot: saleData.measurements,
        specialInstructions: saleData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      orders.unshift(createdOrder);
      this.setItem(STORAGE_KEYS.ORDERS, orders);
    }

    // Decrement stock for ready-made suits or fabrics sold
    const products = this.getProducts();
    for (const item of saleData.items) {
      if (item.productId) {
        const pIdx = products.findIndex((p) => p.id === item.productId);
        if (pIdx !== -1) {
          products[pIdx].stockQty = Math.max(0, products[pIdx].stockQty - (item.quantity || 1));
        }
      }
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Create Invoice
    const invoices = this.getItem<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const newInvoice: Invoice = {
      id: `inv_${timestamp}`,
      invoiceNumber,
      orderId: createdOrder?.id,
      orderNumber: createdOrder?.orderNumber,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      customerAddress: saleData.customerAddress,
      customerCity: saleData.customerCity,
      date: new Date().toISOString().slice(0, 10),
      dueDate: saleData.deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      saleType: saleData.saleType,
      items: saleData.items,
      subtotalPKR: saleData.subtotalPKR,
      tailoringFeePKR: saleData.tailoringFeePKR,
      discountPKR: saleData.discountPKR,
      taxPKR: saleData.taxPKR,
      grandTotalPKR: saleData.grandTotalPKR,
      paidAmountPKR: saleData.paidAmountPKR,
      balanceDuePKR: saleData.balanceDuePKR,
      paymentStatus: saleData.balanceDuePKR === 0 ? 'Paid' : (saleData.paidAmountPKR > 0 ? 'Partial' : 'Unpaid'),
      paymentMethod: saleData.paymentMethod,
      notes: saleData.notes,
      printHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    this.setItem(STORAGE_KEYS.INVOICES, invoices);

    // If initial payment received, record PaymentEntry
    let createdPayment: PaymentEntry | undefined;
    if (saleData.paidAmountPKR > 0) {
      const payments = this.getPayments();
      const receiptNumber = `RCP-2026-${1000 + payments.length + 1}`;
      createdPayment = {
        id: `pay_${timestamp}`,
        receiptNumber,
        invoiceNumber,
        orderNumber: createdOrder?.orderNumber,
        customerId: saleData.customerId,
        customerName: saleData.customerName,
        amountPKR: saleData.paidAmountPKR,
        type: saleData.balanceDuePKR === 0 ? 'Full Payment' : 'Advance Deposit',
        method: saleData.paymentMethod,
        referenceNumber: `INIT-${timestamp.toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        notes: `Initial payment at sale for ${invoiceNumber}`,
        recordedBy: user.name,
        previousBalancePKR: saleData.grandTotalPKR,
        newBalancePKR: saleData.balanceDuePKR,
      };
      payments.unshift(createdPayment);
      this.setItem(STORAGE_KEYS.PAYMENTS, payments);
    }

    // Update customer spend & remaining balance
    this.updateCustomerSpend(saleData.customerId, saleData.grandTotalPKR);
    this.recalculateCustomerBalance(saleData.customerId);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'SALE_RECORDED',
      details: `Recorded ${saleData.saleType.toUpperCase()} sale #${invoiceNumber} for ${saleData.customerName}. Value: PKR ${saleData.grandTotalPKR.toLocaleString()}`,
      entityType: 'INVOICE',
    });

    return { invoice: newInvoice, order: createdOrder, payment: createdPayment };
  }

  // --- ORDERS ---
  getOrders(userRole: UserRole): Order[] {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    if (userRole === 'EMPLOYEE') {
      return orders.map((ord) => ({
        ...ord,
        customerPhone: maskPhoneNumber(ord.customerPhone),
        customerAddress: maskAddress(ord.customerAddress),
      }));
    }
    return orders;
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>, user: UserAccount): Order {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const timestamp = Date.now();
    const orderNumber = `ZS-2026-${1040 + orders.length + 1}`;
    const invoiceNumber = `INV-2026-${1000 + this.getInvoices('ADMIN').length + 1}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord_${timestamp}`,
      orderNumber,
      invoiceNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    this.setItem(STORAGE_KEYS.ORDERS, orders);

    // Auto-generate linked Invoice
    const invoices = this.getItem<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const newInvoice: Invoice = {
      id: `inv_${timestamp}`,
      invoiceNumber,
      orderId: newOrder.id,
      orderNumber,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerAddress: newOrder.customerAddress,
      customerCity: newOrder.customerCity,
      date: new Date().toISOString().slice(0, 10),
      dueDate: newOrder.deliveryDate,
      saleType: 'custom_stitching',
      items: newOrder.items,
      subtotalPKR: newOrder.subtotalPKR,
      tailoringFeePKR: newOrder.tailoringFeePKR,
      discountPKR: newOrder.discountPKR,
      taxPKR: 0,
      grandTotalPKR: newOrder.grandTotalPKR,
      paidAmountPKR: newOrder.advancePaidPKR,
      balanceDuePKR: newOrder.balanceDuePKR,
      paymentStatus: newOrder.paymentStatus,
      paymentMethod: newOrder.paymentMethod,
      notes: newOrder.specialInstructions,
      printHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    this.setItem(STORAGE_KEYS.INVOICES, invoices);

    // Record initial payment if advance > 0
    if (newOrder.advancePaidPKR > 0) {
      const payments = this.getPayments();
      const receiptNumber = `RCP-2026-${1000 + payments.length + 1}`;
      const newPayment: PaymentEntry = {
        id: `pay_${timestamp}`,
        receiptNumber,
        invoiceNumber,
        orderNumber,
        customerId: newOrder.customerId,
        customerName: newOrder.customerName,
        amountPKR: newOrder.advancePaidPKR,
        type: newOrder.advancePaidPKR >= newOrder.grandTotalPKR ? 'Full Payment' : 'Advance Deposit',
        method: newOrder.paymentMethod,
        referenceNumber: `INIT-${timestamp.toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        notes: `Advance payment for bespoke order ${orderNumber}`,
        recordedBy: user.name,
        previousBalancePKR: newOrder.grandTotalPKR,
        newBalancePKR: newOrder.balanceDuePKR,
      };
      payments.unshift(newPayment);
      this.setItem(STORAGE_KEYS.PAYMENTS, payments);
    }

    this.updateCustomerSpend(newOrder.customerId, newOrder.grandTotalPKR);
    this.recalculateCustomerBalance(newOrder.customerId);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'ORDER_CREATED',
      details: `Created bespoke order #${orderNumber} (Invoice #${invoiceNumber}) for ${newOrder.customerName}. Value: PKR ${newOrder.grandTotalPKR.toLocaleString()}`,
      entityType: 'ORDER',
    });

    return newOrder;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, user: UserAccount): Order | null {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;
    const oldStatus = orders[index].status;
    orders[index].status = newStatus;
    orders[index].updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.ORDERS, orders);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'ORDER_STATUS_UPDATE',
      details: `Order #${orders[index].orderNumber} status changed from "${oldStatus}" to "${newStatus}"`,
      entityType: 'ORDER',
    });
    return orders[index];
  }

  cancelOrder(orderId: string, restockInventory: boolean, reason: string, user: UserAccount): Order | null {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;
    const targetOrder = orders[index];
    targetOrder.status = 'Cancelled';
    targetOrder.updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.ORDERS, orders);

    if (restockInventory) {
      const products = this.getProducts();
      for (const item of targetOrder.items) {
        if (item.productId) {
          const pIdx = products.findIndex((p) => p.id === item.productId);
          if (pIdx !== -1) {
            products[pIdx].stockQty += item.quantity || 1;
          }
        }
      }
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
    }

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'ORDER_CANCELLED',
      details: `Cancelled Order #${targetOrder.orderNumber}. Reason: ${reason}`,
      entityType: 'ORDER',
    });
    return targetOrder;
  }

  // --- CUSTOMERS & FAMILY ACCOUNTS ---
  getCustomers(userRole: UserRole): Customer[] {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    if (userRole === 'EMPLOYEE') {
      return customers.map((c) => ({
        ...c,
        phone: maskPhoneNumber(c.phone),
        address: maskAddress(c.address),
        familyMembers: c.familyMembers?.map((fm) => ({
          ...fm,
          phone: fm.phone ? maskPhoneNumber(fm.phone) : undefined,
        })),
      }));
    }
    return customers;
  }

  addCustomer(customerData: Omit<Customer, 'id' | 'totalOrdersCount' | 'totalSpentPKR' | 'remainingBalancePKR' | 'createdAt'>, user: UserAccount): Customer {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const newCustId = `cust_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newCustomer: Customer = {
      ...customerData,
      id: newCustId,
      totalOrdersCount: 0,
      totalSpentPKR: 0,
      remainingBalancePKR: 0,
      createdAt: nowIso,
    };
    customers.unshift(newCustomer);
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'CUSTOMER_CREATED',
      details: `Registered client profile: ${newCustomer.name} (${newCustomer.city})`,
      entityType: 'CUSTOMER',
    });
    return newCustomer;
  }

  updateCustomer(customerId: string, updates: Partial<Customer>, user: UserAccount): Customer | null {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = customers.findIndex((c) => c.id === customerId);
    if (index === -1) return null;

    customers[index] = { ...customers[index], ...updates };
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'CUSTOMER_UPDATED',
      details: `Updated client profile: ${customers[index].name}`,
      entityType: 'CUSTOMER',
    });
    return customers[index];
  }

  deleteCustomer(customerId: string, user: UserAccount): boolean {
    if (user.role !== 'ADMIN') throw new Error('Access Denied: Only Admins can delete client accounts.');
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const target = customers.find((c) => c.id === customerId);
    const filtered = customers.filter((c) => c.id !== customerId);
    this.setItem(STORAGE_KEYS.CUSTOMERS, filtered);
    if (target) {
      this.addAuditLog({
        userName: user.name,
        userRole: user.role,
        action: 'CUSTOMER_DELETED',
        details: `Deleted customer profile: ${target.name}`,
        entityType: 'CUSTOMER',
      });
    }
    return true;
  }

  updateCustomerMeasurements(customerId: string, measurements: Customer['measurements'], user: UserAccount): boolean {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = customers.findIndex((c) => c.id === customerId);
    if (index === -1) return false;
    customers[index].measurements = measurements;
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'MEASUREMENTS_UPDATED',
      details: `Updated measurement card for ${customers[index].name}`,
      entityType: 'CUSTOMER',
    });
    return true;
  }

  private updateCustomerSpend(customerId: string, amountPKR: number): void {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = customers.findIndex((c) => c.id === customerId);
    if (index !== -1) {
      customers[index].totalOrdersCount += 1;
      customers[index].totalSpentPKR += amountPKR;
      this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    }
  }

  recalculateCustomerBalance(customerId: string): number {
    const invoices = this.getInvoices('ADMIN').filter((i) => i.customerId === customerId);
    const totalRemaining = invoices.reduce((sum, i) => sum + i.balanceDuePKR, 0);

    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = customers.findIndex((c) => c.id === customerId);
    if (index !== -1) {
      customers[index].remainingBalancePKR = totalRemaining;
      this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    }
    return totalRemaining;
  }

  addFamilyMember(
    customerId: string,
    memberData: Omit<FamilyMember, 'id' | 'customerId' | 'createdAt' | 'updatedAt' | 'isArchived' | 'measurementHistory' | 'alterations'>,
    user: UserAccount
  ): FamilyMember {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const cIdx = customers.findIndex((c) => c.id === customerId);
    if (cIdx === -1) throw new Error('Customer not found.');

    const newMember: FamilyMember = {
      ...memberData,
      id: `fm_${Date.now()}`,
      customerId,
      isArchived: false,
      measurementHistory: [],
      alterations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!customers[cIdx].familyMembers) customers[cIdx].familyMembers = [];
    customers[cIdx].familyMembers.push(newMember);
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return newMember;
  }

  updateFamilyMember(customerId: string, memberId: string, updates: Partial<FamilyMember>, user: UserAccount): FamilyMember | null {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const cIdx = customers.findIndex((c) => c.id === customerId);
    if (cIdx === -1 || !customers[cIdx].familyMembers) return null;
    const mIdx = customers[cIdx].familyMembers.findIndex((m) => m.id === memberId);
    if (mIdx === -1) return null;

    customers[cIdx].familyMembers[mIdx] = {
      ...customers[cIdx].familyMembers[mIdx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return customers[cIdx].familyMembers[mIdx];
  }

  archiveFamilyMember(customerId: string, memberId: string, user: UserAccount): boolean {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const cIdx = customers.findIndex((c) => c.id === customerId);
    if (cIdx === -1 || !customers[cIdx].familyMembers) return false;
    const member = customers[cIdx].familyMembers.find((m) => m.id === memberId);
    if (!member) return false;
    member.isArchived = true;
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return true;
  }

  unarchiveFamilyMember(customerId: string, memberId: string, user: UserAccount): boolean {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const cIdx = customers.findIndex((c) => c.id === customerId);
    if (cIdx === -1 || !customers[cIdx].familyMembers) return false;
    const member = customers[cIdx].familyMembers.find((m) => m.id === memberId);
    if (!member) return false;
    member.isArchived = false;
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return true;
  }

  addMemberMeasurementRevision(customerId: string, memberId: string, revisionData: any, user: UserAccount): any {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const cIdx = customers.findIndex((c) => c.id === customerId);
    if (cIdx === -1 || !customers[cIdx].familyMembers) return null;
    const member = customers[cIdx].familyMembers.find((m) => m.id === memberId);
    if (!member) return null;

    const revision: MeasurementRevision = {
      id: `rev_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      measurements: { ...member.currentMeasurements },
      fitNotes: revisionData.fitNotes || 'Routine fitting session revision',
      recordedBy: user.name,
    };
    if (!member.measurementHistory) member.measurementHistory = [];
    member.measurementHistory.unshift(revision);
    member.currentMeasurements = { ...revisionData.measurements };
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return revision;
  }

  addMemberAlteration(customerId: string, memberId: string, alteration: any, user: UserAccount): any {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const cIdx = customers.findIndex((c) => c.id === customerId);
    if (cIdx === -1 || !customers[cIdx].familyMembers) return null;
    const member = customers[cIdx].familyMembers.find((m) => m.id === memberId);
    if (!member) return null;

    const newAlteration: AlterationRecord = {
      ...alteration,
      id: `alt_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    };
    if (!member.alterations) member.alterations = [];
    member.alterations.unshift(newAlteration);
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return newAlteration;
  }

  // --- PAYMENTS ---
  getPayments(): PaymentEntry[] {
    return this.getItem<PaymentEntry[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  }

  recordPayment(entryData: Omit<PaymentEntry, 'id'>, user: UserAccount): PaymentEntry {
    const payments = this.getPayments();
    const newPayment: PaymentEntry = {
      ...entryData,
      id: `pay_${Date.now()}`,
    };
    payments.unshift(newPayment);
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'PAYMENT_RECORDED',
      details: `Received PKR ${newPayment.amountPKR.toLocaleString()} via ${newPayment.method} from ${newPayment.customerName}`,
      entityType: 'PAYMENT',
    });
    return newPayment;
  }

  deletePayment(id: string, user: UserAccount): boolean {
    if (user.role !== 'ADMIN') throw new Error('Access Denied: Only Admins can delete payment entries.');
    const payments = this.getPayments().filter((p) => p.id !== id);
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);
    return true;
  }

  // --- EXPENSE CATEGORIES (CUSTOM & EDITABLE) ---
  getExpenseCategories(): ExpenseCategory[] {
    return this.getItem<ExpenseCategory[]>(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES);
  }

  addExpenseCategory(name: string, description: string, isDirectCost: boolean, user: UserAccount): ExpenseCategory {
    const categories = this.getExpenseCategories();
    const cleanName = name.trim();
    if (categories.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      throw new Error(`Expense category "${cleanName}" already exists.`);
    }

    const newCat: ExpenseCategory = {
      id: `exp_cat_${Date.now()}`,
      name: cleanName,
      description: description.trim(),
      isDirectCost,
      isDefault: false,
    };
    categories.push(newCat);
    this.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, categories);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'EXPENSE_CATEGORY_CREATED',
      details: `Created new custom expense category: "${newCat.name}" (Direct COGS: ${isDirectCost ? 'YES' : 'NO'})`,
      entityType: 'CATEGORY',
    });
    return newCat;
  }

  updateExpenseCategory(id: string, updates: Partial<ExpenseCategory>, user: UserAccount): ExpenseCategory | null {
    const categories = this.getExpenseCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...updates };
    this.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, categories);
    return categories[index];
  }

  deleteExpenseCategory(id: string, user: UserAccount): boolean {
    if (user.role !== 'ADMIN') throw new Error('Access Denied.');
    const categories = this.getExpenseCategories().filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, categories);
    return true;
  }

  // --- EXPENSES ---
  getExpenses(userRole: UserRole): ExpenseEntry[] {
    if (userRole === 'EMPLOYEE') {
      throw new Error('403 Forbidden: Staff accounts are not authorized to view operating expenses.');
    }
    return this.getItem<ExpenseEntry[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }

  recordExpense(expenseData: Omit<ExpenseEntry, 'id'>, user: UserAccount): ExpenseEntry {
    const expenses = this.getItem<ExpenseEntry[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const newExpense: ExpenseEntry = {
      ...expenseData,
      id: `exp_${Date.now()}`,
    };
    expenses.unshift(newExpense);
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);

    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'EXPENSE_RECORDED',
      details: `Logged expense of PKR ${newExpense.amountPKR.toLocaleString()} [${newExpense.category}]: ${newExpense.description}`,
      entityType: 'EXPENSE',
    });
    return newExpense;
  }

  deleteExpense(id: string, user: UserAccount): boolean {
    if (user.role !== 'ADMIN') throw new Error('Access Denied.');
    const expenses = this.getItem<ExpenseEntry[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES).filter((e) => e.id !== id);
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);
    return true;
  }

  // --- ADVANCED FINANCIAL REPORTS & DASHBOARD METRICS ---
  getComprehensiveFinancialReport(filter: FinancialFilter, userRole: UserRole) {
    if (userRole === 'EMPLOYEE') {
      return { authorized: false, error: 'Restricted from viewing financial profit margins.' };
    }

    const invoices = this.getInvoices('ADMIN');
    const payments = this.getPayments();
    const expenses = this.getItem<ExpenseEntry[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const orders = this.getOrders('ADMIN');
    const customers = this.getCustomers('ADMIN');
    const products = this.getProducts();

    // Date filtering function
    const isWithinFilter = (dateStr: string) => {
      if (!dateStr) return true;
      const d = dateStr.slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);

      if (filter.period === 'today') {
        return d === today;
      }
      if (filter.period === 'weekly') {
        const dObj = new Date(d);
        const now = new Date();
        const diffDays = (now.getTime() - dObj.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (filter.period === 'monthly') {
        const monthPrefix = filter.selectedMonth || new Date().toISOString().slice(0, 7);
        return d.startsWith(monthPrefix);
      }
      if (filter.period === 'yearly') {
        const yearPrefix = filter.selectedYear ? String(filter.selectedYear) : new Date().getFullYear().toString();
        return d.startsWith(yearPrefix);
      }
      if (filter.period === 'custom') {
        if (filter.startDate && d < filter.startDate) return false;
        if (filter.endDate && d > filter.endDate) return false;
        return true;
      }
      return true;
    };

    const filteredInvoices = invoices.filter((i) => isWithinFilter(i.date));
    const filteredPayments = payments.filter((p) => isWithinFilter(p.date));
    const filteredExpenses = expenses.filter((e) => isWithinFilter(e.date));
    const filteredOrders = orders.filter((o) => isWithinFilter(o.createdAt));

    // Financial Totals
    const totalSalesRevenue = filteredInvoices.reduce((sum, i) => sum + i.grandTotalPKR, 0);
    const totalCashCollected = filteredPayments.reduce((sum, p) => sum + p.amountPKR, 0);
    const totalOutstandingReceivables = filteredInvoices.reduce((sum, i) => sum + i.balanceDuePKR, 0);

    // Direct Cost of Goods Sold (COGS)
    let totalCOGS = 0;
    for (const inv of filteredInvoices) {
      for (const item of inv.items) {
        if (item.costPKR) {
          totalCOGS += item.costPKR * (item.quantity || 1);
        } else {
          totalCOGS += (item.unitPricePKR || 0) * (item.quantity || 1) * 0.45;
        }
      }
    }
    const directExpenses = filteredExpenses.filter((e) => e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
    const operatingExpenses = filteredExpenses.filter((e) => !e.isDirectCost).reduce((sum, e) => sum + e.amountPKR, 0);
    const totalBusinessExpenses = directExpenses + operatingExpenses;

    const grossProfit = totalSalesRevenue - totalCOGS;
    const grossProfitMargin = totalSalesRevenue > 0 ? Number(((grossProfit / totalSalesRevenue) * 100).toFixed(1)) : 0;
    const netProfit = grossProfit - operatingExpenses;
    const netProfitMargin = totalSalesRevenue > 0 ? Number(((netProfit / totalSalesRevenue) * 100).toFixed(1)) : 0;

    // Tailoring Workload counts
    const totalSuitsSold = filteredInvoices.reduce((count, inv) => {
      return count + inv.items.filter((it) => it.type === 'ready_made' || it.title.toLowerCase().includes('suit')).reduce((c, it) => c + it.quantity, 0);
    }, 0);

    const completedStitchingOrders = filteredOrders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;
    const pendingStitchingOrders = filteredOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Completed' && o.status !== 'Cancelled').length;

    // Today's numbers
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = invoices.filter((i) => i.date === todayStr).reduce((sum, i) => sum + i.grandTotalPKR, 0);
    const todayPayments = payments.filter((p) => p.date?.slice(0, 10) === todayStr).reduce((sum, p) => sum + p.amountPKR, 0);
    const todayExpenses = expenses.filter((e) => e.date === todayStr).reduce((sum, e) => sum + e.amountPKR, 0);

    // Sales by Category
    const salesByCategory: Record<string, number> = {
      'Three-Piece Suit': 0,
      'Two-Piece Italian Suit': 0,
      'Tuxedo': 0,
      'Prince Coat': 0,
      'Sherwani': 0,
      'Waistcoat': 0,
      'Premium Suiting Fabric': 0,
      'Stitching & Alteration': 0,
    };

    filteredInvoices.forEach((inv) => {
      inv.items.forEach((it) => {
        let cat = 'Three-Piece Suit';
        if (it.title.toLowerCase().includes('tuxedo')) cat = 'Tuxedo';
        else if (it.title.toLowerCase().includes('prince')) cat = 'Prince Coat';
        else if (it.title.toLowerCase().includes('sherwani')) cat = 'Sherwani';
        else if (it.title.toLowerCase().includes('waistcoat')) cat = 'Waistcoat';
        else if (it.title.toLowerCase().includes('fabric')) cat = 'Premium Suiting Fabric';
        else if (it.type === 'custom_stitching' || it.type === 'alteration') cat = 'Stitching & Alteration';
        else if (it.title.toLowerCase().includes('2-piece') || it.title.toLowerCase().includes('tweed')) cat = 'Two-Piece Italian Suit';

        salesByCategory[cat] = (salesByCategory[cat] || 0) + it.totalPricePKR;
      });
    });

    // Expenses by Category
    const expensesByCategory: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amountPKR;
    });

    return {
      authorized: true,
      totalSalesRevenue,
      totalCashCollected,
      totalOutstandingReceivables,
      totalCOGS,
      directExpenses,
      operatingExpenses,
      totalBusinessExpenses,
      grossProfit,
      grossProfitMargin,
      netProfit,
      netProfitMargin,
      totalSuitsSold,
      completedStitchingOrders,
      pendingStitchingOrders,
      todaySales,
      todayPayments,
      todayExpenses,
      salesByCategory,
      expensesByCategory,
      invoicesCount: filteredInvoices.length,
      ordersCount: filteredOrders.length,
      paymentsCount: filteredPayments.length,
      expensesCount: filteredExpenses.length,
    };
  }

  // --- SETTINGS & ATELIER PROFILE ---
  getPrinterConfig(): ThermalPrinterConfig {
    return this.getItem<ThermalPrinterConfig>(STORAGE_KEYS.PRINTER_CONFIG, INITIAL_PRINTER_CONFIG);
  }

  updatePrinterConfig(config: ThermalPrinterConfig, user: UserAccount): void {
    if (user.role !== 'ADMIN') throw new Error('Access Denied: Only Admins can modify settings.');
    this.setItem(STORAGE_KEYS.PRINTER_CONFIG, config);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'SETTINGS_CONFIG_UPDATED',
      details: `Updated Atelier Settings: Shop=${config.businessName}, Website=${config.websiteUrl || '(none)'}`,
      entityType: 'SETTINGS',
    });
  }

  // --- CATEGORIES & CITIES ---
  getCategories(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  addCategory(name: string, user: UserAccount): string[] {
    const cats = this.getCategories();
    const clean = name.trim();
    if (clean && !cats.includes(clean)) {
      cats.push(clean);
      this.setItem(STORAGE_KEYS.CATEGORIES, cats);
    }
    return cats;
  }

  renameCategory(oldName: string, newName: string, user: UserAccount): string[] {
    const cats = this.getCategories();
    const idx = cats.indexOf(oldName);
    if (idx !== -1 && newName.trim()) {
      cats[idx] = newName.trim();
      this.setItem(STORAGE_KEYS.CATEGORIES, cats);
    }
    return cats;
  }

  deleteCategory(name: string, user: UserAccount): string[] {
    if (user.role !== 'ADMIN') throw new Error('Access Denied.');
    const cats = this.getCategories().filter((c) => c !== name);
    this.setItem(STORAGE_KEYS.CATEGORIES, cats);
    return cats;
  }

  getCities(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.CITIES, DEFAULT_CITIES);
  }

  addCity(city: string, user?: UserAccount): string[] {
    const cities = this.getCities();
    const clean = city.trim();
    if (clean && !cities.includes(clean)) {
      cities.push(clean);
      this.setItem(STORAGE_KEYS.CITIES, cities);
    }
    return cities;
  }

  getTheme(): 'dark' | 'light' {
    return this.getItem<'dark' | 'light'>(STORAGE_KEYS.THEME, 'dark');
  }

  setTheme(theme: 'dark' | 'light'): void {
    this.setItem(STORAGE_KEYS.THEME, theme);
  }

  // --- NOTIFICATIONS & AUDIT ---
  getNotifications(): SystemNotification[] {
    return this.getItem<SystemNotification[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_welcome',
        title: 'Atelier ERP Online',
        message: 'Tailoring Shop Management, Sales, Expense & Accounting System initialized and ready.',
        timestamp: 'Just now',
        type: 'ai',
        read: false,
        linkTab: 'dashboard',
      },
    ]);
  }

  markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog: AuditLog = {
      ...entry,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    logs.unshift(newLog);
    if (logs.length > 300) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  clearAuditLogs(user: UserAccount): void {
    if (user.role !== 'ADMIN') throw new Error('Access Denied: Only Admins can clear audit logs.');
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // --- WHATSAPP CLOUD API ---
  getWhatsAppConversations(userRole: UserRole): WhatsAppConversation[] {
    const convs = this.getItem<WhatsAppConversation[]>(STORAGE_KEYS.WHATSAPP, []);
    if (userRole === 'EMPLOYEE') {
      return convs.map((c) => ({
        ...c,
        customerPhone: maskPhoneNumber(c.customerPhone),
      }));
    }
    return convs;
  }

  sendWhatsAppMessage(conversationId: string, text: string, templateName?: string, user?: UserAccount): WhatsAppConversation | null {
    const convs = this.getItem<WhatsAppConversation[]>(STORAGE_KEYS.WHATSAPP, []);
    const index = convs.findIndex((c) => c.id === conversationId);
    if (index === -1) return null;

    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      sender: 'business' as const,
      text,
      timestamp: new Date().toISOString().slice(11, 16),
      status: 'delivered' as const,
      templateName,
    };
    convs[index].messages.push(newMessage);
    convs[index].lastMessage = text;
    convs[index].lastTimestamp = 'Just now';
    this.setItem(STORAGE_KEYS.WHATSAPP, convs);
    return convs[index];
  }

  simulateCustomerReply(conversationId: string, replyText: string): WhatsAppConversation | null {
    const convs = this.getItem<WhatsAppConversation[]>(STORAGE_KEYS.WHATSAPP, []);
    const index = convs.findIndex((c) => c.id === conversationId);
    if (index === -1) return null;

    const reply = {
      id: `msg_cust_${Date.now()}`,
      conversationId,
      sender: 'customer' as const,
      text: replyText,
      timestamp: new Date().toISOString().slice(11, 16),
      status: 'read' as const,
    };
    convs[index].messages.push(reply);
    convs[index].lastMessage = replyText;
    convs[index].lastTimestamp = 'Just now';
    convs[index].unreadCount += 1;
    this.setItem(STORAGE_KEYS.WHATSAPP, convs);
    return convs[index];
  }

  addWhatsAppContact(customerId: string, customerName: string, phone: string, initialMessage?: string, user?: UserAccount): WhatsAppConversation {
    const convs = this.getItem<WhatsAppConversation[]>(STORAGE_KEYS.WHATSAPP, []);
    const newConv: WhatsAppConversation = {
      id: `conv_${Date.now()}`,
      customerId,
      customerName,
      customerPhone: phone,
      unreadCount: 0,
      lastMessage: initialMessage || 'Welcome to our bespoke atelier.',
      lastTimestamp: 'Just now',
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: `conv_${Date.now()}`,
          sender: 'business',
          text: initialMessage || 'Assalam-o-Alaikum! Welcome to our bespoke atelier.',
          timestamp: new Date().toISOString().slice(11, 16),
          status: 'delivered',
        },
      ],
    };
    convs.unshift(newConv);
    this.setItem(STORAGE_KEYS.WHATSAPP, convs);
    return newConv;
  }

  getWhatsAppConfig(): WhatsAppCloudApiConfig {
    return this.getItem<WhatsAppCloudApiConfig>(STORAGE_KEYS.WHATSAPP_CONFIG, INITIAL_WHATSAPP_CONFIG);
  }

  updateWhatsAppConfig(cfg: WhatsAppCloudApiConfig, user: UserAccount): void {
    if (user.role !== 'ADMIN') throw new Error('Access Denied.');
    this.setItem(STORAGE_KEYS.WHATSAPP_CONFIG, cfg);
  }

  // --- FULL BACKUP AND RESTORE ---
  exportFullBackup(): string {
    const backup = {
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      businessName: this.getPrinterConfig().businessName,
      products: this.getProducts(),
      orders: this.getOrders('ADMIN'),
      invoices: this.getInvoices('ADMIN'),
      customers: this.getCustomers('ADMIN'),
      categories: this.getCategories(),
      expenseCategories: this.getExpenseCategories(),
      payments: this.getPayments(),
      expenses: this.getItem<ExpenseEntry[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES),
      whatsapp: this.getItem<WhatsAppConversation[]>(STORAGE_KEYS.WHATSAPP, []),
      auditLogs: this.getAuditLogs(),
      printerConfig: this.getPrinterConfig(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importFullBackup(jsonString: string, user: UserAccount): boolean {
    if (user.role !== 'ADMIN') throw new Error('Access Denied: Only Admins can import database backups.');
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.products)) this.setItem(STORAGE_KEYS.PRODUCTS, data.products);
      if (Array.isArray(data.orders)) this.setItem(STORAGE_KEYS.ORDERS, data.orders);
      if (Array.isArray(data.invoices)) this.setItem(STORAGE_KEYS.INVOICES, data.invoices);
      if (Array.isArray(data.customers)) this.setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (Array.isArray(data.categories)) this.setItem(STORAGE_KEYS.CATEGORIES, data.categories);
      if (Array.isArray(data.expenseCategories)) this.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, data.expenseCategories);
      if (Array.isArray(data.payments)) this.setItem(STORAGE_KEYS.PAYMENTS, data.payments);
      if (Array.isArray(data.expenses)) this.setItem(STORAGE_KEYS.EXPENSES, data.expenses);
      if (Array.isArray(data.whatsapp)) this.setItem(STORAGE_KEYS.WHATSAPP, data.whatsapp);
      if (Array.isArray(data.auditLogs)) this.setItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
      if (data.printerConfig) this.setItem(STORAGE_KEYS.PRINTER_CONFIG, data.printerConfig);

      this.addAuditLog({
        userName: user.name,
        userRole: user.role,
        action: 'DATABASE_RESTORED',
        details: `Restored database backup from file.`,
        entityType: 'BACKUP',
      });
      return true;
    } catch (err: any) {
      throw new Error(`Failed to restore backup: ${err.message}`);
    }
  }

  // --- RESET & PURGE (ZERO DEMO RECORDS / SEED FRESH DATA) ---
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSE_CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.WHATSAPP);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.PRINTER_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);

    this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.setItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    this.setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    this.setItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    this.setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    this.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.setItem(STORAGE_KEYS.PRINTER_CONFIG, INITIAL_PRINTER_CONFIG);
    this.setItem(STORAGE_KEYS.CURRENT_USER, ADMIN_USER);
  }

  clearAllData(user: UserAccount): void {
    if (user.role !== 'ADMIN') throw new Error('Access Denied.');
    this.setItem(STORAGE_KEYS.PRODUCTS, []);
    this.setItem(STORAGE_KEYS.ORDERS, []);
    this.setItem(STORAGE_KEYS.INVOICES, []);
    this.setItem(STORAGE_KEYS.CUSTOMERS, []);
    this.setItem(STORAGE_KEYS.PAYMENTS, []);
    this.setItem(STORAGE_KEYS.EXPENSES, []);
    this.setItem(STORAGE_KEYS.WHATSAPP, []);
  }

  clearSettingsData(user: UserAccount): ThermalPrinterConfig {
    if (user.role !== 'ADMIN') throw new Error('Access Denied.');
    const cleanConfig: ThermalPrinterConfig = {
      ...INITIAL_PRINTER_CONFIG,
      businessName: '',
      tagline: '',
      address: '',
      city: '',
      phone: '',
      websiteUrl: '',
      ntnNumber: '',
      footerNote: '',
    };
    this.setItem(STORAGE_KEYS.PRINTER_CONFIG, cleanConfig);
    return cleanConfig;
  }

  removeAllDemoData(user: UserAccount): ThermalPrinterConfig {
    this.clearAllData(user);
    return this.clearSettingsData(user);
  }

  // CSV EXPORT & IMPORT FOR PRODUCTS
  exportProductsCSV(): string {
    const products = this.getProducts();
    const headers = ['Code', 'Title', 'Category', 'Fabric', 'Color', 'PricePKR', 'CostPKR', 'StockQty', 'MinStockAlert', 'Sizes', 'Description'];
    const rows = products.map((p) => [
      `"${p.code.replace(/"/g, '""')}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category.replace(/"/g, '""')}"`,
      `"${p.fabric.replace(/"/g, '""')}"`,
      `"${p.color.replace(/"/g, '""')}"`,
      p.pricePKR,
      p.costPKR,
      p.stockQty,
      p.minStockAlert,
      `"${p.sizesAvailable.join(', ').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  importProductsCSV(csvText: string, user: UserAccount): { success: number; errors: string[] } {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return { success: 0, errors: ['CSV file is empty or missing headers.'] };
    }
    const currentProducts = this.getProducts();
    const categories = this.getCategories();
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const matches: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null && matches.length < 11) {
        let val = match[1] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        matches.push(val.trim());
      }
      const [code, title, category, fabric, color, priceStr, costStr, stockStr, minAlertStr, sizesStr, description] = matches;
      if (!title || !priceStr) {
        errors.push(`Row ${i + 1}: Missing required title or price.`);
        continue;
      }
      const cleanCode = code || `ZS-${Date.now().toString().slice(-4)}`;
      const cleanCat = category || 'Three-Piece Suit';
      if (!categories.includes(cleanCat)) {
        categories.push(cleanCat);
      }
      const existingIdx = currentProducts.findIndex((p) => p.code.toLowerCase() === cleanCode.toLowerCase());
      const newProd: Product = {
        id: existingIdx !== -1 ? currentProducts[existingIdx].id : `prod_${Date.now()}_${i}`,
        code: cleanCode,
        title,
        category: cleanCat,
        fabric: fabric || 'Super 150s Merino Wool',
        color: color || 'Navy Blue',
        pricePKR: Number(priceStr) || 50000,
        costPKR: Number(costStr) || 25000,
        stockQty: Number(stockStr) || 5,
        minStockAlert: Number(minAlertStr) || 2,
        sizesAvailable: sizesStr ? sizesStr.split(',').map((s) => s.trim()).filter(Boolean) : ['38R', '40R', '42R'],
        imageUrl: '/src/assets/images/suit_royal_navy_3piece_1792162981461.jpg',
        description: description || 'Imported via CSV batch catalog',
      };
      if (existingIdx !== -1) {
        currentProducts[existingIdx] = newProd;
      } else {
        currentProducts.push(newProd);
      }
      successCount++;
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, currentProducts);
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'CSV_PRODUCTS_IMPORTED',
      details: `Imported ${successCount} products from CSV file`,
      entityType: 'PRODUCT',
    });
    return { success: successCount, errors };
  }

  loadSampleData(user: UserAccount): void {
    if (user.role !== 'ADMIN') throw new Error('Access Denied: Only Admins can load sample data.');
    this.setItem(STORAGE_KEYS.PRODUCTS, SAMPLE_PRODUCTS);
    this.setItem(STORAGE_KEYS.CUSTOMERS, SAMPLE_CUSTOMERS);
    this.setItem(STORAGE_KEYS.INVOICES, SAMPLE_INVOICES);
    this.setItem(STORAGE_KEYS.ORDERS, SAMPLE_ORDERS);
    this.setItem(STORAGE_KEYS.PAYMENTS, SAMPLE_PAYMENTS);
    this.setItem(STORAGE_KEYS.EXPENSES, SAMPLE_EXPENSES);
    this.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'SAMPLE_DATA_LOADED',
      details: 'Loaded sample suits, customer profiles, invoices, and orders for testing.',
      entityType: 'BACKUP',
    });
  }
}

export const db = new DemoDatabaseService();
