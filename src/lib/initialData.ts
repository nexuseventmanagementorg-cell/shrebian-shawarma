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
  SystemSettings
} from '@/types';
import { FIXED_DELIVERY_FEE } from './delivery';

export const initialSettings: SystemSettings = {
  appName: "SHREBIAN SHAWARMA",
  tagline: "HOME-MADE FOOD, MADE WITH LOVE.",
  ownerName: "Kaleem Durrani",
  ownerContact: "03120073794",
  jazzCashNumber: "03120073794",
  easyPaisaNumber: "03120073794",
  officialAddress: "Model Town, Lahore, Pakistan",
  defaultDeliveryRadiusKm: 5,
  defaultDeliveryFee: FIXED_DELIVERY_FEE,
  enableWhatsAppNotifications: true,
};

export const initialUsers: User[] = [
  {
    id: "usr_kaleem",
    fullName: "Kaleem Durrani",
    username: "kaleem",
    role: "owner",
    mobile: "03120073794",
    cnic: "35202-1234567-1",
    residentialAddress: "Model Town, Lahore",
    emergencyContact: "03008889999",
    joiningDate: "2026-10-01",
    assignedSellingPointId: "sp_model_town",
    assignedShiftId: "shift_night",
    kycStatus: "verified",
    employmentStatus: "active",
    verificationNotes: "Owner, Founder and Principal Operator",
    createdAt: "2026-10-01T00:00:00Z"
  },
  {
    id: "usr_hamza",
    fullName: "Hamza Ali",
    username: "hamza",
    role: "employee",
    mobile: "03001234567",
    cnic: "35201-7654321-3",
    residentialAddress: "Gulberg III, Lahore",
    emergencyContact: "03017654321",
    joiningDate: "2026-11-01",
    assignedSellingPointId: "sp_gulberg",
    assignedShiftId: "shift_day",
    kycStatus: "verified",
    employmentStatus: "active",
    verificationNotes: "CNIC verified, police clearance completed",
    createdAt: "2026-11-01T00:00:00Z"
  },
  {
    id: "usr_usman",
    fullName: "Usman Tariq",
    username: "usman",
    role: "employee",
    mobile: "03219876543",
    cnic: "35202-9988776-5",
    residentialAddress: "Johar Town, Lahore",
    emergencyContact: "03229988776",
    joiningDate: "2026-11-15",
    assignedSellingPointId: "sp_johar_town",
    assignedShiftId: "shift_night",
    kycStatus: "under_review",
    employmentStatus: "active",
    verificationNotes: "CNIC documents submitted, pending owner review",
    createdAt: "2026-11-15T00:00:00Z"
  }
];

