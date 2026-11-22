export type Role = 'owner' | 'employee' | 'supervisor';

export type KYCStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended';

export type EmploymentStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: Role;
  mobile: string;
  cnic: string;
  cnicFrontUrl?: string;
  cnicBackUrl?: string;
  residentialAddress: string;
  emergencyContact: string;
  joiningDate: string;
  assignedSellingPointId?: string;
  assignedShiftId?: string;
  pinHash?: string;
  pin?: string;
  hasPosPin?: boolean;
  posSessionVersion?: number;
  kycStatus: KYCStatus;
  employmentStatus: EmploymentStatus;
  agreementDocUrl?: string;
  verificationNotes?: string;
  createdAt: string;
}

export type ProductCategory = 'shawarma' | 'canned_drink';

export interface RecipeIngredient {
  name: string;
  quantity: string;
  rate: string;
  cost: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  sellingPrice: number;
  productionCost: number;
  estimatedProfit: number;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  sku: string;
  promoPrice?: number;
  imageUrl: string;
  weightGrams?: number;
  foodWeightGrams?: number;
  packagingWeightGrams?: number;
  recipeIngredients?: RecipeIngredient[];
  packagingCost?: number;
  wastageReserveCost?: number;
  canSize?: string;
  brand?: string;
}

export interface SellingPoint {
  id: string;
  name: string;
  area: string;
  address: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadiusKm: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  currentShiftId?: string;
  isActive: boolean;
  operatingHours: string;
  estimatedPrepTime: string;
  takeawayAvailable: boolean;
  deliveryAvailable: boolean;
}

export type ShiftScheduleStatus = 'active' | 'planned' | 'inactive';

export interface ShiftSchedule {
  id: string;
  name: string;
  defaultStartTime: string;
  defaultEndTime: string;
  isOvernight: boolean;
  status: ShiftScheduleStatus;
  description: string;
}

export type ShiftSessionStatus = 'scheduled' | 'active' | 'closed' | 'cancelled';
export type SettlementStatus = 'pending' | 'submitted' | 'under_review' | 'verified' | 'rejected' | 'partially_settled';

export interface ShiftInventoryItem {
  productId: string;
  productName: string;
  quantity: number;
  physicalCount?: number;
  discrepancy?: number;
  reason?: string;
}

export interface ShiftSession {
  id: string;
  shiftScheduleId: string;
  shiftName: string;
  businessDate: string; // YYYY-MM-DD (PKT)
  employeeId: string;
  employeeName: string;
  sellingPointId: string;
  sellingPointName: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: ShiftSessionStatus;
  openingGps?: { lat: number; lng: number; accuracyMeters?: number; timestamp: string };
  closingGps?: { lat: number; lng: number; timestamp: string };
  openingInventory: ShiftInventoryItem[];
  closingInventory: ShiftInventoryItem[];
  totalOrders: number;
  shawarmasSold: number;
  drinksSold: number;
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  cashSales: number;
  jazzCashSales: number;
  easyPaisaSales: number;
  otherDigitalSales: number;
  expectedCashInHand: number;
  actualCashCounted?: number;
  cashDifference?: number;
  cashSubmitted?: number;
  remainingBalance?: number;
  settlementStatus: SettlementStatus;
  settlementDetails?: {
    amountTransferred: number;
    service: 'JazzCash' | 'Easypaisa';
    targetNumber: string; // "03120073794"
    transactionId: string;
    transferTime: string;
    proofUrl?: string;
    notes?: string;
    verifiedBy?: string;
    verifiedAt?: string;
  };
  closingNotes?: string;
}

export type InventoryMovementType =
  | 'opening_stock'
  | 'production_received'
  | 'purchase_received'
  | 'employee_issuance'
  | 'shift_transfer'
  | 'sale'
  | 'wastage'
  | 'damage'
  | 'return'
  | 'adjustment';

export type InventoryLocation =
  | 'central_kitchen'
  | 'employee_cold_box'
  | 'selling_point'
  | 'supplier'
  | 'customer'
  | 'wastage';

