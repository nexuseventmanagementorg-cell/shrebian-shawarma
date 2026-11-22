import test from 'node:test';
import assert from 'node:assert/strict';

// Helper: Haversine distance
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 100) / 100;
}

test('Test A: Single Owner Workflow — Kaleem Durrani', () => {
  const owner = {
    name: 'Kaleem Durrani',
    role: 'owner',
    contact: '03120073794',
    point: 'Model Town Selling Point'
  };

  const productionBatch = {
    product: 'REGULAR SHREBIAN SHAWARMA',
    quantity: 50, // 50-pouch thermal bag
    unitSellingPrice: 600,
    unitCost: 347,
    unitProfit: 253
  };

  assert.equal(productionBatch.unitSellingPrice - productionBatch.unitCost, 253);
  assert.equal(productionBatch.quantity * productionBatch.unitCost, 17350);
});

test('Test B: Day & Night Inventory Carry-Forward — Zero Artificial Duplication', () => {
  // Day shift
  let totalCompanyStock = 20; // 20 cans of Coca-Cola in inventory
  let dayShiftOpening = 20;
  let dayShiftSold = 8;
  let dayShiftClosing = dayShiftOpening - dayShiftSold; // 12
  totalCompanyStock -= dayShiftSold; // 12 remaining

  assert.equal(dayShiftClosing, 12);
  assert.equal(totalCompanyStock, 12);

  // Transfer 12 cans from Day to Night shift
  let transferredToNight = dayShiftClosing;
  let nightShiftOpening = transferredToNight;

  // Crucial test: Does total inventory increase? NO!
  assert.equal(nightShiftOpening, 12);
  assert.equal(totalCompanyStock, 12); // Must NOT become 24!

  // Night shift sells 5 cans
  let nightShiftSold = 5;
  let nightShiftClosing = nightShiftOpening - nightShiftSold; // 7
  totalCompanyStock -= nightShiftSold;

  assert.equal(nightShiftClosing, 7);
  assert.equal(totalCompanyStock, 7); // Exactly 7 cans, not 19 or 24!
});

test('Test C: Employee Expansion & KYC Isolation', () => {
  const employee1 = {
    id: 'usr_kaleem',
    name: 'Kaleem Durrani',
    role: 'owner',
    kycStatus: 'verified'
  };

  const employee2 = {
    id: 'usr_hamza',
    name: 'Hamza Ali',
    role: 'employee',
    kycStatus: 'verified'
  };

  const employee3 = {
    id: 'usr_usman',
    name: 'Usman Tariq',
    role: 'employee',
    kycStatus: 'under_review'
  };

  // Only verified employees can operate POS
  const canOperatePOS = (emp) => emp.kycStatus === 'verified';
  assert.equal(canOperatePOS(employee1), true);
  assert.equal(canOperatePOS(employee2), true);
  assert.equal(canOperatePOS(employee3), false);

  // Financial record isolation
  const canAccessFinancials = (requestor, targetEmployeeId) => {
    if (requestor.role === 'owner') return true;
    return requestor.id === targetEmployeeId;
  };

  assert.equal(canAccessFinancials(employee1, employee2.id), true); // Owner can see Hamza's records
  assert.equal(canAccessFinancials(employee2, employee1.id), false); // Hamza CANNOT see owner's records
  assert.equal(canAccessFinancials(employee2, employee3.id), false); // Hamza CANNOT see Usman's records
  assert.equal(canAccessFinancials(employee2, employee2.id), true); // Hamza can see his own records
});

test('Test D: Mandatory Customer Name and Mobile for Billing', () => {
  const validateOrder = (customerName, customerMobile) => {
    if (!customerName || !customerName.trim()) return false;
    const clean = customerMobile.replace(/\D/g, '');
    if (!clean || clean.length < 10) return false;
    return true;
  };

  assert.equal(validateOrder('', '03001234567'), false);
  assert.equal(validateOrder('Ahmed', ''), false);
  assert.equal(validateOrder('Ahmed', '123'), false);
  assert.equal(validateOrder('Ahmed Farooq', '03001234567'), true);
});

test('Test E: Financial Calculation Accuracy Formulas', () => {
  const item1 = { price: 600, cost: 347, qty: 2 }; // subtotal: 1200, cogs: 694
  const item2 = { price: 100, cost: 70, qty: 1 };  // subtotal: 100, cogs: 70
  const discount = 100;
  const delivery = 100;
  const operatingExpenses = 250;

  const grossSales = (item1.price * item1.qty) + (item2.price * item2.qty); // 1300
  const netSales = grossSales - discount; // 1200
  const cogs = (item1.cost * item1.qty) + (item2.cost * item2.qty); // 764
  const grossProfit = netSales - cogs; // 436
  const netProfit = grossProfit - operatingExpenses; // 186
  const grandTotal = netSales + delivery; // 1300

  assert.equal(grossSales, 1300);
  assert.equal(netSales, 1200);
  assert.equal(cogs, 764);
  assert.equal(grossProfit, 436);
  assert.equal(netProfit, 186);
  assert.equal(grandTotal, 1300);
});

test('Test F: 5 KM Delivery Radius Check — Lahore Locations', () => {
  // Model Town Selling Point coordinates
  const modelTownLat = 31.4828;
  const modelTownLng = 74.3182;

  // Nearby customer (Model Town Block B) ~ 0.5 km
  const nearbyDist = calculateDistanceKm(modelTownLat, modelTownLng, 31.4850, 74.3210);
  assert.ok(nearbyDist <= 5.0, `Nearby distance ${nearbyDist} should be within 5 KM`);

  // Far customer (Shahdara Lahore) ~ 17 km away
  const farDist = calculateDistanceKm(modelTownLat, modelTownLng, 31.6210, 74.2820);
  assert.ok(farDist > 5.0, `Far distance ${farDist} should be outside 5 KM radius`);
});
