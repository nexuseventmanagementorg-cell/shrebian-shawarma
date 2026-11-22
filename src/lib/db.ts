import fs from 'fs';
import path from 'path';
import {
  User,
  Product,
  SellingPoint,
  ShiftSchedule,
  ShiftSession,
  ProductionBatch,
  InventoryLedgerEntry,
  Order,
  PurchaseRecord,
  ExpenseRecord,
  Customer,
  Lead,
  WhatsAppLog,
  AuditLog,
  SystemSettings,
  OrderStatus,
  PaymentMethod,
  SettlementStatus
} from '@/types';
import {
  initialSettings,
  initialUsers,
  initialProducts,
  initialSellingPoints,
  initialShiftSchedules,
  initialShiftSessions,
  initialProductionBatches,
  initialInventoryLedger,
  initialOrders,
  initialPurchases,
  initialExpenses,
  initialCustomers,
  initialLeads
} from './initialData';
import { FIXED_DELIVERY_FEE, MIN_DELIVERY_SHAWARMA_COUNT } from './delivery';

export interface DatabaseState {
  settings: SystemSettings;
  users: User[];
  products: Product[];
  sellingPoints: SellingPoint[];
  shiftSchedules: ShiftSchedule[];
  shiftSessions: ShiftSession[];
  productionBatches: ProductionBatch[];
  inventoryLedger: InventoryLedgerEntry[];
  orders: Order[];
  purchases: PurchaseRecord[];
  expenses: ExpenseRecord[];
  customers: Customer[];
  leads: Lead[];
  whatsappLogs: WhatsAppLog[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

let inMemoryState: DatabaseState | null = null;

function getInitialState(): DatabaseState {
  return {
    settings: { ...initialSettings },
    users: [...initialUsers],
    products: [...initialProducts],
    sellingPoints: [...initialSellingPoints],
    shiftSchedules: [...initialShiftSchedules],
    shiftSessions: [...initialShiftSessions],
    productionBatches: [...initialProductionBatches],
    inventoryLedger: [...initialInventoryLedger],
    orders: [...initialOrders],
    purchases: [...initialPurchases],
    expenses: [...initialExpenses],
    customers: [...initialCustomers],
    leads: [...initialLeads],
    whatsappLogs: [],
    auditLogs: [
      {
        id: "audit_init",
        timestamp: new Date().toISOString(),
        userId: "usr_kaleem",
        userName: "Kaleem Durrani",
        action: "SYSTEM_INITIALIZED",
        entityType: "SYSTEM",
        entityId: "system",
        newValue: "Shrebian Shawarma production database initialized"
      }
    ]
  };
}

export function loadDatabase(): DatabaseState {
  if (inMemoryState) {
    return inMemoryState;
  }

  try {
    if (typeof window === 'undefined') {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const loadedState: DatabaseState = {
          ...getInitialState(),
          ...parsed
        };
        let removedLegacyPins = false;
        loadedState.users.forEach(user => {
          if (user.pin !== undefined) {
            delete user.pin;
            removedLegacyPins = true;
          }
        });
        inMemoryState = loadedState;
        if (removedLegacyPins) saveDatabase(loadedState);
        return loadedState;
      }
    }
  } catch (err) {
    console.error('Error loading database from file, falling back to memory/defaults:', err);
  }

  inMemoryState = getInitialState();
  saveDatabase(inMemoryState);
  return inMemoryState;
}

export function saveDatabase(state: DatabaseState): void {
  inMemoryState = state;
  try {
    if (typeof window === 'undefined') {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    }
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// ----------------- CALCULATION HELPERS (Pakistan Standard Time) -----------------
export function getPKTDate(dateObj: Date = new Date()): string {
  // Format as YYYY-MM-DD in Asia/Karachi (UTC+5)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
}

export function getPKTTimeString(dateObj: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(dateObj) + ' PKT';
}

// Haversine formula for 5 KM radius verification
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 100) / 100;
}

// ----------------- CORE DATABASE OPERATIONS -----------------

// Users & KYC
export function getUsers(): User[] {
  return loadDatabase().users;
}

export function getUserById(id: string): User | undefined {
  return loadDatabase().users.find(u => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return loadDatabase().users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function updateUserKYC(userId: string, status: User['kycStatus'], notes?: string, adminUser: string = 'Kaleem Durrani'): User | null {
  const state = loadDatabase();
  const index = state.users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  const old = state.users[index];
  const updated: User = {
    ...old,
    kycStatus: status,
    verificationNotes: notes ? `${old.verificationNotes || ''} | ${notes}` : old.verificationNotes
  };

  state.users[index] = updated;
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: "usr_kaleem",
    userName: adminUser,
    action: "UPDATE_KYC_STATUS",
    entityType: "USER",
    entityId: userId,
    previousValue: old.kycStatus,
    newValue: status,
    reason: notes
  });

  saveDatabase(state);
  return updated;
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const state = loadDatabase();
  const newUser: User = {
    ...userData,
    id: `usr_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  state.users.push(newUser);
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: "usr_kaleem",
    userName: "Kaleem Durrani",
    action: "CREATE_EMPLOYEE",
    entityType: "USER",
    entityId: newUser.id,
    newValue: `${newUser.fullName} (${newUser.username})`
  });
  saveDatabase(state);
  return newUser;
}

// Products
export function getProducts(): Product[] {
  return loadDatabase().products;
}

export function getProductById(id: string): Product | undefined {
  return loadDatabase().products.find(p => p.id === id);
}

export function updateProductPrice(productId: string, sellingPrice: number, productionCost: number, adminUser: string = 'Kaleem Durrani'): Product | null {
  const state = loadDatabase();
  const idx = state.products.findIndex(p => p.id === productId);
  if (idx === -1) return null;

  const old = state.products[idx];
  const updated: Product = {
    ...old,
    sellingPrice,
    productionCost,
    estimatedProfit: Math.max(0, sellingPrice - productionCost)
  };

  state.products[idx] = updated;
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: "usr_kaleem",
    userName: adminUser,
    action: "UPDATE_PRODUCT_PRICE",
    entityType: "PRODUCT",
    entityId: productId,
    previousValue: `Price: ${old.sellingPrice}, Cost: ${old.productionCost}`,
    newValue: `Price: ${sellingPrice}, Cost: ${productionCost}`,
    reason: "Admin updated product margins"
  });

  saveDatabase(state);
  return updated;
}

// Selling Points
export function getSellingPoints(): SellingPoint[] {
  return loadDatabase().sellingPoints;
}

export function getSellingPointById(id: string): SellingPoint | undefined {
  return loadDatabase().sellingPoints.find(sp => sp.id === id);
}

export function toggleSellingPointStatus(spId: string, isActive: boolean, adminUser: string = 'Kaleem Durrani'): SellingPoint | null {
  const state = loadDatabase();
  const idx = state.sellingPoints.findIndex(sp => sp.id === spId);
  if (idx === -1) return null;

  state.sellingPoints[idx].isActive = isActive;
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: "usr_kaleem",
    userName: adminUser,
    action: "TOGGLE_SELLING_POINT_STATUS",
    entityType: "SELLING_POINT",
    entityId: spId,
    newValue: isActive ? "ACTIVE" : "INACTIVE"
  });

  saveDatabase(state);
  return state.sellingPoints[idx];
}

// Shifts
export function getShiftSchedules(): ShiftSchedule[] {
  return loadDatabase().shiftSchedules;
}

export function getShiftSessions(): ShiftSession[] {
  return loadDatabase().shiftSessions;
}

export function getActiveShiftSessionForEmployee(employeeId: string): ShiftSession | undefined {
  return loadDatabase().shiftSessions.find(s => s.employeeId === employeeId && s.status === 'active');
}

export function updateShiftOpeningLocation(
  employeeId: string,
  sessionId: string,
  location: { lat: number; lng: number; accuracyMeters?: number }
): ShiftSession | null {
  const state = loadDatabase();
  const session = state.shiftSessions.find(
    candidate => candidate.id === sessionId &&
      candidate.employeeId === employeeId &&
      candidate.status === 'active'
  );
  if (!session) return null;

  session.openingGps = { ...location, timestamp: new Date().toISOString() };
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: employeeId,
    userName: session.employeeName,
    action: 'SHIFT_LOCATION_CHECK_IN',
    entityType: 'SHIFT_SESSION',
    entityId: session.id,
    newValue: `Location check-in recorded for ${session.sellingPointName}`
  });
  saveDatabase(state);
  return session;
}

export function startEmployeeShift(
  employeeId: string,
  sellingPointId: string,
  shiftScheduleId: string,
  openingGps?: { lat: number; lng: number }
): ShiftSession {
  const state = loadDatabase();
  const employee = state.users.find(u => u.id === employeeId);
  const sellingPoint = state.sellingPoints.find(sp => sp.id === spIdMatch(sellingPointId));
  const schedule = state.shiftSchedules.find(s => s.id === shiftScheduleId) || state.shiftSchedules[0];

  const now = new Date();
  const businessDate = getPKTDate(now);

  // Calculate opening inventory for this employee at this selling point
  const coldBoxItems = state.products.map(p => {
    // Sum movements for this employee / location
    const qty = state.inventoryLedger
      .filter(l => l.productId === p.id && (l.responsibleEmployeeId === employeeId || l.sellingPointId === sellingPointId))
      .reduce((sum, l) => sum + l.quantity, 0);
    return {
      productId: p.id,
      productName: p.name,
      quantity: Math.max(0, qty)
    };
  }).filter(item => item.quantity > 0);

  const newSession: ShiftSession = {
    id: `sess_${Date.now()}`,
    shiftScheduleId: schedule.id,
    shiftName: schedule.name,
    businessDate,
    employeeId: employee?.id || employeeId,
    employeeName: employee?.fullName || "Operator",
    sellingPointId: sellingPoint?.id || sellingPointId,
    sellingPointName: sellingPoint?.name || "Selling Point",
    scheduledStartTime: schedule.defaultStartTime,
    scheduledEndTime: schedule.defaultEndTime,
    actualStartTime: now.toISOString(),
    status: 'active',
    openingGps: openingGps ? { ...openingGps, timestamp: now.toISOString() } : undefined,
    openingInventory: coldBoxItems.length > 0 ? coldBoxItems : [
      { productId: "prod_regular_shawarma", productName: "REGULAR SHREBIAN SHAWARMA", quantity: 50 },
      { productId: "prod_spicy_shawarma", productName: "SPICY SHREBIAN SHAWARMA", quantity: 30 },
      { productId: "prod_special_shawarma", productName: "SPECIAL SHREBIAN SHAWARMA", quantity: 20 },
      { productId: "prod_drink_coke", productName: "Coca-Cola (Can 250ml)", quantity: 12 },
      { productId: "prod_drink_pepsi", productName: "Pepsi (Can 250ml)", quantity: 8 },
      { productId: "prod_drink_sting", productName: "Sting Berry Blast (Can 250ml)", quantity: 6 },
      { productId: "prod_drink_rani", productName: "Rani Float Juice (Can 240ml)", quantity: 4 }
    ],
    closingInventory: [],
    totalOrders: 0,
    shawarmasSold: 0,
    drinksSold: 0,
    grossSales: 0,
    discounts: 0,
    refunds: 0,
    netSales: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    cashSales: 0,
    jazzCashSales: 0,
    easyPaisaSales: 0,
    otherDigitalSales: 0,
    expectedCashInHand: 0,
    settlementStatus: 'pending'
  };

  state.shiftSessions.push(newSession);

  // Automatically activate selling point
  if (sellingPoint) {
    sellingPoint.isActive = true;
    sellingPoint.assignedEmployeeId = employeeId;
    sellingPoint.assignedEmployeeName = employee?.fullName;
    sellingPoint.currentShiftId = newSession.id;
  }

  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: now.toISOString(),
    userId: employeeId,
    userName: employee?.fullName || "Operator",
    action: "START_SHIFT",
    entityType: "SHIFT_SESSION",
    entityId: newSession.id,
    newValue: `Started ${schedule.name} at ${sellingPoint?.name}`
  });

  saveDatabase(state);
  return newSession;
}

function spIdMatch(id: string) {
  return id;
}

export function closeEmployeeShift(
  sessionId: string,
  closingDetails: {
    actualCashCounted: number;
    closingInventory: { productId: string; physicalCount: number; reason?: string }[];
    closingNotes?: string;
  }
): ShiftSession | null {
  const state = loadDatabase();
  const session = state.shiftSessions.find(s => s.id === sessionId);
  if (!session) return null;

  const now = new Date();
  session.actualEndTime = now.toISOString();
  session.status = 'closed';
  session.actualCashCounted = closingDetails.actualCashCounted;
  session.cashDifference = closingDetails.actualCashCounted - session.expectedCashInHand;
  session.closingNotes = closingDetails.closingNotes;

  // Process closing inventory comparison
  session.closingInventory = closingDetails.closingInventory.map(item => {
    const prod = state.products.find(p => p.id === item.productId);
    const openingItem = session.openingInventory.find(o => o.productId === item.productId);
    const openingQty = openingItem ? openingItem.quantity : 0;
    
    // Total sold in this session
    const soldQty = state.orders
      .filter(o => o.shiftSessionId === sessionId && o.status === 'completed')
      .flatMap(o => o.items)
      .filter(i => i.productId === item.productId)
      .reduce((sum, i) => sum + i.quantity, 0);

    const expectedClosing = Math.max(0, openingQty - soldQty);
    const discrepancy = item.physicalCount - expectedClosing;

    // Record wastage or discrepancy in ledger if negative
    if (discrepancy < 0) {
      state.inventoryLedger.push({
        id: `ledg_waste_${Date.now()}_${item.productId}`,
        timestamp: now.toISOString(),
        businessDate: session.businessDate,
        productId: item.productId,
        productName: prod?.name || item.productId,
        movementType: "wastage",
        quantity: discrepancy,
        unitCost: prod?.productionCost || 0,
        totalCost: Math.abs(discrepancy) * (prod?.productionCost || 0),
        sourceLocation: "employee_cold_box",
        destinationLocation: "wastage",
        responsibleEmployeeId: session.employeeId,
        responsibleEmployeeName: session.employeeName,
        shiftSessionId: session.id,
        sellingPointId: session.sellingPointId,
        reason: item.reason || "Physical count shortage at shift close",
        authorizedBy: session.employeeName
      });
    }

    return {
      productId: item.productId,
      productName: prod?.name || item.productId,
      quantity: expectedClosing,
      physicalCount: item.physicalCount,
      discrepancy,
      reason: item.reason
    };
  });

  // Mark selling point closed if no other active session
  const sp = state.sellingPoints.find(p => p.id === session.sellingPointId);
  if (sp && sp.currentShiftId === session.id) {
    sp.isActive = false;
    sp.currentShiftId = undefined;
  }

  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: now.toISOString(),
    userId: session.employeeId,
    userName: session.employeeName,
    action: "CLOSE_SHIFT",
    entityType: "SHIFT_SESSION",
    entityId: session.id,
    newValue: `Expected Cash: ${session.expectedCashInHand}, Actual Counted: ${closingDetails.actualCashCounted}, Diff: ${session.cashDifference}`
  });

  saveDatabase(state);
  return session;
}

// INVENTORY CARRY-FORWARD: Day-to-Night Transfer without artificial duplication
export function transferInventoryBetweenShifts(
  sourceShiftId: string,
  targetShiftId: string,
  items: { productId: string; quantity: number }[],
  authorizedBy: string = "Kaleem Durrani"
): boolean {
  const state = loadDatabase();
  const source = state.shiftSessions.find(s => s.id === sourceShiftId);
  const target = state.shiftSessions.find(s => s.id === targetShiftId);
  if (!source || !target) return false;

  const now = new Date();
  items.forEach(item => {
    const prod = state.products.find(p => p.id === item.productId);
    // Outflow from source shift
    state.inventoryLedger.push({
      id: `ledg_trf_out_${Date.now()}_${item.productId}`,
      timestamp: now.toISOString(),
      businessDate: source.businessDate,
      productId: item.productId,
      productName: prod?.name || item.productId,
      movementType: "shift_transfer",
      quantity: -item.quantity,
      unitCost: prod?.productionCost || 0,
      totalCost: item.quantity * (prod?.productionCost || 0),
      sourceLocation: "employee_cold_box",
      destinationLocation: "selling_point",
      responsibleEmployeeId: source.employeeId,
      responsibleEmployeeName: source.employeeName,
      shiftSessionId: source.id,
      sellingPointId: source.sellingPointId,
      reason: `Transfer remaining inventory from ${source.shiftName} to ${target.shiftName}`,
      authorizedBy
    });

    // Inflow to target shift (net change to company inventory = 0)
    state.inventoryLedger.push({
      id: `ledg_trf_in_${Date.now()}_${item.productId}`,
      timestamp: now.toISOString(),
      businessDate: target.businessDate,
      productId: item.productId,
      productName: prod?.name || item.productId,
      movementType: "shift_transfer",
      quantity: item.quantity,
      unitCost: prod?.productionCost || 0,
      totalCost: item.quantity * (prod?.productionCost || 0),
      sourceLocation: "selling_point",
      destinationLocation: "employee_cold_box",
      responsibleEmployeeId: target.employeeId,
      responsibleEmployeeName: target.employeeName,
      shiftSessionId: target.id,
      sellingPointId: target.sellingPointId,
      reason: `Carried forward opening stock from ${source.shiftName}`,
      authorizedBy
    });
  });

  saveDatabase(state);
  return true;
}

// Production Batches
export function getProductionBatches(): ProductionBatch[] {
  return loadDatabase().productionBatches;
}

export function createProductionBatch(data: {
  productId: string;
  quantityPrepared: number;
  ingredientsCost: number;
  packagingCost: number;
  wastageReserveCost: number;
  preparedBy: string;
  freshnessWindowHours?: number;
  notes?: string;
}): ProductionBatch {
  const state = loadDatabase();
  const prod = state.products.find(p => p.id === data.productId);
  const now = new Date();
  const totalCost = data.ingredientsCost + data.packagingCost + data.wastageReserveCost;
  const unitCost = Math.round(totalCost / Math.max(1, data.quantityPrepared));

  const batch: ProductionBatch = {
    id: `batch_${Date.now()}`,
    batchNumber: `PB-${getPKTDate(now).replace(/-/g, '')}-${state.productionBatches.length + 1}`,
    productionDate: getPKTDate(now),
    preparationTime: getPKTTimeString(now),
    productId: data.productId,
    productName: prod?.name || "Shawarma",
    quantityPrepared: data.quantityPrepared,
    pouchBagSlots: Math.min(50, data.quantityPrepared),
    ingredientsCost: data.ingredientsCost,
    packagingCost: data.packagingCost,
    wastageReserveCost: data.wastageReserveCost,
    totalBatchCost: totalCost,
    unitProductionCost: unitCost,
    preparedBy: data.preparedBy,
    freshnessWindowHours: data.freshnessWindowHours || 8,
    status: 'fresh',
    notes: data.notes
  };

  state.productionBatches.unshift(batch);

  // Add to central inventory ledger
  state.inventoryLedger.push({
    id: `ledg_prod_${Date.now()}`,
    timestamp: now.toISOString(),
    businessDate: batch.productionDate,
    productId: batch.productId,
    productName: batch.productName,
    movementType: "production_received",
    quantity: batch.quantityPrepared,
    unitCost: batch.unitProductionCost,
    totalCost: batch.totalBatchCost,
    sourceLocation: "central_kitchen",
    destinationLocation: "central_kitchen",
    responsibleEmployeeId: "usr_kaleem",
    responsibleEmployeeName: data.preparedBy,
    reason: `Batch ${batch.batchNumber} prepared at home kitchen`,
    authorizedBy: data.preparedBy
  });

  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: now.toISOString(),
    userId: "usr_kaleem",
    userName: data.preparedBy,
    action: "RECORD_PRODUCTION",
    entityType: "PRODUCTION_BATCH",
    entityId: batch.id,
    newValue: `${batch.quantityPrepared} units of ${batch.productName} (Unit Cost: Rs. ${batch.unitProductionCost})`
  });

  saveDatabase(state);
  return batch;
}

// Orders & Order Management
export function getOrders(): Order[] {
  return loadDatabase().orders;
}

export function getOrderById(id: string): Order | undefined {
  return loadDatabase().orders.find(o => o.id === id || o.orderNumber === id);
}

export function createOrder(data: {
  channel: Order['channel'];
  orderType: Order['orderType'];
  customerName: string;
  customerMobile: string;
  deliveryAddress?: string;
  deliveryCoordinates?: { lat: number; lng: number };
  sellingPointId: string;
  employeeId?: string;
  items: { productId: string; quantity: number; instructions?: string }[];
  paymentMethod: PaymentMethod;
  discount?: number;
  deliveryCharges?: number;
  notes?: string;
}): { success: boolean; order?: Order; error?: string } {
  // Validate compulsory customer details
  if (!data.customerName || !data.customerName.trim()) {
    return { success: false, error: "Customer name is compulsory before placing an order." };
  }
  const cleanMobile = data.customerMobile.replace(/\D/g, '');
  if (!cleanMobile || cleanMobile.length < 10) {
    return { success: false, error: "A valid mobile number is compulsory before order confirmation." };
  }

  const state = loadDatabase();
  const sellingPoint = state.sellingPoints.find(sp => sp.id === data.sellingPointId);
  if (!sellingPoint) {
    return { success: false, error: "Selected selling point was not found." };
  }

  if (data.orderType === 'delivery') {
    const shawarmaCount = data.items.reduce((count, item) => {
      const product = state.products.find(candidate => candidate.id === item.productId);
      return count + (product?.category === 'shawarma' ? item.quantity : 0);
    }, 0);
    if (shawarmaCount < MIN_DELIVERY_SHAWARMA_COUNT) {
      return { success: false, error: "Delivery requires at least 2 shawarmas." };
    }
  }

  // Verify delivery radius if delivery
  if (data.orderType === 'delivery') {
    if (!data.deliveryAddress || !data.deliveryAddress.trim()) {
      return { success: false, error: "Delivery address is required for delivery orders." };
    }
    if (
      data.deliveryCoordinates &&
      typeof sellingPoint.latitude === 'number' &&
      Number.isFinite(sellingPoint.latitude) &&
      typeof sellingPoint.longitude === 'number' &&
      Number.isFinite(sellingPoint.longitude)
    ) {
      const distance = calculateDistanceKm(
        sellingPoint.latitude,
        sellingPoint.longitude,
        data.deliveryCoordinates.lat,
        data.deliveryCoordinates.lng
      );
      if (distance > sellingPoint.deliveryRadiusKm) {
        return {
          success: false,
          error: `Address is ${distance} KM away. We currently deliver only within ${sellingPoint.deliveryRadiusKm} KM of our active selling points.`
        };
      }
    }
  }

  const now = new Date();
  const businessDate = getPKTDate(now);

  // Active shift
  const activeShift = data.employeeId
    ? state.shiftSessions.find(
        s => s.employeeId === data.employeeId && s.sellingPointId === data.sellingPointId && s.status === 'active'
      )
    : state.shiftSessions.find(
        s => s.sellingPointId === data.sellingPointId && s.status === 'active'
      ) || state.shiftSessions[0];

  const employee = state.users.find(u => u.id === (data.employeeId || activeShift?.employeeId)) || state.users[0];

  // Calculate order items & COGS
  let subtotal = 0;
  let totalCostOfGoodsSold = 0;
  let totalShawarmas = 0;
  let totalDrinks = 0;

  const orderItems = data.items.map(item => {
    const prod = state.products.find(p => p.id === item.productId);
    if (!prod) throw new Error(`Product ${item.productId} not found`);

    const itemSubtotal = prod.sellingPrice * item.quantity;
    const itemCost = prod.productionCost * item.quantity;
    subtotal += itemSubtotal;
    totalCostOfGoodsSold += itemCost;

    if (prod.category === 'shawarma') totalShawarmas += item.quantity;
    if (prod.category === 'canned_drink') totalDrinks += item.quantity;

    return {
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      unitPrice: prod.sellingPrice,
      unitCost: prod.productionCost,
      quantity: item.quantity,
      subtotal: itemSubtotal,
      instructions: item.instructions
    };
  });

  const discount = Math.max(0, data.discount || 0);
  const deliveryCharges = data.orderType === 'delivery' ? FIXED_DELIVERY_FEE : 0;
  const grandTotal = Math.max(0, subtotal + deliveryCharges - discount);
  const grossProfit = grandTotal - totalCostOfGoodsSold;

  const orderNumber = `SHR-${String(state.orders.length + 101).padStart(6, '0')}`;

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderNumber,
    businessDate,
    createdAt: now.toISOString(),
    channel: data.channel,
    orderType: data.orderType,
    status: 'completed', // By default POS and walk-in/confirmed orders are completed
    customerName: data.customerName.trim(),
    customerMobile: cleanMobile,
    deliveryAddress: data.deliveryAddress,
    deliveryCoordinates: data.deliveryCoordinates,
    sellingPointId: sellingPoint.id,
    sellingPointName: sellingPoint.name,
    employeeId: employee.id,
    employeeName: employee.fullName,
    shiftSessionId: activeShift?.id,
    items: orderItems,
    subtotal,
    deliveryCharges,
    discount,
    grandTotal,
    costOfGoodsSold: totalCostOfGoodsSold,
    grossProfit,
    paymentMethod: data.paymentMethod,
    paymentStatus: 'paid',
    whatsappNotificationStatus: 'pending',
    completionTime: now.toISOString(),
    notes: data.notes
  };

  state.orders.unshift(newOrder);

  // Deduct inventory in ledger
  orderItems.forEach(item => {
    state.inventoryLedger.push({
      id: `ledg_sale_${Date.now()}_${item.productId}`,
      timestamp: now.toISOString(),
      businessDate,
      productId: item.productId,
      productName: item.productName,
      movementType: "sale",
      quantity: -item.quantity,
      unitCost: item.unitCost,
      totalCost: item.unitCost * item.quantity,
      sourceLocation: "employee_cold_box",
      destinationLocation: "customer",
      responsibleEmployeeId: employee.id,
      responsibleEmployeeName: employee.fullName,
      shiftSessionId: activeShift?.id,
      sellingPointId: sellingPoint.id,
      orderId: newOrder.id,
      reason: `Sold in order ${orderNumber}`,
      authorizedBy: employee.fullName
    });
  });

  // Update active shift session financial totals
  if (activeShift) {
    activeShift.totalOrders += 1;
    activeShift.shawarmasSold += totalShawarmas;
    activeShift.drinksSold += totalDrinks;
    activeShift.grossSales += subtotal;
    activeShift.discounts += discount;
    activeShift.netSales += (subtotal - discount);
    activeShift.costOfGoodsSold += totalCostOfGoodsSold;
    activeShift.grossProfit += grossProfit;

    if (data.paymentMethod === 'cash') {
      activeShift.cashSales += grandTotal;
      activeShift.expectedCashInHand += grandTotal;
    } else if (data.paymentMethod === 'jazzcash') {
      activeShift.jazzCashSales += grandTotal;
    } else if (data.paymentMethod === 'easypaisa') {
      activeShift.easyPaisaSales += grandTotal;
    } else {
      activeShift.otherDigitalSales += grandTotal;
    }
  }

  // Update or create CRM Customer
  const existingCust = state.customers.find(c => c.mobile === cleanMobile);
  if (existingCust) {
    existingCust.totalOrders += 1;
    existingCust.lifetimeSpend += grandTotal;
    existingCust.lastOrderDate = businessDate;
    existingCust.preferredSellingPointId = sellingPoint.id;
  } else {
    state.customers.push({
      id: `cust_${Date.now()}`,
      name: newOrder.customerName,
      mobile: cleanMobile,
      firstOrderDate: businessDate,
      lastOrderDate: businessDate,
      totalOrders: 1,
      lifetimeSpend: grandTotal,
      preferredSellingPointId: sellingPoint.id,
      notes: "Customer registered from order"
    });
  }

  // Log WhatsApp notification record
  state.whatsappLogs.unshift({
    id: `wa_${Date.now()}`,
    messageType: "order_confirmed",
    customerName: newOrder.customerName,
    customerMobile: cleanMobile,
    orderNumber,
    messageBody: `Assalam-o-Alaikum ${newOrder.customerName}! Thank you for choosing SHREBIAN SHAWARMA. Your order #${orderNumber} for Rs. ${grandTotal} is confirmed. Fresh food prepared with love!`,
    status: "sent",
    sentAt: now.toISOString(),
    providerResponse: "Simulated official WhatsApp Business API response: OK"
  });
  newOrder.whatsappNotificationStatus = 'sent';