export const initialProducts: Product[] = [
  {
    id: "prod_regular_shawarma",
    name: "REGULAR SHREBIAN SHAWARMA",
    category: "shawarma",
    description: "Authentic Arabic Shawarma. 100g juicy grilled chicken, 100g freshly made khameeri roti, original garlic mayo sauce, cucumber pickles, and golden fries. Lovingly wrapped in butter paper.",
    sellingPrice: 600,
    productionCost: 347,
    estimatedProfit: 253,
    isAvailable: true,
    preparationTimeMinutes: 10,
    sku: "SHR-REG-01",
    imageUrl: "/images/brand/regular-shrebian-shawarma.png",
    weightGrams: 400,
    foodWeightGrams: 350,
    packagingWeightGrams: 50,
    packagingCost: 13,
    wastageReserveCost: 17,
    recipeIngredients: [
      { name: "Khameeri Roti", quantity: "100 g", rate: "Rs. 30/kg", cost: 30 },
      { name: "Cooked Chicken", quantity: "100 g", rate: "Rs. 1,730/kg", cost: 173 },
      { name: "Garlic Mayo Sauce", quantity: "50 g", rate: "Rs. 600/kg", cost: 30 },
      { name: "French Fries (Cooked)", quantity: "80 g (~100g frozen)", rate: "Rs. 1,000/kg", cost: 100 },
      { name: "Vegetables & Pickles", quantity: "50 g", rate: "Rs. 200/kg", cost: 10 },
      { name: "Marinade & Spices", quantity: "Batch blend", rate: "Rs. 17/unit", cost: 17 },
      { name: "Frying Oil", quantity: "Portion", rate: "Rs. 7/unit", cost: 7 },
      { name: "Butter Paper + Envelope", quantity: "50 g", rate: "Custom branded", cost: 13 }
    ]
  },
  {
    id: "prod_spicy_shawarma",
    name: "SHREBIAN CHEESE SHAWARMA",
    category: "shawarma",
    description: "Juicy grilled chicken, melted cheddar cheese, Arabic garlic sauce, cucumber pickles, and golden fries wrapped in freshly toasted khameeri roti.",
    sellingPrice: 700,
    productionCost: 365,
    estimatedProfit: 335,
    isAvailable: true,
    preparationTimeMinutes: 10,
    sku: "SHR-CHE-02",
    imageUrl: "/images/brand/shrebian-cheese-shawarma.png",
    weightGrams: 400,
    foodWeightGrams: 350,
    packagingWeightGrams: 50,
    packagingCost: 13,
    wastageReserveCost: 18,
    recipeIngredients: [
      { name: "Khameeri Roti", quantity: "100 g", rate: "Rs. 30/kg", cost: 30 },
      { name: "Spicy Cooked Chicken", quantity: "100 g", rate: "Rs. 1,850/kg", cost: 185 },
      { name: "Spicy Chili Garlic Mayo", quantity: "50 g", rate: "Rs. 640/kg", cost: 32 },
      { name: "French Fries", quantity: "80 g", rate: "Rs. 1,000/kg", cost: 100 },
      { name: "Jalapeños & Pickles", quantity: "50 g", rate: "Rs. 220/kg", cost: 11 },
      { name: "Special Hot Spices", quantity: "Batch blend", rate: "Rs. 18/unit", cost: 18 },
      { name: "Frying Oil & Packaging", quantity: "Portion", rate: "Branded pack", cost: 20 }
    ]
  },
  {
    id: "prod_special_shawarma",
    name: "SPECIAL SHREBIAN SHAWARMA",
    category: "shawarma",
    description: "The ultimate gourmet experience with juicy grilled chicken, melted white cheddar, black olives, oregano, garlic sauce, cucumber pickles, and golden fries in khameeri roti.",
    sellingPrice: 800,
    productionCost: 420,
    estimatedProfit: 380,
    isAvailable: true,
    preparationTimeMinutes: 12,
    sku: "SHR-SPC-03",
    imageUrl: "/images/brand/special-shrebian-shawarma.png",
    weightGrams: 450,
    foodWeightGrams: 400,
    packagingWeightGrams: 50,
    packagingCost: 15,
    wastageReserveCost: 20,
    recipeIngredients: [
      { name: "Khameeri Roti (Large)", quantity: "110 g", rate: "Rs. 35/unit", cost: 35 },
      { name: "Cooked Chicken (Extra)", quantity: "130 g", rate: "Rs. 1,730/kg", cost: 225 },
      { name: "Gourmet Tahini Mayo Sauce", quantity: "60 g", rate: "Rs. 700/kg", cost: 42 },
      { name: "French Fries", quantity: "80 g", rate: "Rs. 1,000/kg", cost: 100 },
      { name: "Premium Pickles & Olives", quantity: "40 g", rate: "Rs. 300/kg", cost: 12 },
      { name: "Packaging & Butter Paper", quantity: "50 g", rate: "Premium Box", cost: 15 }
    ]
  },
  // Cold Drinks & Juice Cans (STRICTLY CANS ONLY, NO GLASS BOTTLES)
  {
    id: "prod_drink_coke",
    name: "Coca-Cola (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Coca-Cola 250ml aluminum can. Refreshing taste served straight from employee cold box.",
    sellingPrice: 170,
    productionCost: 70,
    estimatedProfit: 100,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-COKE",
    imageUrl: "/images/drinks/coca-cola-shrebian-promo.png",
    canSize: "250ml",
    brand: "Coca-Cola"
  },
  {
    id: "prod_drink_pepsi",
    name: "Pepsi (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Pepsi 250ml aluminum can. Classic cola taste served cold.",
    sellingPrice: 160,
    productionCost: 70,
    estimatedProfit: 90,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-PEPSI",
    imageUrl: "/images/drinks/pepsi-shrebian-promo.png",
    canSize: "250ml",
    brand: "Pepsi"
  },
  {
    id: "prod_drink_7up",
    name: "7UP (Can 250ml)",
    category: "canned_drink",
    description: "Chilled 7UP 250ml lemon-lime can. Clear, crisp, refreshing.",
    sellingPrice: 160,
    productionCost: 70,
    estimatedProfit: 90,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-7UP",
    imageUrl: "/images/drinks/7up-shrebian-promo.png",
    canSize: "250ml",
    brand: "7UP"
  },
  {
    id: "prod_drink_sprite",
    name: "Sprite (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Sprite 250ml aluminum can. Bursting with citrus refreshment.",
    sellingPrice: 170,
    productionCost: 70,
    estimatedProfit: 100,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-SPRITE",
    imageUrl: "/images/drinks/sprite-shrebian-promo.png",
    canSize: "250ml",
    brand: "Sprite"
  },
  {
    id: "prod_drink_sting",
    name: "Sting Berry Blast (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Sting Berry Blast 250ml can. Energizing berry punch.",
    sellingPrice: 180,
    productionCost: 85,
    estimatedProfit: 95,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-STING",
    imageUrl: "/images/drinks/sting-shrebian-promo.png",
    canSize: "250ml",
    brand: "Sting"
  },
  {
    id: "prod_drink_rani",
    name: "Rani Float Pineapple (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Rani Float Pineapple 250ml can with real fruit flavor.",
    sellingPrice: 280,
    productionCost: 115,
    estimatedProfit: 165,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-RANI",
    imageUrl: "/images/drinks/rani-pineapple-shrebian-promo.png",
    canSize: "250ml",
    brand: "Rani"
  },
  {
    id: "prod_drink_mirinda",
    name: "Mirinda Orange (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Mirinda Orange 250ml aluminum can. Vibrant citrus flavor.",
    sellingPrice: 180,
    productionCost: 70,
    estimatedProfit: 110,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-MIRINDA",
    imageUrl: "/images/drinks/mirinda-shrebian-promo.png",
    canSize: "250ml",
    brand: "Mirinda"
  },
  {
    id: "prod_drink_fanta",
    name: "Fanta Orange (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Fanta 250ml aluminum can. Fruity sparkle.",
    sellingPrice: 160,
    productionCost: 70,
    estimatedProfit: 90,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-FANTA",
    imageUrl: "/images/drinks/fanta-orange-shrebian-promo.png",
    canSize: "250ml",
    brand: "Fanta"
  },
  {
    id: "prod_drink_apricot",
    name: "Rani Float Orange (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Rani Float Orange 250ml can with real fruit pieces and refreshing orange flavor.",
    sellingPrice: 180,
    productionCost: 115,
    estimatedProfit: 65,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-RANI-ORANGE",
    imageUrl: "/images/drinks/rani-orange-shrebian-promo.png",
    canSize: "250ml",
    brand: "Rani"
  },
  {
    id: "prod_drink_mixed",
    name: "Rani Mix Fruit (Can 250ml)",
    category: "canned_drink",
    description: "Chilled Rani Mix Fruit 250ml can. A refreshing tropical blend of mixed fruit flavors.",
    sellingPrice: 180,
    productionCost: 115,
    estimatedProfit: 65,
    isAvailable: true,
    preparationTimeMinutes: 1,
    sku: "DRK-CAN-MIXED",
    imageUrl: "/images/drinks/rani-mix-fruit-shrebian-promo.png",
    canSize: "250ml",
    brand: "International Nectar"
  }
];