export interface InventoryLedgerEntry {
  id: string;
  timestamp: string;
  businessDate: string;
  productId: string;
  productName: string;
  movementType: InventoryMovementType;
  quantity: number; // positive for inbound, negative for outbound
  unitCost: number;
  totalCost: number;
  sourceLocation: InventoryLocation;
  destinationLocation: InventoryLocation;
  responsibleEmployeeId: string;
  responsibleEmployeeName: string;
  shiftSessionId?: string;
  sellingPointId?: string;
  orderId?: string;
  reason: string;
  authorizedBy: string;
}

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  productionDate: string;
  preparationTime: string;
  productId: string;
  productName: string;
  quantityPrepared: number;
  pouchBagSlots?: number; // e.g. 50 pouches (5 rows x 10 cols)
  ingredientsCost: number;
  packagingCost: number;
  wastageReserveCost: number;
  totalBatchCost: number;
  unitProductionCost: number;
  preparedBy: string;
  freshnessWindowHours: number;
  status: 'fresh' | 'consumed' | 'flagged_review' | 'expired';
  notes?: string;
}

export type OrderChannel = 'website' | 'pos' | 'admin';
export type OrderType = 'delivery' | 'takeaway';
export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'jazzcash' | 'easypaisa' | 'bank_transfer';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  subtotal: number;
  instructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  businessDate: string;
  createdAt: string;
  channel: OrderChannel;
  orderType: OrderType;
  status: OrderStatus;
  customerName: string;
  customerMobile: string;
  deliveryAddress?: string;
  deliveryCoordinates?: { lat: number; lng: number };
  sellingPointId: string;
  sellingPointName: string;
  employeeId: string;
  employeeName: string;
  shiftSessionId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  discount: number;
  grandTotal: number;
  costOfGoodsSold: number;
  grossProfit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  whatsappNotificationStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  isOfflineOrder?: boolean;
  syncedAt?: string;
  completionTime?: string;
  notes?: string;
}

export type PurchaseCategory =
  | 'Chicken'
  | 'Shawarma Ingredients'
  | 'Sauces'
  | 'Bread / Roti'
  | 'Vegetables'
  | 'Packaging'
  | 'Canned Drinks'
  | 'Fuel'
  | 'Transport'
  | 'Kitchen Supplies'
  | 'Other';

export interface PurchaseItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseRecord {
  id: string;
  purchaseId: string;
  purchaseDate: string;
  purchaseTime: string;
  supplierName: string;
  supplierContact: string;
  category: PurchaseCategory;
  items: PurchaseItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'unpaid';
  receiptPhotoUrl?: string;
  notes?: string;
  enteredBy: string;
}

export type ExpenseCategory =
  | 'Transport'
  | 'Fuel'
  | 'Electricity'
  | 'Packaging'
  | 'Maintenance'
  | 'Marketing'
  | 'Miscellaneous';

export interface ExpenseRecord {
  id: string;
  expenseDate: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  shiftSessionId?: string;
  sellingPointId?: string;
  enteredBy: string;
  receiptUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  firstOrderDate: string;
  lastOrderDate: string;
  totalOrders: number;
  lifetimeSpend: number;
  preferredSellingPointId?: string;
  notes?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'not_interested' | 'followup_required';

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  location: string;
  source: string;
  dateAdded: string;
  interestedProduct: string;
  followUpDate?: string;
  status: LeadStatus;
  notes?: string;
}

export interface WhatsAppLog {
  id: string;
  messageType: 'order_confirmed' | 'order_preparing' | 'order_ready' | 'order_out_for_delivery' | 'order_completed' | 'order_cancelled';
  customerName: string;
  customerMobile: string;
  orderNumber: string;
  messageBody: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt: string;
  providerResponse?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface SystemSettings {
  appName: string;
  tagline: string;
  ownerName: string;
  ownerContact: string;
  jazzCashNumber: string;
  easyPaisaNumber: string;
  officialAddress: string;
  defaultDeliveryRadiusKm: number;
  defaultDeliveryFee: number;
  enableWhatsAppNotifications: boolean;
  googleMapsApiKey?: string;
  whatsappApiToken?: string;
  whatsappPhoneNumberId?: string;
}