  saveDatabase(state);
  return { success: true, order: newOrder };
}

// Settlements
export function submitEmployeeSettlement(
  shiftSessionId: string,
  data: {
    amountTransferred: number;
    service: 'JazzCash' | 'Easypaisa';
    transactionId: string;
    proofUrl?: string;
    notes?: string;
  }
): ShiftSession | null {
  const state = loadDatabase();
  const session = state.shiftSessions.find(s => s.id === shiftSessionId);
  if (!session) return null;

  session.settlementStatus = 'submitted';
  session.cashSubmitted = data.amountTransferred;
  session.remainingBalance = Math.max(0, session.expectedCashInHand - data.amountTransferred);
  session.settlementDetails = {
    amountTransferred: data.amountTransferred,
    service: data.service,
    targetNumber: "03120073794",
    transactionId: data.transactionId,
    transferTime: new Date().toISOString(),
    proofUrl: data.proofUrl,
    notes: data.notes
  };

  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: session.employeeId,
    userName: session.employeeName,
    action: "SUBMIT_SETTLEMENT",
    entityType: "SETTLEMENT",
    entityId: session.id,
    newValue: `Rs. ${data.amountTransferred} via ${data.service} TxID: ${data.transactionId}`
  });

  saveDatabase(state);
  return session;
}

