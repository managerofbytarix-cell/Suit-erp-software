/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'EMPLOYEE';
export type AppTheme = 'dark' | 'light';

export interface UserPermissions {
  canViewProfits: boolean;
  canViewCustomerPhone: boolean;
  canViewCustomerAddress: boolean;
  canViewPrivateWhatsApp: boolean;
  canManageSettings: boolean;
  canDeleteRecords: boolean;
  canExportData: boolean;
  canViewFinancialTotals: boolean;
  canEditMeasurements: boolean;
  canApplyDiscounts: boolean;
  allowedViews?: string[];
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
  createdAt?: string;
  permissions: UserPermissions;
}

export type SuitCategory = string;

export interface Product {
  id: string;
  code: string; // e.g. ZS-701
  title: string;
  category: string;
  fabric: string; // e.g. Super 150s Wool, Italian Cashmere, Jamawar
  color: string;
  pricePKR: number;
  costPKR: number; // Direct cost of goods (COGS)
  stockQty: number;
  minStockAlert: number;
  sizesAvailable: string[];
  imageUrl: string;
  description: string;
  isCustomTailoredOnly?: boolean;
}

export interface BespokeMeasurements {
  // Jacket / Coat
  chest: number; // inches
  waist: number;
  hip: number;
  shoulder: number;
  sleeve: number;
  jacketLength: number;
  collar: number;
  bicep?: number;
  wrist?: number;
  crossBack?: number;
  armholeDepth?: number;
  lapelStyle: 'Peak Lapel' | 'Notch Lapel' | 'Shawl Collar' | 'Mandarin Collar' | string;
  ventStyle: 'Double Vent' | 'Single Vent' | 'No Vent' | string;
  buttonStyle?: string;
  
  // Waistcoat
  waistcoatLength?: number;
  waistcoatChest?: number;
  waistcoatWaist?: number;

  // Trouser / Pant
  trouserWaist: number;
  trouserLength: number;
  inseam: number;
  thigh: number;
  bottomHem?: number;
  crotchRise?: number;

  // Traditional Kameez / Kurta
  kameezLength?: number;
  kameezChest?: number;
  kameezDaman?: number;
  shalwarLength?: number;
  shalwarPaicha?: number;

  // Sherwani / Prince Coat
  sherwaniLength?: number;
  turbanSize?: number;

  customNotes?: string;
}

export interface MeasurementRevision {
  id: string;
  date: string;
  measurements: BespokeMeasurements;
  customFields?: Record<string, string | number>;
  fitNotes?: string;
  recordedBy: string;
}

export interface AlterationRecord {
  id: string;
  orderNumber?: string;
  invoiceNumber?: string;
  date: string;
  garment: string;
  alterationDetails: string;
  status: 'Received' | 'In Tailoring' | 'Ready for Fitting' | 'Completed';
  masterTailor: string;
  costPKR?: number;
}

export interface FamilyMember {
  id: string;
  customerId: string; // References primary customer
  name: string;
  relationship: 'Self' | 'Father' | 'Brother' | 'Son' | 'Uncle' | 'Cousin' | 'Nephew' | 'Groom' | string;
  photoUrl?: string;
  phone?: string;
  city?: string;
  notes?: string;
  preferences?: string; // fabric / fit preferences
  currentMeasurements: BespokeMeasurements;
  customFields?: Record<string, string | number>;
  measurementHistory: MeasurementRevision[];
  alterations?: AlterationRecord[];
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string; // Restricted for employee
  email: string;
  city: 'Lahore' | 'Karachi' | 'Islamabad' | 'Faisalabad' | 'Rawalpindi' | 'Peshawar' | 'Multan' | string;
  address: string; // Restricted for employee
  measurements?: BespokeMeasurements;
  customFields?: Record<string, string | number>;
  notes?: string;
  linkedWhatsAppNumber?: string;
  familyMembers?: FamilyMember[];
  totalOrdersCount: number;
  totalSpentPKR: number;
  remainingBalancePKR?: number;
  createdAt: string;
}

export type OrderStatus = 
  | 'Draft'
  | 'Fabric Cut'
  | 'In Tailoring'
  | 'Fitting Scheduled'
  | 'Ready for Dispatch'
  | 'Dispatched'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';

export type SaleType = 
  | 'ready_made'
  | 'custom_stitching'
  | 'fabric'
  | 'alteration'
  | 'other_service';

