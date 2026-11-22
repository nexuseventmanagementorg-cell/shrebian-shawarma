# SHREBIAN SHAWARMA
## Futuristic Food Ordering, POS & Business Management Ecosystem

**Brand Concept:** HOME-MADE FOOD, MADE WITH LOVE.  
**Business Owner / Founder:** Kaleem Durrani  
**Official Business Contact / JazzCash / Easypaisa:** 03120073794  
**Headquarters / Initial Location:** Lahore, Pakistan  
**Expansion Capacity:** Starts with 1 owner-operator; architected for 50+ employees / business partners across Lahore.

---

## 🌯 1. Brand & Product Specifications

### Initial Shawarma Launch
1. **REGULAR SHREBIAN SHAWARMA**
   - Selling Price: **Rs. 600**
   - Planning / Production Cost: **Rs. 347**
   - Direct Profit: **Rs. 253**
   - Total Packed Weight: **400g** (350g food + 50g packaging)
   - Ingredients: Khameeri Roti 100g (Rs. 30), Cooked Chicken 100g (Rs. 173), Garlic Mayo Sauce 50g (Rs. 30), French Fries 80g (Rs. 100), Pickles 50g (Rs. 10), Spices (Rs. 17), Frying Oil (Rs. 7), Butter Paper + Envelope (Rs. 13), 5% Wastage Reserve (Rs. 17).
2. **SPICY SHREBIAN SHAWARMA**
   - Selling Price: **Rs. 650** | Cost: **Rs. 365** | Profit: **Rs. 285** | 400g
3. **SPECIAL SHREBIAN SHAWARMA**
   - Selling Price: **Rs. 750** | Cost: **Rs. 420** | Profit: **Rs. 330** | 450g

### Cold Drinks & Juice Cans (Strictly Cans Only — Absolutely NO Glass)
- Coca-Cola, Pepsi, 7UP, Sprite, Sting Berry Blast, Rani Float Juice, Mirinda, Fanta, Apricot Juice, Pineapple Juice, Mixed Fruit Juice.
- Kept in employee-assigned cold boxes.

---

## 🚀 2. System Architecture & Features

1. **Customer Ordering Website (`/`)**:
   - Modern, mobile-first dark food-tech interface.
   - Live availability check for Lahore selling points.
   - Strict 5 KM delivery radius calculation from active selling points.
   - Mandatory customer full name and mobile number.
2. **Individual Employee POS Terminal (`/pos`)**:
   - Fast touch order-taking for shawarma and canned drinks.
   - Mandatory customer name & phone before bill finalization.
   - Instant 58mm and 80mm thermal receipt generator.
   - Offline-ready with local storage caching and automatic sync.
3. **Master Owner Admin Dashboard (`/admin`)**:
   - Super Administrator: Kaleem Durrani.
   - Real-time KPI cards (Gross Sales, Net Sales, COGS, Gross Profit, Expenses, Net Profit).
   - Multi-shift management (Night: 10 PM - 3 AM, Day: 12 PM - 5 PM, Custom).
   - Day-to-Night inventory carry-forward without duplicate stock creation.
   - Employee KYC verification (Pending, Under Review, Verified, Rejected).
   - Cash settlement ledger with owner verification for 03120073794.
   - Customer CRM & prospective leads management.
   - Full audit trail logging for all sensitive actions.

---

## 🛠️ 3. Development & Execution Commands

```bash
# Start development server
npm.cmd run dev

# Run full critical logic test suite (6/6 tests pass)
npm.cmd test

# Build production bundle
npm.cmd run build

# Start production server
npm.cmd start
```

---

## 🔒 4. Key Business Rules Enforced

1. **Mandatory Customer Details:** Every finalized order requires customer name and verified mobile number.
2. **Zero Artificial Inventory Duplication:** Carrying forward 12 cans from day to night shift retains company inventory at 12 cans.
3. **No Unverified Screenshot Settlements:** Submitted screenshots remain pending until owner Kaleem Durrani confirms payment receipt.
4. **All Rupee Calculations Traceable:** Gross Sales, Net Sales, COGS, and Operating Expenses are recorded with full audit trails.