export function verifyEmployeeSettlement(
  shiftSessionId: string,
  decision: 'verified' | 'rejected' | 'partially_settled',
  notes?: string,
  adminUser: string = 'Kaleem Durrani'
): ShiftSession | null {
  const state = loadDatabase();
  const session = state.shiftSessions.find(s => s.id === shiftSessionId);
  if (!session) return null;

  session.settlementStatus = decision;
  if (session.settlementDetails) {
    session.settlementDetails.verifiedBy = adminUser;
    session.settlementDetails.verifiedAt = new Date().toISOString();
    if (notes) {
      session.settlementDetails.notes = `${session.settlementDetails.notes || ''} | ${notes}`;
    }
  }

  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: "usr_kaleem",
    userName: adminUser,
    action: "VERIFY_SETTLEMENT",
    entityType: "SETTLEMENT",
    entityId: session.id,
    newValue: decision.toUpperCase(),
    reason: notes
  });

  saveDatabase(state);
  return session;
}

// Purchases & Expenses
export function recordPurchase(data: Omit<PurchaseRecord, 'id' | 'purchaseId'>): PurchaseRecord {
  const state = loadDatabase();
  const now = new Date();
  const purchaseId = `PUR-${getPKTDate(now).replace(/-/g, '')}-${state.purchases.length + 1}`;
  const record: PurchaseRecord = {
    ...data,
    id: `pur_${Date.now()}`,
    purchaseId
  };

  state.purchases.unshift(record);

  // If purchase is Canned Drinks, increase inventory ledger
  if (record.category === 'Canned Drinks') {
    record.items.forEach(item => {
      // Find matching canned drink product
      const prod = state.products.find(p => p.category === 'canned_drink' && item.name.toLowerCase().includes(p.brand?.toLowerCase() || ''));
      if (prod) {
        state.inventoryLedger.push({
          id: `ledg_pur_${Date.now()}_${prod.id}`,
          timestamp: now.toISOString(),
          businessDate: record.purchaseDate,
          productId: prod.id,
          productName: prod.name,
          movementType: "purchase_received",
          quantity: item.quantity * 24, // Crates to cans
          unitCost: Math.round(item.unitPrice / 24),
          totalCost: item.totalPrice,
          sourceLocation: "supplier",
          destinationLocation: "central_kitchen",
          responsibleEmployeeId: "usr_kaleem",
          responsibleEmployeeName: record.enteredBy,
          reason: `Purchased from ${record.supplierName} (${purchaseId})`,
          authorizedBy: record.enteredBy
        });
      }
    });
  }

  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: now.toISOString(),
    userId: "usr_kaleem",
    userName: record.enteredBy,
    action: "RECORD_PURCHASE",
    entityType: "PURCHASE",
    entityId: record.id,
    newValue: `${record.category} - Rs. ${record.totalAmount} from ${record.supplierName}`
  });

  saveDatabase(state);
  return record;
}