export const initialSellingPoints: SellingPoint[] = [
  {
    id: "sp_model_town",
    name: "Model Town Selling Point",
    area: "Model Town C-Block Market, Lahore",
    address: "Stall #1, Main Commercial Market, C-Block, Model Town, Lahore",
    latitude: 31.4828,
    longitude: 74.3182,
    deliveryRadiusKm: 5,
    assignedEmployeeId: "usr_kaleem",
    assignedEmployeeName: "Kaleem Durrani",
    currentShiftId: "shift_night",
    isActive: true,
    operatingHours: "10:00 PM – 03:00 AM (Night Shift)",
    estimatedPrepTime: "10-15 mins",
    takeawayAvailable: true,
    deliveryAvailable: true
  },
  {
    id: "sp_gulberg",
    name: "Gulberg Selling Point",
    area: "Main Market Gulberg II, Lahore",
    address: "Near Pace & Main Market Fountain, Gulberg II, Lahore",
    latitude: 31.5102,
    longitude: 74.3441,
    deliveryRadiusKm: 5,
    assignedEmployeeId: "usr_hamza",
    assignedEmployeeName: "Hamza Ali",
    currentShiftId: "shift_day",
    isActive: true,
    operatingHours: "12:00 PM – 05:00 PM (Day Shift)",
    estimatedPrepTime: "10-15 mins",
    takeawayAvailable: true,
    deliveryAvailable: true
  },
  {
    id: "sp_dha",
    name: "DHA Phase 5 Selling Point",
    area: "DHA Phase 5 Commercial CCA, Lahore",
    address: "Sector CCA, Phase 5, DHA, Lahore",
    latitude: 31.4721,
    longitude: 74.3792,
    deliveryRadiusKm: 5,
    isActive: false,
    operatingHours: "10:00 PM – 03:00 AM",
    estimatedPrepTime: "15 mins",
    takeawayAvailable: true,
    deliveryAvailable: true
  },
  {
    id: "sp_johar_town",
    name: "Johar Town Selling Point",
    area: "G-1 Market Johar Town, Lahore",
    address: "Opposite Doctors Hospital, G-1 Market, Johar Town, Lahore",
    latitude: 31.4697,
    longitude: 74.2728,
    deliveryRadiusKm: 5,
    assignedEmployeeId: "usr_usman",
    assignedEmployeeName: "Usman Tariq",
    isActive: false,
    operatingHours: "10:00 PM – 03:00 AM",
    estimatedPrepTime: "15 mins",
    takeawayAvailable: true,
    deliveryAvailable: false
  }
];

