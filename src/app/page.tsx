'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  ChevronRight,
  Flame,
  Sparkles,
  ShieldCheck,
  Plus,
  Minus,
  X,
  ArrowRight
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { ReceiptActions } from '@/components/receipt/ReceiptActions';
import { ReceiptPaymentOptions } from '@/components/receipt/ReceiptPaymentOptions';
import { CartProvider, useCart } from '@/context/CartContext';
import { Product, SellingPoint, Order } from '@/types';
import { FIXED_DELIVERY_FEE, getShawarmaCount, MIN_DELIVERY_SHAWARMA_COUNT } from '@/lib/delivery';
import { getWhatsAppReceiptUrl } from '@/lib/whatsapp';

function StorefrontContent() {
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    deliveryFee,
    grandTotal,
    orderType,
    setOrderType,
    customerName,
    setCustomerName,
    customerMobile,
    setCustomerMobile,
    deliveryAddress,
    setDeliveryAddress,
    selectedSellingPoint,
    setSelectedSellingPoint
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [sellingPoints, setSellingPoints] = useState<SellingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [radiusAlert, setRadiusAlert] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, spRes] = await Promise.all([
          fetch('/api/products').then(r => r.json()),
          fetch('/api/selling-points').then(r => r.json())
        ]);
        if (prodRes.success) setProducts(prodRes.products);
        if (spRes.success) {
          setSellingPoints(spRes.sellingPoints);
          const firstActive = spRes.sellingPoints.find((s: SellingPoint) => s.isActive);
          if (firstActive && !selectedSellingPoint) {
            setSelectedSellingPoint(firstActive);
          }
        }
      } catch (err) {
        console.error('Failed to fetch storefront data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const shawarmas = products.filter(p => p.category === 'shawarma');
  const cannedDrinks = products.filter(p => p.category === 'canned_drink');
  const shawarmaCount = getShawarmaCount(items);

  useEffect(() => {
    if (orderType === 'delivery' && shawarmaCount < MIN_DELIVERY_SHAWARMA_COUNT) {
      setOrderType('takeaway');
      setErrorMessage('Delivery requires at least 2 shawarmas.');
    }
  }, [orderType, shawarmaCount, setOrderType]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Customer full name is compulsory.');
      return;
    }
    const cleanMobile = customerMobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMessage('A valid mobile number is compulsory before order confirmation.');
      return;
    }
    if (!selectedSellingPoint) {
      setErrorMessage('Please select your nearest selling point.');
      return;
    }
    if (orderType === 'delivery' && shawarmaCount < MIN_DELIVERY_SHAWARMA_COUNT) {
      setErrorMessage('Delivery requires at least 2 shawarmas.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Delivery address is compulsory for delivery orders.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const payload = {
        channel: 'website',
        orderType,
        customerName,
        customerMobile: cleanMobile,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        sellingPointId: selectedSellingPoint.id,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          instructions: i.instructions
        })),
        paymentMethod: 'cash', // Cash on Delivery / Pay at point
        deliveryCharges: orderType === 'delivery' ? FIXED_DELIVERY_FEE : 0
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setConfirmedOrder(data.order);
        clearCart();
        setCheckoutOpen(false);
      } else {
        setErrorMessage(data.error || 'Failed to place order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-shrebian-bg text-shrebian-text">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-shrebian-red to-red-800 text-white py-1.5 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2">
        <Flame className="w-4 h-4 text-shrebian-gold animate-pulse" />
        <span>HOME-MADE FOOD, MADE WITH LOVE • LAHORE OFFICIAL: 03120073794 (JAZZCASH / EASYPAISA)</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-shrebian-surface/90 backdrop-blur-md border-b border-shrebian-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" />

          {/* Navigation & Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="#selling-points"
              className="hidden md:flex items-center gap-1.5 text-xs text-shrebian-muted hover:text-white transition-colors"
            >
              <MapPin className="w-4 h-4 text-shrebian-red" />
              <span>Lahore Selling Points</span>
            </Link>

            <Link
              href="/pos"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-shrebian-border bg-shrebian-card hover:bg-shrebian-elevated text-xs font-medium text-white transition-all shadow-sm"
            >
              <Store className="w-3.5 h-3.5 text-shrebian-gold" />
              <span>Staff POS</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-shrebian-red hover:bg-shrebian-red-hover text-xs font-bold text-white transition-all shadow-glowRed"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Portal</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border text-white transition-all shadow-md group"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-shrebian-gold group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-shrebian-red text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-shrebian-surface animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-shrebian-border">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-shrebian-red/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-shrebian-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-shrebian-card border border-shrebian-border text-shrebian-gold text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lahore&apos;s Premium Food-Tech Shawarma Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                HOME-MADE FOOD, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-shrebian-gold via-yellow-400 to-shrebian-red">
                  MADE WITH LOVE.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-shrebian-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Authentic Arabic recipes, prepared with 100g juicy chicken, artisanal khameeri roti, and secret garlic mayo. Served fresh at your nearest active Lahore selling point.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#menu"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-shrebian-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm tracking-wide shadow-glowRed transition-all flex items-center gap-2 group"
                >
                  <span>ORDER NOW</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#selling-points"
                  className="px-6 py-3.5 rounded-xl bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border text-white font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-shrebian-gold" />
                  <span>FIND SELLING POINT</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-shrebian-border/60 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-shrebian-gold">400g</div>
                  <div className="text-xs text-shrebian-muted">Total Packed Weight</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-shrebian-red">5 KM</div>
                  <div className="text-xs text-shrebian-muted">Delivery Radius</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-shrebian-muted">Cans Only • No Glass</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero kitchen image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-shrebian-border shadow-2xl bg-shrebian-card group">
                <img
                  src="/images/brand/hero-kitchen.png"
                  alt="Shrebian Shawarma kitchen with fresh ingredients and shawarma grill"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-shrebian-red text-[10px] font-bold">
                    OUR KITCHEN
                  </span>
                  <p className="font-bold text-sm">Fresh shawarma, made with love.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Points & Map Section */}
      <section id="selling-points" className="py-16 bg-shrebian-surface/50 border-b border-shrebian-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-white">
              LIVE LAHORE SELLING POINTS
            </h2>
            <p className="text-sm text-shrebian-muted">
              We operate mobile A-Stands and pickup points across Lahore. Check real-time shift availability and 5 KM delivery coverage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellingPoints.map(sp => {
              const isSelected = selectedSellingPoint?.id === sp.id;
              return (
                <div
                  key={sp.id}
                  onClick={() => setSelectedSellingPoint(sp)}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-shrebian-card border-shrebian-gold shadow-glowGold'
                      : 'bg-shrebian-surface border-shrebian-border hover:border-gray-600'
                  }`}
                >
                  <div className="space-y-3">
                    {sp.imageUrl && (
                      <div className="relative h-40 overflow-hidden rounded-xl">
                        <Image src={sp.imageUrl} alt={`${sp.name} selling point`} fill unoptimized className="object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        sp.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sp.isActive ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
                        {sp.isActive ? 'OPEN NOW' : 'CLOSED'}
                      </span>
                      <span className="text-[11px] text-shrebian-muted font-mono">{sp.deliveryRadiusKm} KM RADIUS</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-white">{sp.name}</h3>
                      <p className="text-xs text-shrebian-muted mt-0.5">{sp.area}</p>
                      <p className="text-xs text-gray-300 mt-1">{sp.address}</p>
                    </div>

                    <div className="text-xs space-y-1 pt-2 border-t border-shrebian-border">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-shrebian-gold shrink-0" />
                        <span>{sp.operatingHours}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-shrebian-red shrink-0" />
                        <span>Takeaway: Yes • Delivery: {sp.deliveryAvailable ? 'Available' : 'Unavailable'}</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${sp.address}, ${sp.area}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={event => event.stopPropagation()}
                        className="inline-flex items-center gap-1 pt-1 text-cyan-300 hover:text-cyan-200"
                      >
                        <MapPin className="h-3 w-3" />
                        Open selling point in Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-shrebian-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-shrebian-gold">
                      {isSelected ? '✓ Selected Point' : 'Click to Select'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Shawarmas */}
          <div>
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <div className="inline-flex items-center gap-2 text-shrebian-red text-xs font-bold tracking-widest uppercase">
                <Flame className="w-4 h-4" />
                <span>FRESH • HOMEMADE • DELICIOUS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">SIGNATURE SHAWARMA MENU</h2>
              <p className="text-sm text-shrebian-muted">
                Crafted using authentic Arabic techniques, fresh khameeri roti, and 100g premium chicken.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {shawarmas.map(prod => (
                <div
                  key={prod.id}
                  className="rounded-2xl bg-shrebian-card border border-shrebian-border overflow-hidden flex flex-col justify-between hover:border-shrebian-red transition-all duration-300 group shadow-lg"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-black/40">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-contain transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-shrebian-bg/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-shrebian-gold border border-shrebian-border">
                      {prod.weightGrams ? `${prod.weightGrams}g Portion` : 'Premium'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-lg text-white group-hover:text-shrebian-gold transition-colors">
                          {prod.name}
                        </h3>
                      </div>
                      <p className="text-xs text-shrebian-muted line-clamp-3 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-shrebian-border">
                      {/* Price & Add to Cart */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-shrebian-muted">Price</div>
                          <div className="text-2xl font-black text-white">
                            Rs. {prod.sellingPrice}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            addToCart(prod, 1);
                            setCartOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-white text-xs font-bold tracking-wide shadow-glowRed transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>ADD TO CART</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canned Drinks (STRICTLY CANS ONLY, NO GLASS BOTTLES) */}
          <div>
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 text-shrebian-gold text-xs font-bold tracking-widest uppercase">
                <Sparkles className="w-4 h-4" />
                <span>CHILLED IN EMPLOYEE COLD BOX</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">COLD DRINKS & JUICE CANS</h2>
              <p className="text-xs text-shrebian-muted">
                100% Cans only. Absolutely no glass bottles. Kept ice-cold in personal cold boxes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {cannedDrinks.map(drink => (
                <div
                  key={drink.id}
                  className="rounded-xl bg-shrebian-surface border border-shrebian-border p-5 flex flex-col justify-between hover:border-shrebian-gold transition-all group"
                >
                  <div className="space-y-2">
                    {drink.imageUrl ? (
                      <div className="aspect-square overflow-hidden rounded-lg bg-black/20">
                        <img
                          src={drink.imageUrl}
                          alt={drink.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 mx-auto rounded-lg bg-shrebian-card flex items-center justify-center text-shrebian-gold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                    <div className="text-center">
                      <h4 className="font-bold text-sm text-white group-hover:text-shrebian-gold transition-colors">
                        {drink.name}
                      </h4>
                      <p className="text-xs text-shrebian-muted mt-1">{drink.canSize || '250ml Can'}</p>
                      {drink.id === 'prod_drink_apricot' && (
                        <p className="text-xs text-shrebian-muted mt-2 leading-relaxed">
                          {drink.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-shrebian-border flex items-center justify-between">
                    <span className="text-sm font-black text-white">Rs. {drink.sellingPrice}</span>
                    <button
                      onClick={() => {
                        addToCart(drink, 1);
                        setCartOpen(true);
                      }}
                      className="p-2 rounded-lg bg-shrebian-card hover:bg-shrebian-red text-white transition-colors"
                      title="Add Can to Cart"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step Making Process Infographic Section */}
      <section className="py-16 bg-shrebian-surface/40 border-y border-shrebian-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-shrebian-gold tracking-widest uppercase">
              AUTHENTIC ARABIC SHAWARMA
            </span>
            <h2 className="text-3xl font-black text-white">STEP-BY-STEP MAKING PROCESS</h2>
            <p className="text-sm text-shrebian-muted">
              Quality you can trust. Every single shawarma is made fresh with weighed ingredients and strict hygiene.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { step: "1", title: "Apply White Sauce", desc: "Thin naan with Thom garlic sauce." },
              { step: "2", title: "100g Chicken", desc: "Grilled, juicy crunchy chicken." },
              { step: "3", title: "6 Pickles", desc: "Fresh crispy cucumber half cuts." },
              { step: "4", title: "Load French Fries", desc: "Golden fried potatoes on top." },
              { step: "5", title: "Wrap Shawarma", desc: "Rolled in Shrebian butter paper." },
              { step: "6", title: "Ready to Serve", desc: "Served hot in 400g packed bag!" }
            ].map(s => (
              <div key={s.step} className="rounded-xl p-4 bg-shrebian-card border border-shrebian-border space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-shrebian-red text-white font-black text-sm flex items-center justify-center shadow-glowRed">
                  {s.step}
                </div>
                <h4 className="font-bold text-xs text-white">{s.title}</h4>
                <p className="text-[11px] text-shrebian-muted leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-shrebian-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div>
            <Logo size="md" />
            <p className="text-xs text-shrebian-muted mt-2 max-w-xs">
              Home-made food, made with love. Lahore, Pakistan.
            </p>
          </div>

          <div className="space-y-1 text-xs text-gray-400">
            <div className="font-bold text-white mb-2 uppercase tracking-wider text-xs">Official Business Contacts</div>
            <div>Owner: <span className="text-white font-medium">Kaleem Durrani</span></div>
            <div>Official Helpline: <span className="text-shrebian-gold font-bold">03120073794</span></div>
            <div>JazzCash / Easypaisa: <span className="text-shrebian-gold font-bold">03120073794</span></div>
            <div>Location: <span className="text-white">Model Town / Gulberg / DHA, Lahore</span></div>
          </div>

          <div className="space-y-3 flex flex-col items-center md:items-end">
            <div className="flex gap-3">
              <Link
                href="/pos"
                className="px-4 py-2 rounded-lg bg-shrebian-surface border border-shrebian-border text-xs font-semibold text-white hover:border-shrebian-gold transition-colors"
              >
                Employee POS
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg bg-shrebian-red text-xs font-bold text-white hover:bg-shrebian-red-hover transition-colors"
              >
                Admin Control
              </Link>
            </div>
            <p className="text-[11px] text-shrebian-muted">
              © {new Date().getFullYear()} SHREBIAN SHAWARMA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-shrebian-surface border-l border-shrebian-border h-full flex flex-col justify-between shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-shrebian-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-shrebian-gold" />
                <h3 className="font-bold text-lg text-white">Your Order Cart</h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 rounded-lg hover:bg-shrebian-card text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="text-sm text-shrebian-muted">Your cart is currently empty.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="px-4 py-2 rounded-lg bg-shrebian-card text-xs font-bold text-white hover:bg-shrebian-elevated"
                  >
                    View Menu
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-xl bg-shrebian-card border border-shrebian-border flex items-center justify-between gap-3"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 shrink-0 rounded-lg object-cover bg-black/40"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">{item.product.name}</h4>
                      <div className="text-[11px] text-shrebian-gold font-mono mt-0.5">
                        Rs. {item.product.sellingPrice} × {item.quantity} = Rs. {item.product.sellingPrice * item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-shrebian-surface border border-shrebian-border flex items-center justify-center text-white hover:bg-shrebian-red"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-shrebian-surface border border-shrebian-border flex items-center justify-center text-white hover:bg-shrebian-gold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="pt-4 border-t border-shrebian-border space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-shrebian-muted">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-shrebian-muted">
                    <span>Delivery (5 KM Radius)</span>
                    <span>{orderType === 'delivery' ? `Rs. ${deliveryFee}` : 'Takeaway (Free)'}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-shrebian-border">
                    <span>Total Amount</span>
                    <span className="text-shrebian-gold">Rs. {grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-white text-xs font-extrabold tracking-wider shadow-glowRed transition-all flex items-center justify-center gap-2"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-shrebian-surface border border-shrebian-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-shrebian-border">
              <div>
                <h3 className="font-extrabold text-xl text-white">Confirm Your Order</h3>
                <p className="text-xs text-shrebian-muted">Please provide mandatory customer details</p>
              </div>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="p-1 rounded-lg hover:bg-shrebian-card text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Order Type Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    orderType === 'takeaway'
                      ? 'bg-shrebian-gold text-black border-shrebian-gold'
                      : 'bg-shrebian-card border-shrebian-border text-gray-300'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>TAKEAWAY</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (shawarmaCount >= MIN_DELIVERY_SHAWARMA_COUNT) {
                      setErrorMessage('');
                      setOrderType('delivery');
                    }
                  }}
                  disabled={shawarmaCount < MIN_DELIVERY_SHAWARMA_COUNT}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    orderType === 'delivery'
                      ? 'bg-shrebian-red text-white border-shrebian-red'
                      : 'bg-shrebian-card border-shrebian-border text-gray-300'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Truck className="w-4 h-4" />
                  <span>DELIVERY (5 KM)</span>
                </button>
              </div>
              <p className="text-[10px] text-shrebian-muted">
                Delivery requires at least {MIN_DELIVERY_SHAWARMA_COUNT} shawarmas.
              </p>

              {/* Selling Point Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Assigned Selling Point
                </label>
                <select
                  value={selectedSellingPoint?.id || ''}
                  onChange={(e) => {
                    const sp = sellingPoints.find(s => s.id === e.target.value);
                    if (sp) setSelectedSellingPoint(sp);
                  }}
                  className="w-full bg-shrebian-card border border-shrebian-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-shrebian-gold"
                >
                  {sellingPoints.map(sp => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} — {sp.isActive ? 'Active Shift' : 'Closed'} ({sp.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Details (MANDATORY) */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Customer Full Name <span className="text-shrebian-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Farooq"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-shrebian-card border border-shrebian-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-shrebian-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Mobile Number (Compulsory for Confirmation) <span className="text-shrebian-red">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className="w-full bg-shrebian-card border border-shrebian-border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-shrebian-gold"
                  />
                  <span className="text-[10px] text-shrebian-muted">WhatsApp updates will be sent to this number.</span>
                </div>

                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Delivery Address in Lahore (Within 5 KM) <span className="text-shrebian-red">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Street / Block, Lahore"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-shrebian-card border border-shrebian-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-shrebian-gold"
                    />
                  </div>
                )}
              </div>

              {/* Bill Breakdown */}
              <div className="p-3.5 rounded-xl bg-shrebian-card border border-shrebian-border space-y-1.5 text-xs">
                <div className="flex justify-between text-shrebian-muted">
                  <span>Items Total ({totalItems})</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between text-shrebian-muted">
                  <span>Delivery Charges</span>
                  <span>Rs. {deliveryFee}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-shrebian-border">
                  <span>Net Payable Amount</span>
                  <span className="text-shrebian-gold">Rs. {grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderSubmitting}
                className="w-full py-3.5 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-white text-xs font-bold tracking-wider shadow-glowRed transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {orderSubmitting ? (
                  <span>CONFIRMING ORDER...</span>
                ) : (
                  <>
                    <span>CONFIRM ORDER (Rs. {grandTotal})</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmed Order & Thermal Receipt Print Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-shrebian-surface border border-shrebian-border rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-white">Order Confirmed!</h3>
              <p className="text-xs text-shrebian-muted">
                Order #{confirmedOrder.orderNumber} has been received and sent to {confirmedOrder.sellingPointName}.
              </p>
            </div>

            {/* Screen Receipt Preview */}
            <div id="thermal-receipt" className="p-4 rounded-xl bg-white text-black font-mono text-xs space-y-2 border border-gray-300">
              <div className="text-center font-bold text-sm">
                SHREBIAN SHAWARMA<br />
                <span className="text-[10px] font-normal">HOME-MADE FOOD, MADE WITH LOVE</span><br />
                <span className="text-[9px]">LAHORE • HELPLINE: 03120073794</span>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-1 text-[11px] space-y-0.5">
                <div>Order: <strong>{confirmedOrder.orderNumber}</strong></div>
                <div>Date: {confirmedOrder.businessDate} ({new Date(confirmedOrder.createdAt).toLocaleTimeString()})</div>
                <div>Customer: {confirmedOrder.customerName} ({confirmedOrder.customerMobile})</div>
                <div>Point: {confirmedOrder.sellingPointName}</div>
                <div>Type: {confirmedOrder.orderType.toUpperCase()}</div>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-1">
                <div className="flex justify-between font-bold text-[10px] pb-1">
                  <span>ITEM</span>
                  <span>QTY × PRICE</span>
                </div>
                {confirmedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">{i.productName}</span>
                    <span>{i.quantity} × {i.unitPrice}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-gray-400 pt-1 text-right space-y-0.5 text-[11px]">
                <div>Subtotal: Rs. {confirmedOrder.subtotal}</div>
                {confirmedOrder.deliveryCharges > 0 && <div>Delivery: Rs. {confirmedOrder.deliveryCharges}</div>}
                {confirmedOrder.discount > 0 && <div>Discount: -Rs. {confirmedOrder.discount}</div>}
                <div className="font-bold text-sm border-t border-black pt-1">TOTAL: Rs. {confirmedOrder.grandTotal}</div>
              </div>
              <div className="border-t border-dashed border-gray-400 pt-2 text-center text-[10px] text-gray-600">
                Freshly Made. Lovingly Served.<br />
                Served By: {confirmedOrder.employeeName}<br />
                JazzCash / Easypaisa: 03120073794
              </div>
              <ReceiptPaymentOptions />
            </div>

            <ReceiptActions
              onPrint={handlePrintReceipt}
              whatsappUrl={getWhatsAppReceiptUrl(confirmedOrder)}
              onDone={() => setConfirmedOrder(null)}
              printLabel="PRINT RECEIPT (58/80mm)"
              doneLabel="DONE"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function StorefrontPage() {
  return (
    <CartProvider>
      <StorefrontContent />
    </CartProvider>
  );
}