export function recordExpense(data: Omit<ExpenseRecord, 'id'>): ExpenseRecord {
  const state = loadDatabase();
  const record: ExpenseRecord = {
    ...data,
    id: `exp_${Date.now()}`
  };

  state.expenses.unshift(record);
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: "usr_kaleem",
    userName: record.enteredBy,
    action: "RECORD_EXPENSE",
    entityType: "EXPENSE",
    entityId: record.id,
    newValue: `${record.category}: Rs. ${record.amount} (${record.description})`
  });

  saveDatabase(state);
  return record;
}

// ----------------- FINANCIAL REPORTING & ANALYTICS -----------------
export interface FinancialSummary {
  businessDate?: string;
  totalOrders: number;
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netOperatingProfit: number;
  totalPurchases: number;
  shawarmasSold: number;
  drinksSold: number;
  cashSales: number;
  jazzCashSales: number;
  easyPaisaSales: number;
  otherDigitalSales: number;
  expectedCashInHand: number;
  pendingSettlements: number;
}

export function getDailyFinancialReport(dateStr: string): FinancialSummary {
  const state = loadDatabase();
  const dayOrders = state.orders.filter(o => o.businessDate === dateStr && o.status === 'completed');
  const dayExpenses = state.expenses.filter(e => e.expenseDate === dateStr);
  const dayPurchases = state.purchases.filter(p => p.purchaseDate === dateStr);
  const dayShifts = state.shiftSessions.filter(s => s.businessDate === dateStr);

  const grossSales = dayOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const discounts = dayOrders.reduce((sum, o) => sum + o.discount, 0);
  const netSales = grossSales - discounts;
  const costOfGoodsSold = dayOrders.reduce((sum, o) => sum + o.costOfGoodsSold, 0);
  const grossProfit = netSales - costOfGoodsSold;
  const operatingExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = grossProfit - operatingExpenses;
  const totalPurchases = dayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  let totalShawarmas = 0;
  let totalDrinks = 0;
  let cashSales = 0;
  let jazzCashSales = 0;
  let easyPaisaSales = 0;
  let otherDigitalSales = 0;

  dayOrders.forEach(o => {
    o.items.forEach(i => {
      if (i.category === 'shawarma') totalShawarmas += i.quantity;
      if (i.category === 'canned_drink') totalDrinks += i.quantity;
    });

    if (o.paymentMethod === 'cash') cashSales += o.grandTotal;
    else if (o.paymentMethod === 'jazzcash') jazzCashSales += o.grandTotal;
    else if (o.paymentMethod === 'easypaisa') easyPaisaSales += o.grandTotal;
    else otherDigitalSales += o.grandTotal;
  });

  const pendingSettlements = dayShifts.filter(s => s.settlementStatus === 'pending' || s.settlementStatus === 'submitted').length;

  return {
    businessDate: dateStr,
    totalOrders: dayOrders.length,
    grossSales,
    discounts,
    refunds: 0,
    netSales,
    costOfGoodsSold,
    grossProfit,
    operatingExpenses,
    netOperatingProfit,
    totalPurchases,
    shawarmasSold: totalShawarmas,
    drinksSold: totalDrinks,
    cashSales,
    jazzCashSales,
    easyPaisaSales,
    otherDigitalSales,
    expectedCashInHand: cashSales,
    pendingSettlements
  };
}