export const initialShiftSchedules: ShiftSchedule[] = [
  {
    id: "shift_night",
    name: "Regular Night Shift",
    defaultStartTime: "22:00",
    defaultEndTime: "03:00",
    isOvernight: true,
    status: "active",
    description: "Primary evening/night selling operation (10:00 PM to 3:00 AM PKT). Operated by Kaleem Durrani."
  },
  {
    id: "shift_day",
    name: "Planned Day Shift",
    defaultStartTime: "12:00",
    defaultEndTime: "17:00",
    isOvernight: false,
    status: "active",
    description: "Daytime peak-hour selling operation (12:00 PM to 5:00 PM PKT). Owner-activated."
  }
];

export const initialShiftSessions: ShiftSession[] = [
  {
    id: "sess_night_20261121_01",
    shiftScheduleId: "shift_night",
    shiftName: "Regular Night Shift",
    businessDate: "2026-11-21",
    employeeId: "usr_kaleem",
    employeeName: "Kaleem Durrani",
    sellingPointId: "sp_model_town",
    sellingPointName: "Model Town Selling Point",
    scheduledStartTime: "22:00",
    scheduledEndTime: "03:00",
    actualStartTime: "2026-11-21T22:00:00+05:00",
    status: "active",
    openingGps: { lat: 31.4828, lng: 74.3182, timestamp: "2026-11-21T22:00:00+05:00" },
    openingInventory: [
      { productId: "prod_regular_shawarma", productName: "REGULAR SHREBIAN SHAWARMA", quantity: 50 },
      { productId: "prod_spicy_shawarma", productName: "SPICY SHREBIAN SHAWARMA", quantity: 30 },
      { productId: "prod_special_shawarma", productName: "SPECIAL SHREBIAN SHAWARMA", quantity: 20 },
      { productId: "prod_drink_coke", productName: "Coca-Cola (Can 250ml)", quantity: 12 },
      { productId: "prod_drink_pepsi", productName: "Pepsi (Can 250ml)", quantity: 8 },
      { productId: "prod_drink_sting", productName: "Sting Berry Blast (Can 250ml)", quantity: 6 },
      { productId: "prod_drink_rani", productName: "Rani Float Juice (Can 240ml)", quantity: 4 }
    ],
    closingInventory: [],
    totalOrders: 3,
    shawarmasSold: 5,
    drinksSold: 4,
    grossSales: 3520,
    discounts: 0,
    refunds: 0,
    netSales: 3520,
    costOfGoodsSold: 2035,
    grossProfit: 1485,
    cashSales: 2120,
    jazzCashSales: 1400,
    easyPaisaSales: 0,
    otherDigitalSales: 0,
    expectedCashInHand: 2120,
    settlementStatus: "pending"
  }
];