export interface OrderItem {
  id?: string;
  productId?: string;
  productCode: string;
  title: string;
  type?: SaleType;
  fabric: string;
  color: string;
  sizeOrTailoring: string; // e.g. "40R" or "Bespoke Custom"
  quantity: number;
  unitPricePKR: number;
  costPKR?: number; // Direct COGS per unit
  discountPKR?: number;
  totalPricePKR: number;
  fabricMeters?: number;
  stitchingChargePKR?: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ZS-2026-1042
  invoiceNumber?: string; // Linked invoice number
  customerId: string;
  customerName: string;
  customerPhone: string; // Masked if retrieved as Employee
  customerCity: string;
  customerAddress: string; // Masked if retrieved as Employee
  familyMemberId?: string;
  familyMemberName?: string;
  familyMemberRelationship?: string;
  items: OrderItem[];
  subtotalPKR: number;
  tailoringFeePKR: number;
  discountPKR: number;
  shippingFeePKR: number;
  grandTotalPKR: number;
  advancePaidPKR: number;
  balanceDuePKR: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'Cash on Delivery' | 'Bank Transfer / Raast' | 'POS Card' | 'Cash at Atelier' | 'Cheque' | string;
  status: OrderStatus;
  isRushOrder: boolean;
  eventDate?: string;
  deliveryDate: string;
  assignedToEmployeeId?: string;
  measurementsSnapshot?: BespokeMeasurements;
  customFieldsSnapshot?: Record<string, string | number>;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePrintRecord {
  id: string;
  date: string;
  printedBy: string;
  format: 'A4' | '80mm';
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-1001
  orderId?: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  date: string;
  dueDate: string;
  saleType: SaleType | 'mixed';
  items: OrderItem[];
  subtotalPKR: number;
  tailoringFeePKR: number;
  discountPKR: number;
  taxPKR: number;
  grandTotalPKR: number;
  paidAmountPKR: number;
  balanceDuePKR: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes?: string;
  printHistory: InvoicePrintRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntry {
  id: string;
  receiptNumber?: string; // e.g. RCP-2026-0001
  invoiceNumber?: string;
  orderNumber?: string;
  customerId?: string;
  customerName: string;
  amountPKR: number;
  type: 'Advance Deposit' | 'Balance Settlement' | 'Full Payment' | 'Installment' | 'Refund' | string;
  method: 'Raast / Online Bank' | 'Cash on Delivery' | 'POS Debit/Credit Card' | 'Cash' | 'Cheque' | string;
  referenceNumber: string;
  date: string;
  notes?: string;
  recordedBy: string;
  previousBalancePKR?: number;
  newBalancePKR?: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  isDirectCost: boolean; // Direct COGS (fabric purchases, sewing materials, artisan stitching wages) vs operating overhead (rent, utilities)
  isDefault: boolean;
}

export interface ExpenseEntry {
  id: string;
  category: string;
  description: string;
  amountPKR: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer / Raast' | 'POS Card' | 'Cheque' | string;
  vendorName: string;
  receiptNumber: string;
  isDirectCost?: boolean;
  recordedBy: string;
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'business';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  templateName?: string;
}

export interface WhatsAppConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  unreadCount: number;
  lastMessage: string;
  lastTimestamp: string;
  orderNumberRef?: string;
  messages: WhatsAppMessage[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  entityType: 'ORDER' | 'PRODUCT' | 'PAYMENT' | 'CUSTOMER' | 'AUTH' | 'SETTINGS' | 'CATEGORY' | 'BACKUP' | 'AI_AGENT' | 'INVOICE' | 'EXPENSE' | 'REPORT';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'inventory' | 'payment' | 'fitting' | 'ai' | 'finance';
  read: boolean;
  linkTab?: string;
  targetId?: string;
}

export interface ThermalPrinterConfig {
  paperWidth: '58mm' | '80mm';
  businessName: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  websiteUrl?: string;
  ntnNumber: string;
  footerNote: string;
  printBarcode: boolean;
  cutPaperAfterPrint: boolean;
  autoSaveEnabled?: boolean;
  autoSaveDelayMs?: number;
}

export interface WhatsAppCloudApiConfig {
  mode: 'DEMO' | 'LIVE';
  phoneNumberId: string;
  businessAccountId: string;
  permanentAccessToken: string;
  webhookVerifyToken: string;
  isConnected: boolean;
  lastWebhookPing?: string;
}

export interface AIAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionType?: 'CREATE_ORDER' | 'GENERATE_INVOICE' | 'UPDATE_STOCK' | 'ADD_CATEGORY' | 'RECORD_PAYMENT' | 'RECORD_EXPENSE' | 'INSIGHT' | 'NONE';
  actionPayload?: any;
  executed?: boolean;
}

export interface FinancialFilter {
  period: 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
  selectedMonth?: string; // e.g. "2026-10"
  selectedYear?: number; // e.g. 2026
}

export interface FullBackupData {
  version: string;
  timestamp: string;
  businessName: string;
  products: Product[];
  orders: Order[];
  invoices: Invoice[];
  customers: Customer[];
  categories: string[];
  expenseCategories: ExpenseCategory[];
  payments: PaymentEntry[];
  expenses: ExpenseEntry[];
  whatsapp: WhatsAppConversation[];
  auditLogs: AuditLog[];
  printerConfig: ThermalPrinterConfig;
}