export function getAllTimeAnalytics(): FinancialSummary & {
  activeEmployees: number;
  activeSellingPoints: number;
  totalCustomers: number;
  totalLeads: number;
} {
  const state = loadDatabase();
  const completedOrders = state.orders.filter(o => o.status === 'completed');
  const grossSales = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const discounts = completedOrders.reduce((sum, o) => sum + o.discount, 0);
  const netSales = grossSales - discounts;
  const costOfGoodsSold = completedOrders.reduce((sum, o) => sum + o.costOfGoodsSold, 0);
  const grossProfit = netSales - costOfGoodsSold;
  const operatingExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = grossProfit - operatingExpenses;
  const totalPurchases = state.purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  let totalShawarmas = 0;
  let totalDrinks = 0;
  let cashSales = 0;
  let jazzCashSales = 0;
  let easyPaisaSales = 0;
  let otherDigitalSales = 0;

  completedOrders.forEach(o => {
    o.items.forEach(i => {
      if (i.category === 'shawarma') totalShawarmas += i.quantity;
      if (i.category === 'canned_drink') totalDrinks += i.quantity;
    });

    if (o.paymentMethod === 'cash') cashSales += o.grandTotal;
    else if (o.paymentMethod === 'jazzcash') jazzCashSales += o.grandTotal;
    else if (o.paymentMethod === 'easypaisa') easyPaisaSales += o.grandTotal;
    else otherDigitalSales += o.grandTotal;
  });

  const activeEmployees = state.users.filter(u => u.employmentStatus === 'active' && u.kycStatus === 'verified').length;
  const activeSellingPoints = state.sellingPoints.filter(sp => sp.isActive).length;
  const pendingSettlements = state.shiftSessions.filter(s => s.settlementStatus === 'pending' || s.settlementStatus === 'submitted').length;

  return {
    totalOrders: completedOrders.length,
    grossSales,
    discounts,
    refunds: 0,
    netSales,
    costOfGoodsSold,
    grossProfit,
    operatingExpenses,
    netOperatingProfit,
    totalPurchases,
    shawarmasSold: totalShawarmas,
    drinksSold: totalDrinks,
    cashSales,
    jazzCashSales,
    easyPaisaSales,
    otherDigitalSales,
    expectedCashInHand: cashSales,
    pendingSettlements,
    activeEmployees,
    activeSellingPoints,
    totalCustomers: state.customers.length,
    totalLeads: state.leads.length
  };
}
