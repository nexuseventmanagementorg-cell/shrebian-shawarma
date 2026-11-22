'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShieldCheck,
  MapPin,
  Clock,
  Boxes,
  CookingPot,
  Receipt,
  DollarSign,
  Calendar,
  Wallet,
  MessageSquare,
  Settings,
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Truck,
  Flame,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Eye,
  LogOut,
  ArrowRightLeft
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import {
  User,
  Product,
  SellingPoint,
  ShiftSchedule,
  ShiftSession,
  ProductionBatch,
  Order,
  PurchaseRecord,
  ExpenseRecord,
  Customer,
  Lead,
  WhatsAppLog,
  AuditLog
} from '@/types';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);

  // Database States
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [sellingPoints, setSellingPoints] = useState<SellingPoint[]>([]);
  const [shifts, setShifts] = useState<{ schedules: ShiftSchedule[]; sessions: ShiftSession[] }>({ schedules: [], sessions: [] });
  const [products, setProducts] = useState<Product[]>([]);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  const [inventorySummary, setInventorySummary] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [crmData, setCrmData] = useState<{ customers: Customer[]; leads: Lead[] }>({ customers: [], leads: [] });
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Selected date for Daily Financial Calendar
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport] = useState<any>(null);

  // Modals & form states
  const [newEmployeeModal, setNewEmployeeModal] = useState(false);
  const [employeeError, setEmployeeError] = useState('');
  const [pinManageEmployee, setPinManageEmployee] = useState<User | null>(null);
  const [pinManageValue, setPinManageValue] = useState('');
  const [pinManageError, setPinManageError] = useState('');
  const [newSellingPointModal, setNewSellingPointModal] = useState(false);
  const [newBatchModal, setNewBatchModal] = useState(false);
  const [newPurchaseModal, setNewPurchaseModal] = useState(false);
  const [newExpenseModal, setNewExpenseModal] = useState(false);
  const [newLeadModal, setNewLeadModal] = useState(false);
  const [inventoryTransferModal, setInventoryTransferModal] = useState(false);
  const [closeShiftModal, setCloseShiftModal] = useState<ShiftSession | null>(null);
  const [sellingPointError, setSellingPointError] = useState('');

  // Forms data
  const [empForm, setEmpForm] = useState({
    fullName: '',
    username: '',
    mobile: '',
    cnic: '',
    role: 'employee',
    residentialAddress: '',
    emergencyContact: '',
    pin: '',
    assignedSellingPointId: '',
    assignedShiftId: ''
  });
  const [batchForm, setBatchForm] = useState({ productId: 'prod_regular_shawarma', quantityPrepared: 50, ingredientsCost: 15850, packagingCost: 650, wastageReserveCost: 850, notes: '' });
  const [purchaseForm, setPurchaseForm] = useState({ supplierName: '', supplierContact: '', category: 'Chicken', itemName: '', quantity: 1, unit: 'kg', unitPrice: 0, paymentMethod: 'cash' });
  const [expenseForm, setExpenseForm] = useState({ category: 'Fuel', description: '', amount: 0, paymentMethod: 'cash' });
  const [leadForm, setLeadForm] = useState({ name: '', mobile: '', location: 'Lahore', source: 'Instagram / Word of Mouth', interestedProduct: 'Regular Shrebian Shawarma', followUpDate: '' });
  const [transferForm, setTransferForm] = useState({ sourceShiftId: '', targetShiftId: '', productId: 'prod_drink_coke', quantity: 12 });
  const [closeShiftForm, setCloseShiftForm] = useState({ actualCashCounted: 0, notes: '' });
  const [sellingPointForm, setSellingPointForm] = useState({
    name: '',
    area: '',
    address: '',
    imageUrl: '',
    radius: '5',
    operatingHours: '10:00 PM – 03:00 AM'
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        analyticsRes,
        ordersRes,
        empRes,
        spRes,
        shiftRes,
        prodRes,
        batchRes,
        invRes,
        purRes,
        expRes,
        settleRes,
        crmRes,
        waRes,
        auditRes,
        dayRes
      ] = await Promise.all([
        fetch('/api/reports?type=all_time').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/selling-points').then(r => r.json()),
        fetch('/api/shifts').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/production').then(r => r.json()),
        fetch('/api/inventory').then(r => r.json()),
        fetch('/api/purchases').then(r => r.json()),
        fetch('/api/expenses').then(r => r.json()),
        fetch('/api/settlements').then(r => r.json()),
        fetch('/api/crm').then(r => r.json()),
        fetch('/api/reports?type=whatsapp_logs').then(r => r.json()),
        fetch('/api/reports?type=audit_logs').then(r => r.json()),
        fetch(`/api/reports?type=daily&date=${selectedDate}`).then(r => r.json())
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (empRes.success) setEmployees(empRes.employees);
      if (spRes.success) setSellingPoints(spRes.sellingPoints);
      if (shiftRes.success) setShifts({ schedules: shiftRes.schedules, sessions: shiftRes.sessions });
      if (prodRes.success) setProducts(prodRes.products);
      if (batchRes.success) setProductionBatches(batchRes.batches);
      if (invRes.success) setInventorySummary(invRes.stockSummary);
      if (purRes.success) setPurchases(purRes.purchases);
      if (expRes.success) setExpenses(expRes.expenses);
      if (settleRes.success) setSettlements(settleRes.settlements);
      if (crmRes.success) setCrmData({ customers: crmRes.customers, leads: crmRes.leads });
      if (waRes.success) setWhatsappLogs(waRes.whatsappLogs);
      if (auditRes.success) setAuditLogs(auditRes.auditLogs);
      if (dayRes.success) setDailyReport(dayRes.report);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok) {
        window.alert('Could not sign out. Please try again.');
        return;
      }
      window.location.assign('/');
    } catch {
      window.alert('Could not connect to sign out. Please try again.');
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    fetch(`/api/reports?type=daily&date=${selectedDate}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setDailyReport(d.report);
      });
  }, [selectedDate]);

  // Handlers
  const handleUpdateKYC = async (userId: string, status: string) => {
    await fetch('/api/employees', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'kyc', userId, status, adminUser: 'Kaleem Durrani' })
    });
    loadAllData();
  };

  const handleToggleSellingPoint = async (id: string, isActive: boolean) => {
    await fetch('/api/selling-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id, isActive, adminUser: 'Kaleem Durrani' })
    });
    loadAllData();
  };

  const handleCreateSellingPoint = async (event: React.FormEvent) => {
    event.preventDefault();
    setSellingPointError('');

    try {
      const response = await fetch('/api/selling-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...sellingPointForm,
          radius: Number(sellingPointForm.radius),
          adminUser: 'Kaleem Durrani'
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setSellingPointError(result.error || 'Could not create selling point.');
        return;
      }

      setSellingPointForm({
        name: '',
        area: '',
        address: '',
        imageUrl: '',
        radius: '5',
        operatingHours: '10:00 PM – 03:00 AM'
      });
      setNewSellingPointModal(false);
      await loadAllData();
    } catch (error) {
      console.error('Failed to create selling point:', error);
      setSellingPointError('Could not connect to save the selling point. Please try again.');
    }
  };

  const handleVerifySettlement = async (shiftSessionId: string, decision: string) => {
    await fetch('/api/settlements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftSessionId, decision, adminUser: 'Kaleem Durrani' })
    });
    loadAllData();
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError('');
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empForm)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setEmployeeError(result.error || 'Could not register employee.');
        return;
      }
      setNewEmployeeModal(false);
      setEmpForm({
        fullName: '',
        username: '',
        mobile: '',
        cnic: '',
        role: 'employee',
        residentialAddress: '',
        emergencyContact: '',
        pin: '',
        assignedSellingPointId: '',
        assignedShiftId: ''
      });
      await loadAllData();
    } catch (error) {
      console.error('Failed to register employee:', error);
      setEmployeeError('Could not connect to register employee. Please try again.');
    }
  };

  const handleResetEmployeePin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pinManageEmployee) return;
    setPinManageError('');
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin_reset', userId: pinManageEmployee.id, pin: pinManageValue })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setPinManageError(result.error || 'Could not reset the employee PIN.');
        return;
      }
      setPinManageEmployee(null);
      setPinManageValue('');
      await loadAllData();
    } catch (error) {
      console.error('Failed to reset employee POS PIN:', error);
      setPinManageError('Could not connect to reset the employee PIN.');
    }
  };

  const handleDeactivateEmployee = async (employee: User) => {
    if (!window.confirm(`Deactivate ${employee.fullName}? They will lose POS access immediately.`)) return;
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deactivate', userId: employee.id })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        window.alert(result.error || 'Could not deactivate employee.');
        return;
      }
      await loadAllData();
    } catch (error) {
      console.error('Failed to deactivate employee:', error);
      window.alert('Could not connect to deactivate employee.');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchForm)
    });
    setNewBatchModal(false);
    loadAllData();
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(purchaseForm.quantity) * Number(purchaseForm.unitPrice);
    await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierName: purchaseForm.supplierName,
        supplierContact: purchaseForm.supplierContact,
        category: purchaseForm.category,
        items: [{
          name: purchaseForm.itemName,
          quantity: Number(purchaseForm.quantity),
          unit: purchaseForm.unit,
          unitPrice: Number(purchaseForm.unitPrice),
          totalPrice: total
        }],
        totalAmount: total,
        paymentMethod: purchaseForm.paymentMethod
      })
    });
    setNewPurchaseModal(false);
    loadAllData();
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseForm)
    });
    setNewExpenseModal(false);
    loadAllData();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_lead', ...leadForm })
    });
    setNewLeadModal(false);
    loadAllData();
  };

  const handleTransferInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'transfer_inventory',
        sourceShiftId: transferForm.sourceShiftId,
        targetShiftId: transferForm.targetShiftId,
        items: [{ productId: transferForm.productId, quantity: Number(transferForm.quantity) }],
        authorizedBy: 'Kaleem Durrani'
      })
    });
    setInventoryTransferModal(false);
    loadAllData();
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closeShiftModal) return;
    await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'close',
        sessionId: closeShiftModal.id,
        actualCashCounted: closeShiftForm.actualCashCounted,
        closingNotes: closeShiftForm.notes
      })
    });
    setCloseShiftModal(null);
    loadAllData();
  };

  const navigation = [
    { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: orders.length },
    { id: 'shifts', label: 'Multi-Shift Ops', icon: Clock },
    { id: 'selling_points', label: 'Lahore Points & Map', icon: MapPin },
    { id: 'employees', label: 'Employees & KYC', icon: Users, badge: employees.filter(e => e.kycStatus === 'under_review').length },
    { id: 'inventory', label: 'Inventory Carry-Forward', icon: Boxes },
    { id: 'production', label: 'Batch Production', icon: CookingPot },
    { id: 'accounting', label: 'Daily Sales Calendar', icon: Calendar },
    { id: 'settlements', label: 'Cash Settlements (03120073794)', icon: Wallet },
    { id: 'purchases', label: 'Purchases & Expenses', icon: Receipt },
    { id: 'crm', label: 'Customers & Leads', icon: MessageSquare },
    { id: 'audit', label: 'Audit Trail Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-shrebian-bg text-shrebian-text flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-shrebian-surface border-r border-shrebian-border flex flex-col justify-between shrink-0 hidden lg:flex">
        <div className="p-4 space-y-6">
          <Link href="/">
            <Logo size="sm" showTagline={false} />
          </Link>

          {/* Owner Identity Pill */}
          <div className="p-3 rounded-xl bg-shrebian-card border border-shrebian-border space-y-1">
            <div className="text-[10px] text-shrebian-muted uppercase tracking-wider">Super Administrator</div>
            <div className="font-extrabold text-xs text-white">Kaleem Durrani</div>
            <div className="text-[10px] text-shrebian-gold font-mono">03120073794 (JazzCash / Easy)</div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-shrebian-red text-white shadow-glowRed font-bold'
                      : 'text-gray-300 hover:bg-shrebian-card hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/40 text-shrebian-gold font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-shrebian-border space-y-2">
          <Link
            href="/pos"
            className="w-full py-2.5 px-3 rounded-xl bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-shrebian-gold" />
            <span>Launch POS Terminal</span>
          </Link>
          <Link
            href="/"
            className="w-full py-2 px-3 rounded-xl text-xs text-shrebian-muted hover:text-white flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-shrebian-surface/80 backdrop-blur-md border-b border-shrebian-border px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-lg text-white uppercase tracking-tight">
              {navigation.find(n => n.id === activeTab)?.label || 'Admin Control Panel'}
            </h1>
            <span className="text-xs text-shrebian-muted hidden sm:inline">
              Lahore Central Ecosystem
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="p-2 rounded-lg bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border text-gray-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/pos"
              className="px-3 py-1.5 rounded-lg bg-shrebian-red hover:bg-shrebian-red-hover text-xs font-bold text-white transition-all shadow-glowRed"
            >
              Open POS
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border text-xs font-bold text-white flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="p-6 space-y-6">
          {/* TAB: OVERVIEW & REAL-TIME KPIS */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              {/* Top Row KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-1">
                  <div className="text-[11px] text-shrebian-muted">Total Orders</div>
                  <div className="text-2xl font-black text-white">{analytics.totalOrders}</div>
                  <div className="text-[10px] text-emerald-400">100% Traceable</div>
                </div>

                <div className="p-4 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-1">
                  <div className="text-[11px] text-shrebian-muted">Gross Sales</div>
                  <div className="text-2xl font-black text-shrebian-gold">Rs. {analytics.grossSales}</div>
                  <div className="text-[10px] text-gray-400">Before deductions</div>
                </div>

                <div className="p-4 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-1">
                  <div className="text-[11px] text-shrebian-muted">Net Sales</div>
                  <div className="text-2xl font-black text-white">Rs. {analytics.netSales}</div>
                  <div className="text-[10px] text-gray-400">Net revenue</div>
                </div>

                <div className="p-4 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-1">
                  <div className="text-[11px] text-shrebian-muted">Cost of Goods (COGS)</div>
                  <div className="text-2xl font-black text-red-400">Rs. {analytics.costOfGoodsSold}</div>
                  <div className="text-[10px] text-gray-400">Actual food & pack</div>
                </div>

                <div className="p-4 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-1">
                  <div className="text-[11px] text-shrebian-muted">Gross Profit</div>
                  <div className="text-2xl font-black text-emerald-400">Rs. {analytics.grossProfit}</div>
                  <div className="text-[10px] text-emerald-400">Net Sales - COGS</div>
                </div>

                <div className="p-4 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-1">
                  <div className="text-[11px] text-shrebian-muted">Net Profit</div>
                  <div className="text-2xl font-black text-shrebian-gold">Rs. {analytics.netOperatingProfit}</div>
                  <div className="text-[10px] text-shrebian-gold">After Op. Expenses</div>
                </div>
              </div>

              {/* Second Row: Operational KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-shrebian-surface border border-shrebian-border">
                  <div className="text-xs text-shrebian-muted">Shawarmas Sold</div>
                  <div className="text-xl font-bold text-white mt-1">{analytics.shawarmasSold} Units</div>
                </div>
                <div className="p-4 rounded-2xl bg-shrebian-surface border border-shrebian-border">
                  <div className="text-xs text-shrebian-muted">Drinks Sold (Cans)</div>
                  <div className="text-xl font-bold text-white mt-1">{analytics.drinksSold} Cans</div>
                </div>
                <div className="p-4 rounded-2xl bg-shrebian-surface border border-shrebian-border">
                  <div className="text-xs text-shrebian-muted">Cash vs Digital</div>
                  <div className="text-sm font-bold text-white mt-1">
                    Cash: Rs. {analytics.cashSales} | JazzCash: Rs. {analytics.jazzCashSales}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-shrebian-surface border border-shrebian-border">
                  <div className="text-xs text-shrebian-muted">Active Lahore Selling Points</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{analytics.activeSellingPoints} Active</div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-white">Recent Real-Time Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-shrebian-gold hover:underline">
                      View All ({orders.length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                        <tr>
                          <th className="pb-2">Order #</th>
                          <th className="pb-2">Customer</th>
                          <th className="pb-2">Selling Point</th>
                          <th className="pb-2">Items</th>
                          <th className="pb-2">Total</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-shrebian-border">
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} className="hover:bg-shrebian-surface/50">
                            <td className="py-2.5 font-mono font-bold text-shrebian-gold">{o.orderNumber}</td>
                            <td className="py-2.5">{o.customerName} ({o.customerMobile})</td>
                            <td className="py-2.5 text-gray-400">{o.sellingPointName}</td>
                            <td className="py-2.5 text-gray-300">{o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                            <td className="py-2.5 font-bold text-white">Rs. {o.grandTotal}</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {o.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="lg:col-span-4 p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-3">
                  <h3 className="font-extrabold text-sm text-white">Quick Business Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setNewBatchModal(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-shrebian-surface hover:bg-shrebian-elevated border border-shrebian-border text-xs font-semibold text-white flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2"><CookingPot className="w-4 h-4 text-shrebian-gold" /> Record Shawarma Batch</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setNewPurchaseModal(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-shrebian-surface hover:bg-shrebian-elevated border border-shrebian-border text-xs font-semibold text-white flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2"><Receipt className="w-4 h-4 text-emerald-400" /> Record Daily Purchase</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setNewExpenseModal(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-shrebian-surface hover:bg-shrebian-elevated border border-shrebian-border text-xs font-semibold text-white flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-red-400" /> Record Operating Expense</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setInventoryTransferModal(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-shrebian-surface hover:bg-shrebian-elevated border border-shrebian-border text-xs font-semibold text-white flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-cyan-400" /> Day-to-Night Stock Transfer</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIVE ORDERS */}
          {activeTab === 'orders' && (
            <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">All Orders & Audit Trace</h3>
                  <p className="text-xs text-shrebian-muted">Every order is linked to a customer, selling point, employee, and shift.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                    <tr>
                      <th className="pb-3">Order #</th>
                      <th className="pb-3">Customer Details</th>
                      <th className="pb-3">Channel</th>
                      <th className="pb-3">Point & Operator</th>
                      <th className="pb-3">Items & Qty</th>
                      <th className="pb-3">Financials</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shrebian-border">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-shrebian-surface/50">
                        <td className="py-3 font-mono font-bold text-shrebian-gold">{o.orderNumber}</td>
                        <td className="py-3">
                          <div className="font-bold text-white">{o.customerName}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{o.customerMobile}</div>
                          {o.deliveryAddress && <div className="text-[10px] text-shrebian-muted line-clamp-1">{o.deliveryAddress}</div>}
                        </td>
                        <td className="py-3 uppercase text-[10px] font-bold text-gray-400">{o.channel} ({o.orderType})</td>
                        <td className="py-3">
                          <div className="text-gray-300 font-semibold">{o.sellingPointName}</div>
                          <div className="text-[10px] text-shrebian-muted">Served by: {o.employeeName}</div>
                        </td>
                        <td className="py-3">
                          {o.items.map((i, idx) => (
                            <div key={idx} className="text-[11px]">
                              {i.quantity}x {i.productName}
                            </div>
                          ))}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-white">Rs. {o.grandTotal}</div>
                          <div className="text-[10px] text-emerald-400">Profit: Rs. {o.grossProfit}</div>
                        </td>
                        <td className="py-3">
                          <span className="uppercase text-[10px] font-bold text-white">{o.paymentMethod}</span>
                          <div className="text-[10px] text-emerald-400">{o.paymentStatus}</div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MULTI-SHIFT OPERATING HOURS */}
          {activeTab === 'shifts' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white">Configurable Shift Schedules</h3>
                    <p className="text-xs text-shrebian-muted">Flexible operating schedules for Lahore locations (Overnight support enabled).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shifts.schedules.map(sch => (
                    <div key={sch.id} className="p-4 rounded-xl bg-shrebian-surface border border-shrebian-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{sch.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          {sch.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-shrebian-gold font-mono">
                        {sch.defaultStartTime} – {sch.defaultEndTime} PKT {sch.isOvernight ? '(Overnight)' : ''}
                      </div>
                      <p className="text-xs text-shrebian-muted">{sch.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active & Historical Shift Sessions */}
              <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
                <h3 className="font-extrabold text-base text-white">Shift Operating Sessions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                      <tr>
                        <th className="pb-2">Date & Shift</th>
                        <th className="pb-2">Operator & Point</th>
                        <th className="pb-2">Sales & Orders</th>
                        <th className="pb-2">Cash Collected</th>
                        <th className="pb-2">Digital Sales</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">GPS Check-in</th>
                        <th className="pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shrebian-border">
                      {shifts.sessions.map(sess => (
                        <tr key={sess.id} className="hover:bg-shrebian-surface/50">
                          <td className="py-3">
                            <div className="font-bold text-white">{sess.shiftName}</div>
                            <div className="text-[11px] text-gray-400">{sess.businessDate}</div>
                          </td>
                          <td className="py-3">
                            <div className="text-white font-medium">{sess.employeeName}</div>
                            <div className="text-[11px] text-shrebian-muted">{sess.sellingPointName}</div>
                          </td>
                          <td className="py-3">
                            <div className="font-bold text-white">Rs. {sess.grossSales}</div>
                            <div className="text-[10px] text-gray-400">{sess.totalOrders} Orders ({sess.shawarmasSold} Shawarmas)</div>
                          </td>
                          <td className="py-3 font-mono font-bold text-emerald-400">Rs. {sess.cashSales}</td>
                          <td className="py-3 font-mono text-cyan-400">
                            JazzCash: Rs. {sess.jazzCashSales} | Easy: Rs. {sess.easyPaisaSales}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sess.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400'
                            }`}>
                              {sess.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3">
                            {sess.openingGps ? (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${sess.openingGps.lat},${sess.openingGps.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-col gap-0.5 text-cyan-300 hover:text-cyan-200"
                              >
                                <span className="inline-flex items-center gap-1">
                                  {sess.openingGps.lat.toFixed(5)}, {sess.openingGps.lng.toFixed(5)}
                                  <ExternalLink className="h-3 w-3" />
                                </span>
                                <span className="text-[10px] text-shrebian-muted">
                                  {sess.openingGps.accuracyMeters ? `±${Math.round(sess.openingGps.accuracyMeters)} m · ` : ''}
                                  {new Date(sess.openingGps.timestamp).toLocaleString()}
                                </span>
                              </a>
                            ) : (
                              <span className="text-shrebian-muted">Not shared</span>
                            )}
                          </td>
                          <td className="py-3">
                            {sess.status === 'active' && (
                              <button
                                onClick={() => {
                                  setCloseShiftModal(sess);
                                  setCloseShiftForm({ actualCashCounted: sess.expectedCashInHand, notes: '' });
                                }}
                                className="px-2.5 py-1 rounded bg-shrebian-red hover:bg-shrebian-red-hover text-white text-[10px] font-bold"
                              >
                                End Shift & Reconcile
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LAHORE SELLING POINTS & MAP */}
          {activeTab === 'selling_points' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">Lahore Selling Points</h3>
                  <p className="text-xs text-shrebian-muted">Manage active locations and delivery radius.</p>
                </div>
                <button
                  onClick={() => {
                    setSellingPointError('');
                    setNewSellingPointModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-xs font-bold text-white flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Point</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sellingPoints.map(sp => (
                  <div key={sp.id} className="p-5 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      {sp.imageUrl && (
                        <div className="relative h-36 overflow-hidden rounded-xl">
                          <Image src={sp.imageUrl} alt={`${sp.name} selling point`} fill unoptimized className="object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sp.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {sp.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span className="text-[10px] text-shrebian-gold font-mono">{sp.deliveryRadiusKm} KM RADIUS</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white">{sp.name}</h4>
                      <p className="text-xs text-shrebian-muted">{sp.area}</p>
                      <p className="text-[11px] text-gray-400">{sp.address}</p>
                    </div>

                    <div className="pt-3 border-t border-shrebian-border">
                      <button
                        onClick={() => handleToggleSellingPoint(sp.id, !sp.isActive)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                          sp.isActive
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                      >
                        {sp.isActive ? 'DEACTIVATE POINT' : 'ACTIVATE POINT'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EMPLOYEES & KYC */}
          {activeTab === 'employees' && (
            <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">Team Members & KYC Compliance</h3>
                  <p className="text-xs text-shrebian-muted">Only verified staff can operate official POS terminals.</p>
                </div>
                <button
                  onClick={() => {
                    setEmployeeError('');
                    setNewEmployeeModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Employee</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                    <tr>
                      <th className="pb-3">Name & Role</th>
                      <th className="pb-3">Mobile & CNIC</th>
                      <th className="pb-3">Residential Address</th>
                      <th className="pb-3">Assigned Point & Shift</th>
                      <th className="pb-3">POS PIN</th>
                      <th className="pb-3">Employment</th>
                      <th className="pb-3">KYC Status</th>
                      <th className="pb-3">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shrebian-border">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-shrebian-surface/50">
                        <td className="py-3">
                          <div className="font-bold text-white">{e.fullName}</div>
                          <div className="text-[10px] uppercase text-shrebian-gold">{e.role}</div>
                        </td>
                        <td className="py-3 font-mono">
                          <div>{e.mobile}</div>
                          <div className="text-[10px] text-gray-400">CNIC: {e.cnic}</div>
                        </td>
                        <td className="py-3 text-gray-300">{e.residentialAddress}</td>
                        <td className="py-3">
                          <div className="text-white">{sellingPoints.find(point => point.id === e.assignedSellingPointId)?.name || 'Not assigned'}</div>
                          <div className="text-[10px] text-shrebian-muted">
                            {shifts.schedules.find(schedule => schedule.id === e.assignedShiftId)?.name || 'No shift assigned'}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className={e.hasPosPin ? 'text-emerald-400' : 'text-amber-300'}>
                            {e.hasPosPin ? 'Assigned (hidden)' : 'Not set'}
                          </div>
                          {e.role !== 'owner' && (
                            <button
                              onClick={() => {
                                setPinManageError('');
                                setPinManageEmployee(e);
                                setPinManageValue('');
                              }}
                              className="mt-1 rounded bg-shrebian-elevated px-2 py-1 text-[10px] font-bold text-white"
                            >
                              {e.hasPosPin ? 'Reset PIN' : 'Set PIN'}
                            </button>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={e.employmentStatus === 'active' ? 'text-emerald-400' : 'text-red-300'}>
                            {e.employmentStatus.toUpperCase()}
                          </span>
                          {e.role !== 'owner' && e.employmentStatus === 'active' && (
                            <button
                              onClick={() => handleDeactivateEmployee(e)}
                              className="mt-1 block rounded bg-red-500/15 px-2 py-1 text-[10px] font-bold text-red-300"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            e.kycStatus === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : e.kycStatus === 'under_review'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {e.kycStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3">
                          {e.role !== 'owner' && (
                            <div className="flex gap-1.5">
                              {e.kycStatus !== 'verified' && (
                                <button
                                  onClick={() => handleUpdateKYC(e.id, 'verified')}
                                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                                >
                                  Verify
                                </button>
                              )}
                              {e.kycStatus !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateKYC(e.id, 'rejected')}
                                  className="px-2 py-1 rounded bg-red-600/30 text-red-300 hover:bg-red-600/50 text-[10px] font-bold"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INVENTORY CARRY-FORWARD */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white">Central & Cold-Box Stock Balance</h3>
                    <p className="text-xs text-shrebian-muted">Single ledger tracking across all shifts without artificial stock creation.</p>
                  </div>
                  <button
                    onClick={() => setInventoryTransferModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-shrebian-gold text-black text-xs font-bold flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer Stock Between Shifts</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                      <tr>
                        <th className="pb-3">Product Name</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Selling Price</th>
                        <th className="pb-3">Production Cost</th>
                        <th className="pb-3">Current Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shrebian-border">
                      {products.map(p => {
                        const stockItem = inventorySummary.find(s => s.product?.id === p.id);
                        return (
                          <tr key={p.id} className="hover:bg-shrebian-surface/50">
                            <td className="py-3 font-bold text-white">{p.name}</td>
                            <td className="py-3 uppercase text-[10px] text-shrebian-gold">{p.category.replace('_', ' ')}</td>
                            <td className="py-3">Rs. {p.sellingPrice}</td>
                            <td className="py-3 text-red-400">Rs. {p.productionCost}</td>
                            <td className="py-3 font-mono font-bold text-emerald-400">
                              {stockItem ? stockItem.total : 50} Units
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BATCH PRODUCTION */}
          {activeTab === 'production' && (
            <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">Home Production Batches & 50-Pouch Thermal Bags</h3>
                  <p className="text-xs text-shrebian-muted">Formula costing per shawarma: Ingredients, Khameeri roti, chicken 100g, fries 80g, packaging 50g.</p>
                </div>
                <button
                  onClick={() => setNewBatchModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Prepare New Batch</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                    <tr>
                      <th className="pb-3">Batch #</th>
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Quantity</th>
                      <th className="pb-3">Batch Total Cost</th>
                      <th className="pb-3">Unit Cost</th>
                      <th className="pb-3">Prepared By</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shrebian-border">
                    {productionBatches.map(b => (
                      <tr key={b.id} className="hover:bg-shrebian-surface/50">
                        <td className="py-3 font-mono font-bold text-shrebian-gold">{b.batchNumber}</td>
                        <td className="py-3 font-bold text-white">{b.productName}</td>
                        <td className="py-3 font-mono">{b.quantityPrepared} Units (50-Slot Bag)</td>
                        <td className="py-3 text-red-400 font-bold">Rs. {b.totalBatchCost}</td>
                        <td className="py-3 font-mono font-bold text-shrebian-gold">Rs. {b.unitProductionCost} / unit</td>
                        <td className="py-3 text-gray-300">{b.preparedBy}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DAILY FINANCIAL CALENDAR */}
          {activeTab === 'accounting' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-white">Daily Sales & Profit Accounting Calendar</h3>
                  <p className="text-xs text-shrebian-muted">Select any historical date to inspect complete transaction ledger.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-shrebian-muted">Business Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-shrebian-surface border border-shrebian-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-shrebian-gold"
                  />
                </div>
              </div>

              {dailyReport && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-shrebian-card border border-shrebian-border">
                    <div className="text-[11px] text-shrebian-muted">Gross Sales</div>
                    <div className="text-xl font-bold text-shrebian-gold">Rs. {dailyReport.grossSales}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-shrebian-card border border-shrebian-border">
                    <div className="text-[11px] text-shrebian-muted">Cost of Goods Sold (COGS)</div>
                    <div className="text-xl font-bold text-red-400">Rs. {dailyReport.costOfGoodsSold}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-shrebian-card border border-shrebian-border">
                    <div className="text-[11px] text-shrebian-muted">Operating Expenses</div>
                    <div className="text-xl font-bold text-red-400">Rs. {dailyReport.operatingExpenses}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-shrebian-card border border-shrebian-border">
                    <div className="text-[11px] text-shrebian-muted">Net Operating Profit</div>
                    <div className="text-xl font-black text-emerald-400">Rs. {dailyReport.netOperatingProfit}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: CASH SETTLEMENTS */}
          {activeTab === 'settlements' && (
            <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-white">Employee Closing Cash Settlements</h3>
                <p className="text-xs text-shrebian-muted">
                  Official Account: <strong className="text-shrebian-gold">03120073794 (Kaleem Durrani)</strong>. Only owner verification marks records settled.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                    <tr>
                      <th className="pb-3">Shift & Date</th>
                      <th className="pb-3">Employee</th>
                      <th className="pb-3">Expected Cash</th>
                      <th className="pb-3">Submitted</th>
                      <th className="pb-3">TxID / Service</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Owner Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shrebian-border">
                    {settlements.map((s, idx) => (
                      <tr key={idx} className="hover:bg-shrebian-surface/50">
                        <td className="py-3 font-semibold text-white">{s.shiftName} ({s.businessDate})</td>
                        <td className="py-3">{s.employeeName}</td>
                        <td className="py-3 font-mono font-bold text-white">Rs. {s.expectedCashInHand}</td>
                        <td className="py-3 font-mono font-bold text-emerald-400">Rs. {s.cashSubmitted || 0}</td>
                        <td className="py-3 font-mono text-[11px] text-gray-300">
                          {s.settlementDetails ? `${s.settlementDetails.service} - ${s.settlementDetails.transactionId}` : 'None'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.settlementStatus === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {s.settlementStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3">
                          {s.settlementStatus === 'submitted' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleVerifySettlement(s.sessionId, 'verified')}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                              >
                                Confirm Verification
                              </button>
                              <button
                                onClick={() => handleVerifySettlement(s.sessionId, 'rejected')}
                                className="px-2 py-1 rounded bg-red-600/30 text-red-300 hover:bg-red-600/50 text-[10px] font-bold"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PURCHASES & EXPENSES */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white">Purchases (Chicken, Cans, Ingredients)</h3>
                    <p className="text-xs text-shrebian-muted">Purchases increase raw stock without duplicate counting in COGS.</p>
                  </div>
                  <button
                    onClick={() => setNewPurchaseModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Purchase</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                      <tr>
                        <th className="pb-3">Purchase ID</th>
                        <th className="pb-3">Supplier</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Entered By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shrebian-border">
                      {purchases.map(p => (
                        <tr key={p.id} className="hover:bg-shrebian-surface/50">
                          <td className="py-3 font-mono font-bold text-shrebian-gold">{p.purchaseId}</td>
                          <td className="py-3 font-bold text-white">{p.supplierName}</td>
                          <td className="py-3 uppercase text-[10px] text-gray-400">{p.category}</td>
                          <td className="py-3 font-bold text-emerald-400">Rs. {p.totalAmount}</td>
                          <td className="py-3 uppercase text-[10px]">{p.paymentMethod}</td>
                          <td className="py-3 text-gray-400">{p.enteredBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-white">Operating Expenses (Fuel, Transport, Misc)</h3>
                  <button
                    onClick={() => setNewExpenseModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-shrebian-surface hover:bg-shrebian-elevated border border-shrebian-border text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Expense</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                      <tr>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Entered By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shrebian-border">
                      {expenses.map(e => (
                        <tr key={e.id} className="hover:bg-shrebian-surface/50">
                          <td className="py-3 text-gray-400">{e.expenseDate}</td>
                          <td className="py-3 uppercase text-[10px] font-bold text-shrebian-gold">{e.category}</td>
                          <td className="py-3 text-white">{e.description}</td>
                          <td className="py-3 font-bold text-red-400">Rs. {e.amount}</td>
                          <td className="py-3 text-gray-400">{e.enteredBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CRM & LEADS */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white">Confirmed Customer Database</h3>
                    <p className="text-xs text-shrebian-muted">Automatically registered from customer orders.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                      <tr>
                        <th className="pb-3">Customer Name</th>
                        <th className="pb-3">Mobile Number</th>
                        <th className="pb-3">Total Orders</th>
                        <th className="pb-3">Lifetime Spend</th>
                        <th className="pb-3">Last Order Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shrebian-border">
                      {crmData.customers.map(c => (
                        <tr key={c.id} className="hover:bg-shrebian-surface/50">
                          <td className="py-3 font-bold text-white">{c.name}</td>
                          <td className="py-3 font-mono text-shrebian-gold">{c.mobile}</td>
                          <td className="py-3 font-mono">{c.totalOrders} Orders</td>
                          <td className="py-3 font-bold text-emerald-400">Rs. {c.lifetimeSpend}</td>
                          <td className="py-3 text-gray-400">{c.lastOrderDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Leads */}
              <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white">Prospective Leads & Catering Inquiries</h3>
                    <p className="text-xs text-shrebian-muted">Separate from confirmed customers.</p>
                  </div>
                  <button
                    onClick={() => setNewLeadModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Lead</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                      <tr>
                        <th className="pb-3">Lead Name</th>
                        <th className="pb-3">Mobile</th>
                        <th className="pb-3">Location & Source</th>
                        <th className="pb-3">Interested In</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-shrebian-border">
                      {crmData.leads.map(l => (
                        <tr key={l.id} className="hover:bg-shrebian-surface/50">
                          <td className="py-3 font-bold text-white">{l.name}</td>
                          <td className="py-3 font-mono">{l.mobile}</td>
                          <td className="py-3 text-gray-400">{l.location} ({l.source})</td>
                          <td className="py-3 text-gray-300">{l.interestedProduct}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400">
                              {l.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AUDIT TRAIL LOGS */}
          {activeTab === 'audit' && (
            <div className="p-6 rounded-2xl bg-shrebian-card border border-shrebian-border space-y-4">
              <h3 className="font-extrabold text-base text-white">Full Business Audit Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-shrebian-muted border-b border-shrebian-border pb-2">
                    <tr>
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">User</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shrebian-border">
                    {auditLogs.map(a => (
                      <tr key={a.id} className="hover:bg-shrebian-surface/50">
                        <td className="py-2.5 font-mono text-[10px] text-gray-400">{new Date(a.timestamp).toLocaleString()}</td>
                        <td className="py-2.5 font-semibold text-white">{a.userName}</td>
                        <td className="py-2.5 font-bold text-shrebian-gold uppercase text-[10px]">{a.action}</td>
                        <td className="py-2.5 text-gray-300">{a.newValue || a.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {newSellingPointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-shrebian-border bg-shrebian-surface p-6 space-y-4">
            <div>
              <h4 className="font-bold text-lg text-white">Add New Selling Point</h4>
              <p className="text-xs text-shrebian-muted">New points are created inactive until you activate them.</p>
            </div>
            {sellingPointError && (
              <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {sellingPointError}
              </div>
            )}
            <form onSubmit={handleCreateSellingPoint} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-gray-400">
                  Point name
                  <input
                    required
                    value={sellingPointForm.name}
                    onChange={event => setSellingPointForm({ ...sellingPointForm, name: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-shrebian-border bg-shrebian-card p-2.5 text-white"
                  />
                </label>
                <label className="text-gray-400">
                  Area
                  <input
                    required
                    value={sellingPointForm.area}
                    onChange={event => setSellingPointForm({ ...sellingPointForm, area: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-shrebian-border bg-shrebian-card p-2.5 text-white"
                  />
                </label>
              </div>
              <label className="block text-gray-400">
                Full address
                <input
                  required
                  value={sellingPointForm.address}
                  onChange={event => setSellingPointForm({ ...sellingPointForm, address: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-shrebian-border bg-shrebian-card p-2.5 text-white"
                />
              </label>
              <label className="block text-gray-400">
                Point photo (optional, JPG/PNG/WebP, up to 1 MB)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={event => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                      setSellingPointError('Choose a JPG, PNG, or WebP image.');
                      event.target.value = '';
                      return;
                    }
                    if (file.size > 1024 * 1024) {
                      setSellingPointError('Point photos must be 1 MB or smaller.');
                      event.target.value = '';
                      return;
                    }
                    setSellingPointError('');
                    const reader = new FileReader();
                    reader.onload = () => {
                      const imageUrl = reader.result;
                      if (typeof imageUrl === 'string') {
                        setSellingPointForm(current => ({ ...current, imageUrl }));
                      } else {
                        setSellingPointError('Could not read the selected image.');
                      }
                    };
                    reader.onerror = () => setSellingPointError('Could not read the selected image.');
                    reader.readAsDataURL(file);
                  }}
                  className="mt-1 w-full rounded-xl border border-shrebian-border bg-shrebian-card p-2.5 text-white file:mr-3 file:rounded-lg file:border-0 file:bg-shrebian-elevated file:px-3 file:py-1 file:text-white"
                />
              </label>
              {sellingPointForm.imageUrl && (
                <div className="relative h-40 overflow-hidden rounded-xl border border-shrebian-border">
                  <Image src={sellingPointForm.imageUrl} alt="Selling point preview" fill unoptimized className="object-cover" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="text-gray-400">
                  Radius (km)
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={sellingPointForm.radius}
                    onChange={event => setSellingPointForm({ ...sellingPointForm, radius: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-shrebian-border bg-shrebian-card p-2.5 text-white"
                  />
                </label>
                <label className="text-gray-400">
                  Hours
                  <input
                    required
                    value={sellingPointForm.operatingHours}
                    onChange={event => setSellingPointForm({ ...sellingPointForm, operatingHours: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-shrebian-border bg-shrebian-card p-2.5 text-white"
                  />
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewSellingPointModal(false)}
                  className="flex-1 rounded-xl bg-shrebian-card py-2.5 text-gray-300 hover:bg-shrebian-elevated"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-shrebian-red py-2.5 font-bold text-white hover:bg-shrebian-red-hover"
                >
                  Save Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER EMPLOYEE */}
      {newEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-shrebian-surface border border-shrebian-border rounded-2xl p-6 space-y-4 my-auto">
            <h4 className="font-bold text-lg text-white">Register Employee / Partner</h4>
            <p className="text-xs text-shrebian-muted">
              Assign their point and shift. Their location is only shared with the admin when they manually check in from POS.
            </p>
            {employeeError && (
              <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {employeeError}
              </div>
            )}
            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-gray-400">
                  Full Legal Name *
                <input
                  type="text"
                  required
                  value={empForm.fullName}
                  onChange={e => setEmpForm({ ...empForm, fullName: e.target.value })}
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                />
                </label>
                <label className="block text-gray-400">
                  Username (auto-generated if blank)
                  <input
                    value={empForm.username}
                    onChange={e => setEmpForm({ ...empForm, username: e.target.value })}
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  />
                </label>
                <label className="block text-gray-400">
                  Mobile Number *
                  <input
                    type="tel"
                    required
                    value={empForm.mobile}
                    onChange={e => setEmpForm({ ...empForm, mobile: e.target.value })}
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white font-mono"
                  />
                </label>
                <label className="block text-gray-400">
                  CNIC Number *
                  <input
                    type="text"
                    required
                    placeholder="35201-XXXXXXX-X"
                    value={empForm.cnic}
                    onChange={e => setEmpForm({ ...empForm, cnic: e.target.value })}
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white font-mono"
                  />
                </label>
                <label className="block text-gray-400">
                  Emergency Contact *
                  <input
                    type="tel"
                    required
                    value={empForm.emergencyContact}
                    onChange={e => setEmpForm({ ...empForm, emergencyContact: e.target.value })}
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white font-mono"
                  />
                </label>
                <label className="block text-gray-400">
                  Role *
                  <select
                    value={empForm.role}
                    onChange={e => setEmpForm({ ...empForm, role: e.target.value })}
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </label>
                <label className="block text-gray-400">
                  Individual POS PIN (6-8 digits) *
                  <input
                    type="password"
                    inputMode="numeric"
                    minLength={6}
                    maxLength={8}
                    pattern="[0-9]{6,8}"
                    required
                    value={empForm.pin}
                    onChange={e => setEmpForm({ ...empForm, pin: e.target.value })}
                    placeholder="Set a unique PIN"
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white font-mono"
                  />
                </label>
              </div>
              <label className="block text-gray-400">
                Residential Address (Lahore) *
                <input
                  type="text"
                  required
                  value={empForm.residentialAddress}
                  onChange={e => setEmpForm({ ...empForm, residentialAddress: e.target.value })}
                  className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-gray-400">
                  Assigned Selling Point *
                  <select
                    required
                    value={empForm.assignedSellingPointId}
                    onChange={e => setEmpForm({ ...empForm, assignedSellingPointId: e.target.value })}
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  >
                    <option value="">Select selling point</option>
                    {sellingPoints.filter(point => point.isActive).map(point => (
                      <option key={point.id} value={point.id}>{point.name} — {point.area}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-gray-400">
                  Preferred Shift / Time *
                  <select
                    required
                    value={empForm.assignedShiftId}
                    onChange={e => setEmpForm({ ...empForm, assignedShiftId: e.target.value })}
                    className="mt-1 w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  >
                    <option value="">Select shift</option>
                    {shifts.schedules.filter(schedule => schedule.status === 'active').map(schedule => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.name} — {schedule.defaultStartTime} to {schedule.defaultEndTime}{schedule.isOvernight ? ' (overnight)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmployeeError('');
                    setNewEmployeeModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-shrebian-card hover:bg-shrebian-elevated text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-white font-bold"
                >
                  Save & Submit KYC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pinManageEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-shrebian-border bg-shrebian-surface p-6">
            <div>
              <h4 className="text-lg font-bold text-white">{pinManageEmployee.hasPosPin ? 'Reset' : 'Set'} POS PIN</h4>
              <p className="mt-1 text-xs text-shrebian-muted">
                {pinManageEmployee.fullName} must use this individual PIN to sign in. The PIN is securely hashed and cannot be viewed later.
              </p>
            </div>
            {pinManageError && <p role="alert" className="text-xs text-red-300">{pinManageError}</p>}
            <form onSubmit={handleResetEmployeePin} className="space-y-3">
              <label className="block text-xs text-gray-400">
                New 6-8 digit PIN
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={8}
                  pattern="[0-9]{6,8}"
                  required
                  value={pinManageValue}
                  onChange={event => setPinManageValue(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-shrebian-border bg-shrebian-card p-2.5 font-mono text-white"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPinManageEmployee(null);
                    setPinManageValue('');
                    setPinManageError('');
                  }}
                  className="flex-1 rounded-xl bg-shrebian-card py-2.5 text-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-shrebian-red py-2.5 font-bold text-white">
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD BATCH PRODUCTION */}
      {newBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-shrebian-surface border border-shrebian-border rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-lg text-white">Record Shawarma Production Batch</h4>
            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Product</label>
                <select
                  value={batchForm.productId}
                  onChange={e => setBatchForm({ ...batchForm, productId: e.target.value })}
                  className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                >
                  {products.filter(p => p.category === 'shawarma').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Prepared Quantity (e.g. 50)</label>
                  <input
                    type="number"
                    required
                    value={batchForm.quantityPrepared}
                    onChange={e => setBatchForm({ ...batchForm, quantityPrepared: Number(e.target.value) })}
                    className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Ingredients Cost (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={batchForm.ingredientsCost}
                    onChange={e => setBatchForm({ ...batchForm, ingredientsCost: Number(e.target.value) })}
                    className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Packaging Cost (Rs.)</label>
                  <input
                    type="number"
                    value={batchForm.packagingCost}
                    onChange={e => setBatchForm({ ...batchForm, packagingCost: Number(e.target.value) })}
                    className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Wastage Reserve (Rs.)</label>
                  <input
                    type="number"
                    value={batchForm.wastageReserveCost}
                    onChange={e => setBatchForm({ ...batchForm, wastageReserveCost: Number(e.target.value) })}
                    className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewBatchModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-shrebian-card hover:bg-shrebian-elevated text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-white font-bold"
                >
                  Record Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK TRANSFER DAY-TO-NIGHT */}
      {inventoryTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-shrebian-surface border border-shrebian-border rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-lg text-white">Transfer Inventory Across Shifts</h4>
            <p className="text-xs text-shrebian-muted">Example: Day Shift closes with 12 Coca-Cola cans -&gt; Night Shift opens with 12 cans. Total inventory remains 12 cans without duplication.</p>
            <form onSubmit={handleTransferInventory} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Source Shift (Outflow)</label>
                <select
                  value={transferForm.sourceShiftId}
                  onChange={e => setTransferForm({ ...transferForm, sourceShiftId: e.target.value })}
                  className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                >
                  <option value="">Select Source Shift Session</option>
                  {shifts.sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.shiftName} - {s.sellingPointName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Target Shift (Inflow)</label>
                <select
                  value={transferForm.targetShiftId}
                  onChange={e => setTransferForm({ ...transferForm, targetShiftId: e.target.value })}
                  className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                >
                  <option value="">Select Target Shift Session</option>
                  {shifts.sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.shiftName} - {s.sellingPointName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Product</label>
                  <select
                    value={transferForm.productId}
                    onChange={e => setTransferForm({ ...transferForm, productId: e.target.value })}
                    className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={transferForm.quantity}
                    onChange={e => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                    className="w-full bg-shrebian-card border border-shrebian-border rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInventoryTransferModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-shrebian-card hover:bg-shrebian-elevated text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-shrebian-gold text-black font-bold"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
