'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldCheck,
  Flame,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  Home,
  MapPin,
  LogOut
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { ReceiptActions } from '@/components/receipt/ReceiptActions';
import { ReceiptPaymentOptions } from '@/components/receipt/ReceiptPaymentOptions';
import { Product, SellingPoint, Order, ShiftSession, ShiftSchedule, User } from '@/types';
import { FIXED_DELIVERY_FEE, getShawarmaCount, MIN_DELIVERY_SHAWARMA_COUNT } from '@/lib/delivery';
import { getWhatsAppReceiptUrl } from '@/lib/whatsapp';

type PosOperator = Pick<User, 'id' | 'fullName' | 'role' | 'assignedSellingPointId' | 'assignedShiftId'>;

export default function EmployeePOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<PosOperator | null>(null);
  const [authKind, setAuthKind] = useState<'owner' | 'employee' | null>(null);
  const [loginEmployeeId, setLoginEmployeeId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [sellingPoints, setSellingPoints] = useState<SellingPoint[]>([]);
  const [currentSellingPoint, setCurrentSellingPoint] = useState<SellingPoint | null>(null);
  const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>([]);
  const [activeSessions, setActiveSessions] = useState<Array<Pick<ShiftSession, 'id' | 'employeeId' | 'sellingPointId' | 'shiftScheduleId' | 'shiftName'>>>([]);
  const [currentShiftScheduleId, setCurrentShiftScheduleId] = useState('');
  const [employeePin, setEmployeePin] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState('');

  // Cart state
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [orderType, setOrderType] = useState<'takeaway' | 'delivery'>('takeaway');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'jazzcash' | 'easypaisa'>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'shawarma' | 'drinks'>('shawarma');

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    async function loadPOSData() {
      try {
        const [prodRes, empRes, spRes, shiftRes, sessionRes] = await Promise.all([
          fetch('/api/products').then(r => r.json()),
          fetch('/api/employees?view=pos').then(r => r.json()),
          fetch('/api/selling-points').then(r => r.json()),
          fetch('/api/shifts?view=pos').then(r => r.json()),
          fetch('/api/pos/session').then(r => r.json())
        ]);

        if (prodRes.success) setProducts(prodRes.products);
        if (empRes.success) {
          setUsers(empRes.employees);
          setLoginEmployeeId(previous => previous || empRes.employees[0]?.id || '');
        }
        const operator = sessionRes.success ? sessionRes.employee as PosOperator : null;
        setCurrentEmployee(operator);
        setAuthKind(sessionRes.success ? sessionRes.kind : null);
        if (spRes.success) {
          setSellingPoints(spRes.sellingPoints);
        }
        if (shiftRes.success && shiftRes.sessions) {
          const schedules = (shiftRes.schedules || []) as ShiftSchedule[];
          const sessions = shiftRes.sessions as Array<Pick<ShiftSession, 'id' | 'employeeId' | 'sellingPointId' | 'shiftScheduleId' | 'shiftName'>>;
          setShiftSchedules(schedules);
          setActiveSessions(sessions);
          const employeeSession = sessions.find(session => session.employeeId === operator?.id);
          const assignedPointId = employeeSession?.sellingPointId || operator?.assignedSellingPointId;
          const selectedPoint = spRes.sellingPoints?.find((point: SellingPoint) => point.id === assignedPointId)
            || spRes.sellingPoints?.find((point: SellingPoint) => point.isActive)
            || spRes.sellingPoints?.[0];
          setCurrentSellingPoint(selectedPoint || null);
          setCurrentShiftScheduleId(employeeSession?.shiftScheduleId || operator?.assignedShiftId || schedules[0]?.id || '');
        }
      } catch (err) {
        console.error('POS load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPOSData();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentActiveSession = activeSessions.find(session => session.employeeId === currentEmployee?.id);

  const handlePosLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError('');
    if (!loginEmployeeId || !employeePin) {
      setLoginError('Select your employee account and enter your individual POS PIN.');
      return;
    }

    setSigningIn(true);
    try {
      const response = await fetch('/api/pos/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: loginEmployeeId, pin: employeePin })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setLoginError(result.error || 'POS access denied. Ask the owner to verify your account and PIN.');
        return;
      }

      const sessionResponse = await fetch('/api/pos/session');
      const session = await sessionResponse.json();
      if (!sessionResponse.ok || !session.success) {
        setLoginError(session.error || 'Could not verify the employee POS session.');
        return;
      }
      setCurrentEmployee(session.employee);
      setAuthKind(session.kind);
      setEmployeePin('');
      const selectedPoint = sellingPoints.find((point: SellingPoint) => point.id === session.employee.assignedSellingPointId)
        || sellingPoints.find((point: SellingPoint) => point.isActive)
        || sellingPoints[0];
      if (selectedPoint) setCurrentSellingPoint(selectedPoint);
      setCurrentShiftScheduleId(session.employee.assignedShiftId || shiftSchedules[0]?.id || '');
      const shiftsResponse = await fetch('/api/shifts?view=pos');
      const shiftsData = await shiftsResponse.json();
      if (shiftsData.success) setActiveSessions(shiftsData.sessions);
    } catch (error) {
      console.error('POS employee sign-in failed:', error);
      setLoginError('Could not connect to POS sign-in. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handlePosLogout = async () => {
    if (authKind === 'owner') {
      window.location.assign('/');
      return;
    }
    try {
      const response = await fetch('/api/pos/logout', { method: 'POST' });
      if (!response.ok) {
        setLoginError('Could not sign out of POS. Please try again.');
        return;
      }
      setCurrentEmployee(null);
      setAuthKind(null);
      setEmployeePin('');
      setCheckInMessage('');
      setCurrentSellingPoint(null);
      setLoginError('');
    } catch (error) {
      console.error('POS sign-out failed:', error);
      setLoginError('Could not connect to sign out of POS.');
    }
  };

  const handleShiftCheckIn = async () => {
    setCheckInMessage('');
    if (!currentEmployee || !authKind) {
      setCheckInMessage('Check-in is not authorized. Sign in with the owner admin session or your own employee PIN.');
      return;
    }
    if (!currentSellingPoint || !currentShiftScheduleId) {
      setCheckInMessage('Select an authorized selling point and shift first.');
      return;
    }
    if (!navigator.geolocation) {
      setCheckInMessage('This device/browser does not support GPS location.');
      return;
    }

    setCheckingIn(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });
      const response = await fetch('/api/shift-check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          sellingPointId: currentSellingPoint.id,
          shiftScheduleId: currentShiftScheduleId,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracyMeters: position.coords.accuracy
          }
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setCheckInMessage(result.error || 'Could not save your location check-in.');
        return;
      }

      const shiftResponse = await fetch('/api/shifts?view=pos');
      const shiftData = await shiftResponse.json();
      if (shiftData.success) setActiveSessions(shiftData.sessions);
      setCheckInMessage(`Location check-in saved for ${result.session.sellingPointName}. Only the admin can view your GPS.`);
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        setCheckInMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Allow location access to check in.'
            : error.code === error.TIMEOUT
              ? 'Getting your GPS location timed out. Please try again outside or near a window.'
              : 'Unable to get your GPS location. Check device location settings and try again.'
        );
      } else {
        console.error('Shift location check-in failed:', error);
        setCheckInMessage('Could not connect to save the check-in. Please try again.');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setCartItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const subtotal = cartItems.reduce((sum, i) => sum + (i.product.sellingPrice * i.quantity), 0);
  const shawarmaCount = getShawarmaCount(cartItems);
  const deliveryCharges = orderType === 'delivery' ? FIXED_DELIVERY_FEE : 0;
  const grandTotal = Math.max(0, subtotal + deliveryCharges - discount);

  useEffect(() => {
    if (orderType === 'delivery' && shawarmaCount < MIN_DELIVERY_SHAWARMA_COUNT) {
      setOrderType('takeaway');
      setErrorMsg('Delivery requires at least 2 shawarmas.');
    }
  }, [orderType, shawarmaCount]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentEmployee || !authKind) {
      setErrorMsg('POS access denied. Sign in with the owner admin session or your own employee PIN.');
      return;
    }
    if (!currentActiveSession) {
      setErrorMsg('Check in and start your shift before creating a POS order.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('Cart is empty. Add products before finalizing bill.');
      return;
    }
    if (orderType === 'delivery' && shawarmaCount < MIN_DELIVERY_SHAWARMA_COUNT) {
      setErrorMsg('Delivery requires at least 2 shawarmas.');
      return;
    }

    // MANDATORY CUSTOMER NAME AND MOBILE
    if (!customerName.trim()) {
      setErrorMsg('Mandatory: Customer full name is required before bill printing.');
      return;
    }

    const cleanMobile = customerMobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMsg('Mandatory: Valid customer mobile number (03XXXXXXXXX) is required.');
      return;
    }

    if (!currentSellingPoint) {
      setErrorMsg('Please select an active selling point.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        channel: 'pos',
        orderType,
        customerName: customerName.trim(),
        customerMobile: cleanMobile,
        sellingPointId: currentSellingPoint.id,
        employeeId: currentEmployee?.id || 'usr_kaleem',
        items: cartItems.map(i => ({
          productId: i.product.id,
          quantity: i.quantity
        })),
        paymentMethod,
        discount: Number(discount) || 0,
        deliveryCharges
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setConfirmedOrder(data.order);
        setCartItems([]);
        setCustomerName('');
        setCustomerMobile('');
        setDiscount(0);
      } else {
        setErrorMsg(data.error || 'Failed to complete POS transaction.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const shawarmas = products.filter(p => p.category === 'shawarma');
  const drinks = products.filter(p => p.category === 'canned_drink');

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-shrebian-bg text-sm text-shrebian-muted">
        Verifying secure POS access…
      </main>
    );
  }

  if (!currentEmployee || !authKind) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-shrebian-bg p-4 text-white">
        <form onSubmit={handlePosLogin} className="w-full max-w-sm space-y-5 rounded-2xl border border-shrebian-border bg-shrebian-surface p-6 shadow-2xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo size="md" />
            <div>
              <h1 className="text-xl font-black">Employee POS Sign In</h1>
              <p className="mt-1 text-xs text-shrebian-muted">Use your own verified employee account and individual PIN.</p>
            </div>
          </div>
          {loginError && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {loginError}
            </p>
          )}
          {users.length === 0 ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              No verified employees are currently authorized for POS. Ask the owner to verify your employee account and assign a PIN.
            </p>
          ) : (
            <>
              <label className="block text-xs text-gray-300">
                Your employee account
                <select
                  required
                  value={loginEmployeeId}
                  onChange={event => setLoginEmployeeId(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-shrebian-border bg-shrebian-card px-3.5 py-3 text-sm text-white"
                >
                  <option value="">Select your name</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.fullName} ({user.role})</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-gray-300">
                Individual POS PIN
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  minLength={6}
                  maxLength={8}
                  pattern="[0-9]{6,8}"
                  required
                  value={employeePin}
                  onChange={event => setEmployeePin(event.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="mt-1.5 w-full rounded-xl border border-shrebian-border bg-shrebian-card px-3.5 py-3 font-mono text-sm text-white"
                />
              </label>
              <button
                type="submit"
                disabled={signingIn || !loginEmployeeId}
                className="w-full rounded-xl bg-shrebian-red py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {signingIn ? 'VERIFYING…' : 'SIGN IN TO POS'}
              </button>
            </>
          )}
          <p className="text-center text-[11px] text-shrebian-muted">
            Owner / Super Admin?{' '}
            <Link href="/admin/login" className="font-semibold text-shrebian-gold hover:underline">
              Sign in securely
            </Link>
          </p>
          <Link href="/" className="block text-center text-xs text-gray-400 hover:text-white">Return to home</Link>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-shrebian-bg text-shrebian-text flex flex-col">
      {/* POS Top Header */}
      <header className="h-16 bg-shrebian-surface border-b border-shrebian-border px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" showTagline={false} />
          </Link>
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-shrebian-border text-xs">
            <span className="font-extrabold text-white tracking-wide">TOUCH POS TERMINAL</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE SHIFT
            </span>
          </div>
        </div>

        {/* Authenticated operator & selling point */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-shrebian-card border border-shrebian-border text-xs">
            <UserCheck className="w-3.5 h-3.5 text-shrebian-gold" />
            <span className="font-semibold text-white">{currentEmployee.fullName} · {authKind === 'owner' ? 'OWNER' : 'EMPLOYEE'}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-shrebian-card border border-shrebian-border text-xs">
            <Store className="w-3.5 h-3.5 text-shrebian-red" />
            <select
              value={currentSellingPoint?.id || ''}
              onChange={(e) => {
                const sp = sellingPoints.find(x => x.id === e.target.value);
                if (sp) setCurrentSellingPoint(sp);
              }}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {sellingPoints.filter(sp => authKind === 'owner' || !currentEmployee.assignedSellingPointId || sp.id === currentEmployee.assignedSellingPointId).map(sp => (
                <option key={sp.id} value={sp.id} className="bg-shrebian-surface text-white">
                  {sp.name}{sp.isActive ? '' : ' (Closed)'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${isOnline ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
            </span>

            <Link
              href="/admin"
              className="p-2 rounded-lg bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border text-white text-xs"
              title="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4 text-shrebian-gold" />
            </Link>
            <button
              type="button"
              onClick={handlePosLogout}
              className="rounded-lg border border-shrebian-border bg-shrebian-card p-2 text-white hover:bg-shrebian-elevated"
              title={authKind === 'owner' ? 'Exit POS' : 'Sign out of employee POS'}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main POS Layout: Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left 7 Columns: Product Selection Grid */}
        <div className="lg:col-span-7 flex flex-col border-r border-shrebian-border overflow-hidden">
          <section className="m-4 mb-0 rounded-xl border border-shrebian-border bg-shrebian-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <MapPin className="h-4 w-4 text-shrebian-gold" />
                  {authKind === 'owner' ? 'Owner shift & location check-in' : 'Employee shift & location check-in'}
                </h2>
                <p className="mt-1 max-w-xl text-[11px] text-shrebian-muted">
                  {authKind === 'owner'
                    ? 'Owner access is verified by your secure admin login; no employee PIN is required. GPS is requested only when you check in.'
                    : 'Your own PIN authenticated this session. GPS is requested only when you check in.'}
                  {' '}Only the admin can view employee GPS; customers see selling-point locations only.
                </p>
              </div>
              {currentActiveSession && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                  ACTIVE: {currentActiveSession.shiftName}
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <select
                aria-label="Assigned selling point"
                value={currentSellingPoint?.id || ''}
                onChange={event => {
                  const point = sellingPoints.find(item => item.id === event.target.value);
                  if (point) setCurrentSellingPoint(point);
                }}
                disabled={authKind === 'employee'}
                className="rounded-lg border border-shrebian-border bg-shrebian-surface px-3 py-2 text-xs text-white disabled:opacity-70"
              >
                {sellingPoints
                  .filter(point => authKind === 'owner' || !currentEmployee.assignedSellingPointId || point.id === currentEmployee.assignedSellingPointId)
                  .map(point => <option key={point.id} value={point.id} disabled={!point.isActive}>{point.name} — {point.isActive ? 'Open' : 'Closed'}</option>)}
              </select>
              <select
                aria-label="Assigned shift"
                value={currentShiftScheduleId}
                onChange={event => setCurrentShiftScheduleId(event.target.value)}
                disabled={authKind === 'employee'}
                className="rounded-lg border border-shrebian-border bg-shrebian-surface px-3 py-2 text-xs text-white disabled:opacity-70"
              >
                {shiftSchedules.filter(schedule => schedule.status === 'active').map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name} — {schedule.defaultStartTime} to {schedule.defaultEndTime}{schedule.isOvernight ? ' (overnight)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShiftCheckIn}
                  disabled={checkingIn || !currentEmployee || !currentSellingPoint?.isActive || !currentShiftScheduleId}
                  className="rounded-lg bg-shrebian-red px-3 py-2 text-xs font-bold text-white hover:bg-shrebian-red-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkingIn ? 'Checking in…' : currentActiveSession ? 'Update GPS' : 'Check in & Start Shift'}
                </button>
              </div>
            </div>
            {currentSellingPoint && !currentSellingPoint.isActive && (
              <p className="mt-2 text-[11px] text-amber-300">This selling point is closed; GPS check-in is unavailable until it is active.</p>
            )}
            {checkInMessage && (
              <p role="status" className={`mt-2 text-[11px] ${checkInMessage.startsWith('Location check-in saved') ? 'text-emerald-400' : 'text-red-300'}`}>
                {checkInMessage}
              </p>
            )}
          </section>
          {/* Category Tabs */}
          <div className="flex border-b border-shrebian-border bg-shrebian-surface/60 p-2 gap-2">
            <button
              onClick={() => setActiveTab('shawarma')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'shawarma'
                  ? 'bg-shrebian-red text-white shadow-glowRed'
                  : 'bg-shrebian-card hover:bg-shrebian-elevated text-gray-300'
              }`}
            >
              <Flame className="w-4 h-4 text-shrebian-gold" />
              <span>SHAWARMAS (3 ITEMS)</span>
            </button>

            <button
              onClick={() => setActiveTab('drinks')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'drinks'
                  ? 'bg-shrebian-gold text-black shadow-glowGold'
                  : 'bg-shrebian-card hover:bg-shrebian-elevated text-gray-300'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>COLD CANS (NO GLASS)</span>
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === 'shawarma' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {shawarmas.map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="p-4 rounded-2xl bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border hover:border-shrebian-red flex flex-col justify-between text-left transition-all group relative overflow-hidden active:scale-95"
                  >
                    <div className="space-y-2">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40 mb-2">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-shrebian-gold leading-snug">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-shrebian-muted line-clamp-2">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-shrebian-border flex items-center justify-between w-full">
                      <span className="font-black text-lg text-white">Rs. {prod.sellingPrice}</span>
                      <span className="p-1.5 rounded-lg bg-shrebian-red text-white">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {drinks.map(drink => (
                  <button
                    key={drink.id}
                    onClick={() => addToCart(drink)}
                    className="p-4 rounded-xl bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border hover:border-shrebian-gold text-left transition-all active:scale-95 flex flex-col justify-between"
                  >
                    <div>
                      {['prod_drink_coke', 'prod_drink_pepsi', 'prod_drink_7up', 'prod_drink_sprite', 'prod_drink_rani', 'prod_drink_sting', 'prod_drink_mirinda'].includes(drink.id) && (
                        <div className="mb-2 aspect-square overflow-hidden rounded-lg bg-black/20">
                          <img
                            src={drink.imageUrl}
                            alt={drink.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="font-extrabold text-sm text-white">{drink.name}</div>
                      <div className="text-xs text-shrebian-muted">{drink.canSize || '250ml Can'}</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-shrebian-border flex items-center justify-between">
                      <span className="font-black text-sm text-shrebian-gold">Rs. {drink.sellingPrice}</span>
                      <span className="p-1 rounded bg-shrebian-surface text-white">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Active Bill, Mandatory Details & Finalization */}
        <div className="lg:col-span-5 flex flex-col bg-shrebian-surface justify-between overflow-hidden">
          {/* Header of Order Summary */}
          <div className="p-4 border-b border-shrebian-border bg-shrebian-card flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-white">CURRENT BILL / ORDER</h3>
              <p className="text-[11px] text-shrebian-muted">
                {currentSellingPoint?.name} • Operator: {currentEmployee?.fullName}
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => setCartItems([])}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-shrebian-muted space-y-2">
                <Store className="w-10 h-10 mx-auto text-gray-600" />
                <p className="text-xs">No items in bill. Select products from left grid.</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div
                  key={item.product.id}
                  className="p-3 rounded-xl bg-shrebian-card border border-shrebian-border flex items-center justify-between gap-3"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 shrink-0 rounded-lg object-cover bg-black/40"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-white truncate">{item.product.name}</h5>
                    <div className="text-[11px] text-shrebian-gold font-mono">
                      Rs. {item.product.sellingPrice} × {item.quantity} = Rs. {item.product.sellingPrice * item.quantity}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-shrebian-surface border border-shrebian-border flex items-center justify-center text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-shrebian-surface border border-shrebian-border flex items-center justify-center text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mandatory Customer Information Form */}
          <form onSubmit={handleCheckout} className="p-4 border-t border-shrebian-border bg-shrebian-card space-y-3">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Customer Name <span className="text-shrebian-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bilal Sheikh"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-shrebian-surface border border-shrebian-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-shrebian-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Customer Mobile <span className="text-shrebian-red">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="03XXXXXXXXX"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  className="w-full bg-shrebian-surface border border-shrebian-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-shrebian-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-shrebian-muted mb-1">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full bg-shrebian-surface border border-shrebian-border rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery" disabled={shawarmaCount < MIN_DELIVERY_SHAWARMA_COUNT}>
                    Delivery (5KM)
                  </option>
                </select>
                <p className="mt-1 text-[9px] leading-tight text-shrebian-muted">
                  Delivery requires at least {MIN_DELIVERY_SHAWARMA_COUNT} shawarmas.
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-shrebian-muted mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-shrebian-surface border border-shrebian-border rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="cash">Cash in Hand</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">Easypaisa</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-shrebian-muted mb-1">Discount (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  placeholder="0"
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full bg-shrebian-surface border border-shrebian-border rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Total and Print Button */}
            <div className="pt-2 border-t border-shrebian-border flex items-center justify-between">
              <div>
                <div className="text-[10px] text-shrebian-muted">Total Payable</div>
                <div className="text-xl font-black text-shrebian-gold">Rs. {grandTotal}</div>
              </div>

              <button
                type="submit"
                disabled={submitting || cartItems.length === 0}
                className="py-3 px-6 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover disabled:opacity-50 text-white font-extrabold text-xs tracking-wider shadow-glowRed transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{submitting ? 'RECORDING...' : 'FINALIZE & PRINT BILL'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-shrebian-surface border border-shrebian-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-shrebian-border">
              <h4 className="font-extrabold text-sm text-white">Bill Generated Successfully</h4>
              <button
                onClick={() => setConfirmedOrder(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close [ESC]
              </button>
            </div>

            {/* Receipt formatting */}
            <div id="thermal-receipt" className="p-3 bg-white text-black font-mono text-xs border border-gray-300 rounded space-y-1">
              <div className="text-center font-bold">
                SHREBIAN SHAWARMA<br />
                <span className="text-[10px] font-normal">HOME-MADE FOOD, MADE WITH LOVE</span><br />
                <span className="text-[9px]">Contact: 03120073794</span>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-1 text-[10px]">
                <div>Order #: <strong>{confirmedOrder.orderNumber}</strong></div>
                <div>Date & Time: {new Date(confirmedOrder.createdAt).toLocaleString()}</div>
                <div>Customer Name: {confirmedOrder.customerName}</div>
                <div>Customer Mobile: {confirmedOrder.customerMobile}</div>
                <div>Selling Point: {confirmedOrder.sellingPointName}</div>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span>Item</span>
                  <span>Qty | Price</span>
                </div>
                {confirmedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[150px]">{i.productName}</span>
                    <span>{i.quantity} × {i.unitPrice}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-gray-400 pt-1 text-right text-[11px] font-bold">
                {confirmedOrder.discount > 0 && <div>Discount: -Rs. {confirmedOrder.discount}</div>}
                <div className="text-sm">TOTAL: Rs. {confirmedOrder.grandTotal}</div>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-2 text-center text-[9px] text-gray-600">
                Served By: {confirmedOrder.employeeName}<br />
                Thank you for choosing SHREBIAN SHAWARMA!
              </div>
              <ReceiptPaymentOptions />
            </div>

            <ReceiptActions
              onPrint={handlePrint}
              whatsappUrl={getWhatsAppReceiptUrl(confirmedOrder)}
              onDone={() => setConfirmedOrder(null)}
              printLabel="PRINT (58/80MM)"
              doneLabel="NEW ORDER"
            />
          </div>
        </div>
      )}
    </div>
  );
}