export const initialProductionBatches: ProductionBatch[] = [
  {
    id: "batch_20261121_01",
    batchNumber: "PB-20261121-01",
    productionDate: "2026-11-21",
    preparationTime: "18:30 PKT",
    productId: "prod_regular_shawarma",
    productName: "REGULAR SHREBIAN SHAWARMA",
    quantityPrepared: 50,
    pouchBagSlots: 50, // 5 rows x 10 columns insulated bag
    ingredientsCost: 15850,
    packagingCost: 650,
    wastageReserveCost: 850,
    totalBatchCost: 17350,
    unitProductionCost: 347,
    preparedBy: "Kaleem Durrani",
    freshnessWindowHours: 8,
    status: "fresh",
    notes: "Home-made fresh batch for night shift at Model Town stall. Loaded in 50-slot thermal bag."
  }
];

export const initialInventoryLedger: InventoryLedgerEntry[] = [
  {
    id: "ledg_001",
    timestamp: "2026-11-21T19:00:00+05:00",
    businessDate: "2026-11-21",
    productId: "prod_regular_shawarma",
    productName: "REGULAR SHREBIAN SHAWARMA",
    movementType: "production_received",
    quantity: 50,
    unitCost: 347,
    totalCost: 17350,
    sourceLocation: "central_kitchen",
    destinationLocation: "central_kitchen",
    responsibleEmployeeId: "usr_kaleem",
    responsibleEmployeeName: "Kaleem Durrani",
    reason: "Fresh batch preparation for 50-pouch thermal bag",
    authorizedBy: "Kaleem Durrani"
  },
  {
    id: "ledg_002",
    timestamp: "2026-11-21T21:30:00+05:00",
    businessDate: "2026-11-21",
    productId: "prod_regular_shawarma",
    productName: "REGULAR SHREBIAN SHAWARMA",
    movementType: "employee_issuance",
    quantity: 50,
    unitCost: 347,
    totalCost: 17350,
    sourceLocation: "central_kitchen",
    destinationLocation: "selling_point",
    responsibleEmployeeId: "usr_kaleem",
    responsibleEmployeeName: "Kaleem Durrani",
    shiftSessionId: "sess_night_20261121_01",
    sellingPointId: "sp_model_town",
    reason: "Dispatched to Model Town A-Stand selling point",
    authorizedBy: "Kaleem Durrani"
  },
  {
    id: "ledg_003",
    timestamp: "2026-11-21T21:30:00+05:00",
    businessDate: "2026-11-21",
    productId: "prod_drink_coke",
    productName: "Coca-Cola (Can 250ml)",
    movementType: "employee_issuance",
    quantity: 12,
    unitCost: 70,
    totalCost: 840,
    sourceLocation: "central_kitchen",
    destinationLocation: "employee_cold_box",
    responsibleEmployeeId: "usr_kaleem",
    responsibleEmployeeName: "Kaleem Durrani",
    shiftSessionId: "sess_night_20261121_01",
    sellingPointId: "sp_model_town",
    reason: "Loaded in cold box for Model Town shift",
    authorizedBy: "Kaleem Durrani"
  }
];

export const initialOrders: Order[] = [
  {
    id: "ord_1001",
    orderNumber: "SHR-000101",
    businessDate: "2026-11-21",
    createdAt: "2026-11-21T22:30:00+05:00",
    channel: "website",
    orderType: "delivery",
    status: "completed",
    customerName: "Ahmed Farooq",
    customerMobile: "03004567890",
    deliveryAddress: "House 42, Block B, Model Town, Lahore",
    deliveryCoordinates: { lat: 31.485, lng: 74.321 },
    sellingPointId: "sp_model_town",
    sellingPointName: "Model Town Selling Point",
    employeeId: "usr_kaleem",
    employeeName: "Kaleem Durrani",
    shiftSessionId: "sess_night_20261121_01",
    items: [
      {
        productId: "prod_regular_shawarma",
        productName: "REGULAR SHREBIAN SHAWARMA",
        category: "shawarma",
        unitPrice: 600,
        unitCost: 347,
        quantity: 2,
        subtotal: 1200,
        instructions: "Extra garlic mayo please"
      },
      {
        productId: "prod_drink_coke",
        productName: "Coca-Cola (Can 250ml)",
        category: "canned_drink",
        unitPrice: 100,
        unitCost: 70,
        quantity: 1,
        subtotal: 100
      }
    ],
    subtotal: 1300,
    deliveryCharges: 100,
    discount: 0,
    grandTotal: 1400,
    costOfGoodsSold: 764,
    grossProfit: 636,
    paymentMethod: "jazzcash",
    paymentStatus: "paid",
    paymentTransactionId: "JC-987654321",
    whatsappNotificationStatus: "sent",
    completionTime: "2026-11-21T22:50:00+05:00",
    notes: "Hot delivery confirmed by customer"
  },
  {
    id: "ord_1002",
    orderNumber: "SHR-000102",
    businessDate: "2026-11-21",
    createdAt: "2026-11-21T23:15:00+05:00",
    channel: "pos",
    orderType: "takeaway",
    status: "completed",
    customerName: "Bilal Sheikh",
    customerMobile: "03215556677",
    sellingPointId: "sp_model_town",
    sellingPointName: "Model Town Selling Point",
    employeeId: "usr_kaleem",
    employeeName: "Kaleem Durrani",
    shiftSessionId: "sess_night_20261121_01",
    items: [
      {
        productId: "prod_spicy_shawarma",
        productName: "SPICY SHREBIAN SHAWARMA",
        category: "shawarma",
        unitPrice: 650,
        unitCost: 365,
        quantity: 2,
        subtotal: 1300
      },
      {
        productId: "prod_drink_sting",
        productName: "Sting Berry Blast (Can 250ml)",
        category: "canned_drink",
        unitPrice: 120,
        unitCost: 85,
        quantity: 2,
        subtotal: 240
      }
    ],
    subtotal: 1540,
    deliveryCharges: 0,
    discount: 0,
    grandTotal: 1540,
    costOfGoodsSold: 900,
    grossProfit: 640,
    paymentMethod: "cash",
    paymentStatus: "paid",
    whatsappNotificationStatus: "sent",
    completionTime: "2026-11-21T23:25:00+05:00",
    notes: "Walk-in customer at A-Stand stall"
  },
  {
    id: "ord_1003",
    orderNumber: "SHR-000103",
    businessDate: "2026-11-21",
    createdAt: "2026-11-21T23:45:00+05:00",
    channel: "pos",
    orderType: "takeaway",
    status: "completed",
    customerName: "Zainab Malik",
    customerMobile: "03334445566",
    sellingPointId: "sp_model_town",
    sellingPointName: "Model Town Selling Point",
    employeeId: "usr_kaleem",
    employeeName: "Kaleem Durrani",
    shiftSessionId: "sess_night_20261121_01",
    items: [
      {
        productId: "prod_regular_shawarma",
        productName: "REGULAR SHREBIAN SHAWARMA",
        category: "shawarma",
        unitPrice: 600,
        unitCost: 347,
        quantity: 1,
        subtotal: 600
      },
      {
        productId: "prod_drink_pepsi",
        productName: "Pepsi (Can 250ml)",
        category: "canned_drink",
        unitPrice: 100,
        unitCost: 70,
        quantity: 1,
        subtotal: 100
      }
    ],
    subtotal: 700,
    deliveryCharges: 0,
    discount: 120,
    grandTotal: 580,
    costOfGoodsSold: 417,
    grossProfit: 163,
    paymentMethod: "cash",
    paymentStatus: "paid",
    whatsappNotificationStatus: "sent",
    completionTime: "2026-11-21T23:55:00+05:00",
    notes: "Neighborhood inaugural discount"
  }
];

export const initialPurchases: PurchaseRecord[] = [
  {
    id: "pur_001",
    purchaseId: "PUR-20261121-01",
    purchaseDate: "2026-11-21",
    purchaseTime: "14:00 PKT",
    supplierName: "Al-Rehman Poultry & Meat",
    supplierContact: "03005551234",
    category: "Chicken",
    items: [
      { name: "Fresh Boneless Chicken Breast", quantity: 15, unit: "kg", unitPrice: 850, totalPrice: 12750 }
    ],
    totalAmount: 12750,
    paymentMethod: "cash",
    paymentStatus: "paid",
    notes: "Grade-A fresh chicken for shawarma skewer preparation",
    enteredBy: "Kaleem Durrani"
  },
  {
    id: "pur_002",
    purchaseId: "PUR-20261121-02",
    purchaseDate: "2026-11-21",
    purchaseTime: "15:30 PKT",
    supplierName: "Lahore Beverages Wholesalers",
    supplierContact: "03214447890",
    category: "Canned Drinks",
    items: [
      { name: "Coca-Cola 250ml Cans (Pack of 24)", quantity: 2, unit: "crate", unitPrice: 1680, totalPrice: 3360 },
      { name: "Pepsi 250ml Cans (Pack of 24)", quantity: 1, unit: "crate", unitPrice: 1680, totalPrice: 1680 },
      { name: "Sting Berry 250ml Cans (Pack of 24)", quantity: 1, unit: "crate", unitPrice: 2040, totalPrice: 2040 },
      { name: "Rani Float Juice Cans (Pack of 24)", quantity: 1, unit: "crate", unitPrice: 2760, totalPrice: 2760 }
    ],
    totalAmount: 9840,
    paymentMethod: "easypaisa",
    paymentStatus: "paid",
    notes: "Pure aluminum cans only. Zero glass bottles.",
    enteredBy: "Kaleem Durrani"
  }
];

export const initialExpenses: ExpenseRecord[] = [
  {
    id: "exp_001",
    expenseDate: "2026-11-21",
    category: "Fuel",
    description: "Bike petrol for A-Stand stall transport & night deliveries",
    amount: 600,
    paymentMethod: "cash",
    shiftSessionId: "sess_night_20261121_01",
    sellingPointId: "sp_model_town",
    enteredBy: "Kaleem Durrani"
  },
  {
    id: "exp_002",
    expenseDate: "2026-11-21",
    category: "Marketing",
    description: "A-Stand LED lighting batteries and display maintenance",
    amount: 450,
    paymentMethod: "cash",
    enteredBy: "Kaleem Durrani"
  }
];

export const initialCustomers: Customer[] = [
  {
    id: "cust_001",
    name: "Ahmed Farooq",
    mobile: "03004567890",
    firstOrderDate: "2026-11-21",
    lastOrderDate: "2026-11-21",
    totalOrders: 1,
    lifetimeSpend: 1400,
    preferredSellingPointId: "sp_model_town",
    notes: "VIP customer in Model Town. Loves extra garlic mayo sauce."
  },
  {
    id: "cust_002",
    name: "Bilal Sheikh",
    mobile: "03215556677",
    firstOrderDate: "2026-11-21",
    lastOrderDate: "2026-11-21",
    totalOrders: 1,
    lifetimeSpend: 1540,
    preferredSellingPointId: "sp_model_town",
    notes: "Walk-in regular, prefers spicy shawarma and cold sting."
  },
  {
    id: "cust_003",
    name: "Zainab Malik",
    mobile: "03334445566",
    firstOrderDate: "2026-11-21",
    lastOrderDate: "2026-11-21",
    totalOrders: 1,
    lifetimeSpend: 580,
    preferredSellingPointId: "sp_model_town",
    notes: "Appreciated the fresh home-made taste."
  }
];

export const initialLeads: Lead[] = [
  {
    id: "lead_001",
    name: "Dr. Farhan Qureshi",
    mobile: "03009988112",
    location: "Gulberg III, Lahore",
    source: "Word of Mouth / Instagram",
    dateAdded: "2026-11-20",
    interestedProduct: "Special Shrebian Shawarma catering for hospital department",
    followUpDate: "2026-11-24",
    status: "interested",
    notes: "Inquired about 25 Shawarmas for night staff party."
  },
  {
    id: "lead_002",
    name: "Saad Riaz",
    mobile: "03223344556",
    location: "DHA Phase 5, Lahore",
    source: "Flyer / A-Stand View",
    dateAdded: "2026-11-21",
    interestedProduct: "Regular Shawarma delivery to DHA",
    followUpDate: "2026-11-23",
    status: "contacted",
    notes: "Interested once DHA selling point opens officially."
  }
];
