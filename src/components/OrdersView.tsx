/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Printer,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Scissors,
  Check,
  ChevronDown,
  Eye,
  Users
} from 'lucide-react';
import { Customer, FamilyMember, BespokeMeasurements, Order, OrderItem, OrderStatus, Product, UserAccount } from '../types/index.ts';

interface OrdersViewProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  currentUser: UserAccount;
  preselectedCustomer?: Customer | null;
  preselectedMember?: FamilyMember | null;
  onCreateOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onCancelOrder: (orderId: string, restock: boolean, reason: string) => void;
  onSelectOrderForPrint: (order: Order) => void;
  onOpenWhatsApp?: (customerId: string) => void;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onOpenCreateModal: () => void;
  availableCities?: string[];
  onAddCity?: (city: string) => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Draft',
  'Fabric Cut',
  'In Tailoring',
  'Fitting Scheduled',
  'Ready for Dispatch',
  'Dispatched',
  'Delivered',
  'Completed',
  'Cancelled',
];

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  products,
  customers,
  currentUser,
  preselectedCustomer,
  preselectedMember,
  onCreateOrder,
  onUpdateOrderStatus,
  onCancelOrder,
  onSelectOrderForPrint,
  onOpenWhatsApp,
  isCreateModalOpen,
  onCloseCreateModal,
  onOpenCreateModal,
  availableCities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan', 'Sialkot', 'Gujranwala'],
  onAddCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [rushOnlyFilter, setRushOnlyFilter] = useState(false);

  // Cancellation modal
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Client requested event date postponement');
  const [restockOnCancel, setRestockOnCancel] = useState(true);

  // Order detail inspection modal
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  // Create Order Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedCustomer?.id || customers[0]?.id || ''
  );
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>(
    preselectedMember?.id || ''
  );
  const [showMeasurementsInForm, setShowMeasurementsInForm] = useState(false);
  const [orderMeasurements, setOrderMeasurements] = useState<BespokeMeasurements>({
    chest: 40.0,
    waist: 34.0,
    hip: 40.0,
    shoulder: 18.0,
    sleeve: 25.0,
    jacketLength: 30.0,
    collar: 16.0,
    trouserWaist: 34.0,
    trouserLength: 41.0,
    inseam: 31.0,
    thigh: 24.0,
    lapelStyle: 'Peak Lapel',
    ventStyle: 'Double Vent',
    customNotes: '',
  });

  const [isNewCustomer, setIsNewCustomer] = useState(customers.length === 0);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+92 300 ');
  const [newCustCity, setNewCustCity] = useState<string>('Lahore');
  const [isCustomCityInput, setIsCustomCityInput] = useState(false);
  const [newCustAddress, setNewCustAddress] = useState('');

  // Default to new customer if no customers exist
  React.useEffect(() => {
    if (customers.length === 0) {
      setIsNewCustomer(true);
    }
  }, [customers]);

  // Synchronize customer and family member selection
  React.useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomerId(preselectedCustomer.id);
    }
  }, [preselectedCustomer]);

  React.useEffect(() => {
    if (preselectedMember) {
      setSelectedFamilyMemberId(preselectedMember.id);
      if (preselectedMember.currentMeasurements) {
        setOrderMeasurements({ ...preselectedMember.currentMeasurements });
      }
    } else {
      const cust = customers.find((c) => c.id === selectedCustomerId);
      if (cust && cust.familyMembers && cust.familyMembers.length > 0) {
        const firstMember = cust.familyMembers[0];
        setSelectedFamilyMemberId(firstMember.id);
        if (firstMember.currentMeasurements) {
          setOrderMeasurements({ ...firstMember.currentMeasurements });
        }
      }
    }
  }, [selectedCustomerId, preselectedMember, customers]);

  // Items in new order
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      productId: products[0]?.id || '',
      productCode: products[0]?.code || '',
      title: products[0]?.title || '',
      fabric: products[0]?.fabric || '',
      color: products[0]?.color || '',
      sizeOrTailoring: 'Bespoke Custom',
      quantity: 1,
      unitPricePKR: products[0]?.pricePKR || 0,
      totalPricePKR: products[0]?.pricePKR || 0,
    },
  ]);

  const [tailoringFee, setTailoringFee] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Bank Transfer / Raast' | 'POS Card' | 'Cash at Atelier'>('Bank Transfer / Raast');
  const [deliveryDate, setDeliveryDate] = useState<string>(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [eventDate, setEventDate] = useState<string>('');
  const [isRushOrder, setIsRushOrder] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Calculations
  const itemsSubtotal = orderItems.reduce((sum, item) => sum + item.totalPricePKR, 0);
  const grandTotal = Math.max(0, itemsSubtotal + tailoringFee + shippingFee - discountAmount);
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  // Filtered orders with universal search: main customer, family member, order #, phone, city, product code
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      const matchesStatus = selectedStatusFilter === 'All' || o.status === selectedStatusFilter;
      const matchesRush = !rushOnlyFilter || o.isRushOrder;
      return matchesStatus && matchesRush;
    }

    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.familyMemberName && o.familyMemberName.toLowerCase().includes(q)) ||
      (o.familyMemberRelationship && o.familyMemberRelationship.toLowerCase().includes(q)) ||
      (currentUser.permissions.canViewCustomerPhone && o.customerPhone.toLowerCase().includes(q)) ||
      o.customerCity.toLowerCase().includes(q) ||
      o.items.some(
        (it) => it.productCode.toLowerCase().includes(q) || it.title.toLowerCase().includes(q)
      );

    const matchesStatus = selectedStatusFilter === 'All' || o.status === selectedStatusFilter;
    const matchesRush = !rushOnlyFilter || o.isRushOrder;

    return matchesSearch && matchesStatus && matchesRush;
  });

  const handleAddItemToOrder = () => {
    const firstP = products[0];
    if (!firstP) return;
    setOrderItems([
      ...orderItems,
      {
        productId: firstP.id,
        productCode: firstP.code,
        title: firstP.title,
        fabric: firstP.fabric,
        color: firstP.color,
        sizeOrTailoring: '40R',
        quantity: 1,
        unitPricePKR: firstP.pricePKR,
        totalPricePKR: firstP.pricePKR,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems];
    if (field === 'productId') {
      const selectedP = products.find((p) => p.id === value);
      if (selectedP) {
        updated[index].productId = selectedP.id;
        updated[index].productCode = selectedP.code;
        updated[index].title = selectedP.title;
        updated[index].fabric = selectedP.fabric;
        updated[index].color = selectedP.color;
        updated[index].unitPricePKR = selectedP.pricePKR;
        updated[index].totalPricePKR = selectedP.pricePKR * updated[index].quantity;
      }
    } else if (field === 'quantity') {
      const q = Math.max(1, Number(value));
      updated[index].quantity = q;
      updated[index].totalPricePKR = updated[index].unitPricePKR * q;
    } else if (field === 'unitPricePKR') {
      const p = Math.max(0, Number(value));
      updated[index].unitPricePKR = p;
      updated[index].totalPricePKR = p * updated[index].quantity;
    } else {
      (updated[index] as any)[field] = value;
    }
    setOrderItems(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalCustomerId = selectedCustomerId;
    let finalCustName = '';
    let finalCustPhone = '';
    let finalCustCity = '';
    let finalCustAddress = '';
    let memberId: string | undefined;
    let memberName: string | undefined;
    let memberRel: string | undefined;
    let customFieldsSnap: Record<string, string | number> | undefined;

    if (isNewCustomer || customers.length === 0) {
      finalCustomerId = `cust_${Date.now()}`;
      finalCustName = newCustName.trim() || 'Bespoke Client';
      finalCustPhone = newCustPhone.trim() || '+92 300 0000000';
      finalCustCity = newCustCity;
      finalCustAddress = newCustAddress.trim() || 'Gulberg III, Lahore';
      memberRel = 'Self';
      memberName = finalCustName;
    } else {
      const existing = customers.find((c) => c.id === selectedCustomerId) || customers[0];
      if (existing) {
        finalCustomerId = existing.id;
        finalCustName = existing.name;
        finalCustPhone = existing.phone;
        finalCustCity = existing.city;
        finalCustAddress = existing.address;

        const currentMem =
          existing.familyMembers?.find((m) => m.id === selectedFamilyMemberId) ||
          existing.familyMembers?.[0];

        if (currentMem) {
          memberId = currentMem.id;
          memberName = currentMem.name;
          memberRel = currentMem.relationship;
          customFieldsSnap = currentMem.customFields;
        }
      } else {
        finalCustomerId = `cust_${Date.now()}`;
        finalCustName = 'Bespoke Client';
        finalCustPhone = '+92 300 0000000';
        finalCustCity = 'Lahore';
        finalCustAddress = 'Gulberg III, Lahore';
        memberRel = 'Self';
        memberName = finalCustName;
      }
    }

    const paymentStatus = balanceDue === 0 ? 'Paid' : (advancePaid > 0 ? 'Partial' : 'Unpaid');

    onCreateOrder({
      customerId: finalCustomerId,
      customerName: finalCustName,
      customerPhone: finalCustPhone,
      customerCity: finalCustCity,
      customerAddress: finalCustAddress,
      familyMemberId: memberId,
      familyMemberName: memberName,
      familyMemberRelationship: memberRel,
      items: orderItems,
      subtotalPKR: itemsSubtotal,
      tailoringFeePKR: tailoringFee,
      discountPKR: discountAmount,
      shippingFeePKR: shippingFee,
      grandTotalPKR: grandTotal,
      advancePaidPKR: advancePaid,
      balanceDuePKR: balanceDue,
      paymentStatus,
      paymentMethod,
      status: 'In Tailoring',
      isRushOrder,
      eventDate,
      deliveryDate,
      measurementsSnapshot: { ...orderMeasurements },
      customFieldsSnapshot: customFieldsSnap,
      specialInstructions,
    });

    onCloseCreateModal();
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder) return;
    onCancelOrder(cancellingOrder.id, restockOnCancel, cancelReason);
    setCancellingOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-serif-display">
            Bespoke Suit Orders &amp; Production Pipeline
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage tailor stages, client delivery dates, measurements, and thermal receipt generation
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Suit Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentUser.permissions.canViewCustomerPhone ? "Search by Order # (e.g. ZS-2026-1042), client name, phone or city..." : "Search by Order # (e.g. ZS-2026-1042), client name or city..."}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={rushOnlyFilter}
              onChange={(e) => setRushOnlyFilter(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Show Wedding Rush Orders Only</span>
          </label>
        </div>

        {/* Status filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
          {['All', ...ORDER_STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                selectedStatusFilter === st
                  ? 'bg-amber-400 text-neutral-950 font-semibold'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium bg-neutral-950/60">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Client Details</th>
                <th className="py-3.5 px-4">Suit &amp; Fabric Specs</th>
                <th className="py-3.5 px-4">Target Delivery</th>
                <th className="py-3.5 px-4 text-right">Grand Total (PKR)</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4">Production Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  return (
                    <tr key={ord.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-amber-400">
                        <div className="flex items-center gap-1.5">
                          <span>{ord.orderNumber}</span>
                          {ord.isRushOrder && (
                            <span className="text-[10px] text-red-400 bg-red-950/50 border border-red-800/40 px-1 rounded">
                              Rush
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-sans">
                          {ord.createdAt.slice(0, 10)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{ord.customerName}</div>
                        {ord.familyMemberName && ord.familyMemberRelationship !== 'Self' && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-400/10 text-amber-300 border border-amber-400/20">
                              Attn: {ord.familyMemberName} ({ord.familyMemberRelationship})
                            </span>
                          </div>
                        )}
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {ord.customerCity}{currentUser.permissions.canViewCustomerPhone ? ` · ${ord.customerPhone}` : ''}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-xs">
                          {currentUser.permissions.canViewCustomerAddress ? ord.customerAddress : `${ord.customerCity} · [Address Hidden]`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="mb-1 last:mb-0">
                            <div className="font-medium text-neutral-200 truncate">
                              {item.quantity}x {item.title}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate">
                              {item.fabric} ({item.sizeOrTailoring})
                            </div>
                          </div>
                        ))}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{ord.deliveryDate}</span>
                        </div>
                        {ord.eventDate && (
                          <div className="text-[10px] text-neutral-500">
                            Event: {ord.eventDate}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-numbers">
                        <div className="font-semibold text-white">
                          Rs. {ord.grandTotalPKR.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-emerald-400">
                          Paid: Rs. {ord.advancePaidPKR.toLocaleString()}
                        </div>
                        {ord.balanceDuePKR > 0 && (
                          <div className="text-[10px] text-amber-400">
                            Bal: Rs. {ord.balanceDuePKR.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : ord.paymentStatus === 'Partial'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            : 'bg-red-950 text-red-400 border border-red-800/40'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {ord.paymentMethod}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {ord.status === 'Cancelled' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-red-950 text-red-400 border border-red-800">
                            Cancelled
                          </span>
                        ) : (
                          <select
                            value={ord.status}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="text-xs bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-neutral-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            {ORDER_STATUSES.filter((s) => s !== 'Cancelled').map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingOrder(ord)}
                            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Inspect Order Details & Measurements Snapshot"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectOrderForPrint(ord)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="Print Thermal POS Receipt (58mm/80mm)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {ord.status !== 'Cancelled' && (
                            <button
                              onClick={() => {
                                setCancellingOrder(ord);
                                setCancelReason('Customer wedding postponed');
                                setRestockOnCancel(true);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                              title="Cancel order & restock"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
              <div>
                <h2 className="text-base font-semibold text-white">New Bespoke Suit Order</h2>
                <div className="text-xs text-neutral-400">
                  Select garments, enter measurements, schedule trial fitting &amp; record advance
                </div>
              </div>
              <button
                onClick={onCloseCreateModal}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[82vh] text-xs">
              {/* Customer Selector */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200">Client Information</span>
                  {customers.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setIsNewCustomer(!isNewCustomer)}
                      className="text-amber-400 hover:text-amber-300 font-medium"
                    >
                      {isNewCustomer ? 'Select Existing Client' : '+ Register New Client'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-mono">New Client Record</span>
                  )}
                </div>

                {!isNewCustomer ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-neutral-400 mb-1">Select Primary Client</label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => {
                          const cid = e.target.value;
                          setSelectedCustomerId(cid);
                          const cust = customers.find((c) => c.id === cid);
                          if (cust && cust.familyMembers && cust.familyMembers.length > 0) {
                            setSelectedFamilyMemberId(cust.familyMembers[0].id);
                            if (cust.familyMembers[0].currentMeasurements) {
                              setOrderMeasurements({ ...cust.familyMembers[0].currentMeasurements });
                            }
                          }
                        }}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city}{currentUser.permissions.canViewCustomerPhone ? ` - ${c.phone}` : ''}) - {c.familyMembers?.length || 1} Members
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Family Member Assignment */}
                    {(() => {
                      const cust = customers.find((c) => c.id === selectedCustomerId);
                      const members = cust?.familyMembers || [];
                      return members.length > 0 ? (
                        <div className="pt-2 border-t border-neutral-900 space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-neutral-400">
                              Tailor Order For Family Member:
                            </label>
                            <span className="text-[10px] text-amber-400 font-mono">
                              {members.length} Family Members Registered
                            </span>
                          </div>
                          <select
                            value={selectedFamilyMemberId}
                            onChange={(e) => {
                              setSelectedFamilyMemberId(e.target.value);
                              const mem = members.find((m) => m.id === e.target.value);
                              if (mem && mem.currentMeasurements) {
                                setOrderMeasurements({ ...mem.currentMeasurements });
                              }
                            }}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-medium focus:outline-none focus:border-amber-500"
                          >
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.relationship}){m.isArchived ? ' [Archived]' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null;
                    })()}

                    {/* Order Cutting Measurements Snapshot */}
                    <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-semibold">
                          <Scissors className="w-3.5 h-3.5 text-amber-400" />
                          <span>Order Cutting Measurements (Immutable Snapshot)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMeasurementsInForm(!showMeasurementsInForm)}
                          className="text-amber-400 hover:text-amber-300 text-[11px] font-medium"
                        >
                          {showMeasurementsInForm ? 'Hide Details' : 'Fine-Tune Order Specs'}
                        </button>
                      </div>

                      {showMeasurementsInForm ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-0.5">Chest (Inches)</label>
                            <input
                              type="number"
                              step="0.25"
                              value={orderMeasurements.chest}
                              onChange={(e) => setOrderMeasurements({ ...orderMeasurements, chest: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-0.5">Waist (Inches)</label>
                            <input
                              type="number"
                              step="0.25"
                              value={orderMeasurements.waist}
                              onChange={(e) => setOrderMeasurements({ ...orderMeasurements, waist: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-0.5">Hips (Inches)</label>
                            <input
                              type="number"
                              step="0.25"
                              value={orderMeasurements.hip}
                              onChange={(e) => setOrderMeasurements({ ...orderMeasurements, hip: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-0.5">Shoulder</label>
                            <input
                              type="number"
                              step="0.25"
                              value={orderMeasurements.shoulder}
                              onChange={(e) => setOrderMeasurements({ ...orderMeasurements, shoulder: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-0.5">Sleeve</label>
                            <input
                              type="number"
                              step="0.25"
                              value={orderMeasurements.sleeve}
                              onChange={(e) => setOrderMeasurements({ ...orderMeasurements, sleeve: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-0.5">Jacket Lgth</label>
                            <input
                              type="number"
                              step="0.25"
                              value={orderMeasurements.jacketLength}
                              onChange={(e) => setOrderMeasurements({ ...orderMeasurements, jacketLength: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-0.5">Pant Waist</label>
                            <input
                              type="number"
                              step="0.25"
                              value={orderMeasurements.trouserWaist}
                              onChange={(e) => setOrderMeasurements({ ...orderMeasurements, trouserWaist: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 block mb-0.5">Pant Lgth</label>
                            <input
                              type="number"
                              step="0.25"
                              value={orderMeasurements.trouserLength}
                              onChange={(e) => setOrderMeasurements({ ...orderMeasurements, trouserLength: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded font-mono text-white text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-400 font-mono">
                          Current Specs: Chest {orderMeasurements.chest}&quot; · Waist {orderMeasurements.waist}&quot; · Pant {orderMeasurements.trouserWaist}&quot;x{orderMeasurements.trouserLength}&quot; · {orderMeasurements.lapelStyle}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mian Jahangir Khan"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        required
                        placeholder="+92 300 1234567"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-neutral-400">City</label>
                        <button
                          type="button"
                          onClick={() => setIsCustomCityInput(!isCustomCityInput)}
                          className="text-[11px] text-[#D4AF37] hover:underline"
                        >
                          {isCustomCityInput ? 'Choose from list' : '+ Type Custom City'}
                        </button>
                      </div>
                      {isCustomCityInput ? (
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sialkot, Quetta, London"
                          value={newCustCity}
                          onChange={(e) => setNewCustCity(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      ) : (
                        <select
                          value={newCustCity}
                          onChange={(e) => {
                            if (e.target.value === '__CUSTOM__') {
                              setIsCustomCityInput(true);
                              setNewCustCity('');
                            } else {
                              setNewCustCity(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                        >
                          {availableCities.map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                          <option value="__CUSTOM__">+ Other / Enter Custom City...</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1">Delivery Address</label>
                      <input
                        type="text"
                        required
                        placeholder="House No., Street, Sector/Block"
                        value={newCustAddress}
                        onChange={(e) => setNewCustAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200">Garments &amp; Fabric Selection</span>
                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Garment</span>
                  </button>
                </div>

                {orderItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-mono">Garment #{idx + 1}</span>
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-neutral-400 mb-1">Suit Model / Design</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code} - {p.title} (Stock: {p.stockQty})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1">Size / Tailoring</label>
                        <input
                          type="text"
                          value={item.sizeOrTailoring}
                          onChange={(e) => handleItemChange(idx, 'sizeOrTailoring', e.target.value)}
                          placeholder="e.g. Bespoke Custom"
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1">Unit Price (PKR)</label>
                        <input
                          type="number"
                          min={1000}
                          value={item.unitPricePKR}
                          onChange={(e) => handleItemChange(idx, 'unitPricePKR', e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Target Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Wedding / Event Date (Optional)</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rush-check"
                  checked={isRushOrder}
                  onChange={(e) => setIsRushOrder(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <label htmlFor="rush-check" className="text-neutral-300 font-medium cursor-pointer">
                  Prioritize as Rush Wedding Order (Express Master Cutting)
                </label>
              </div>

              {/* Special Tailoring Notes */}
              <div>
                <label className="block text-neutral-400 mb-1">Special Craftsmanship Instructions</label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Milanese lapel buttonhole, horn buttons, monograms on cuff"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="font-semibold text-neutral-200">Financial Ledger &amp; Advance Deposit</div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Tailoring / Cutting Fee (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={tailoringFee}
                      onChange={(e) => setTailoringFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-neutral-400">Discount (PKR)</label>
                      {!currentUser.permissions.canApplyDiscounts && (
                        <span className="text-[10px] text-amber-500 font-mono">Restricted</span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      disabled={!currentUser.permissions.canApplyDiscounts}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Courier / Shipping (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-neutral-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Bank Transfer / Raast">Bank Transfer / Raast</option>
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                      <option value="POS Card">POS Card Swipe</option>
                      <option value="Cash at Atelier">Cash at Atelier</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Advance Deposit Received (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Summary total */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-neutral-300">
                  <span>Grand Total: <strong className="text-white font-mono font-bold text-sm">Rs. {grandTotal.toLocaleString()}</strong></span>
                  <span>Balance Due: <strong className="text-amber-400 font-mono font-bold text-sm">Rs. {balanceDue.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onCloseCreateModal}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Confirm &amp; Create Bespoke Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL ORDER MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-white">
                Cancel Order #{cancellingOrder.orderNumber}
              </h2>
              <button
                onClick={() => setCancellingOrder(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-neutral-300">
              Client: <strong className="text-white">{cancellingOrder.customerName}</strong>. Total value PKR {cancellingOrder.grandTotalPKR.toLocaleString()}.
            </p>

            <div>
              <label className="block text-neutral-400 mb-1">Cancellation Reason</label>
              <input
                type="text"
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <input
                type="checkbox"
                id="restock-check"
                checked={restockOnCancel}
                onChange={(e) => setRestockOnCancel(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <label htmlFor="restock-check" className="text-neutral-300 cursor-pointer">
                Automatically return {cancellingOrder.items.length} garments back to stock inventory
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setCancellingOrder(null)}
                className="px-3 py-1.5 text-neutral-400 hover:text-white"
              >
                Nevermind
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT ORDER DETAILS & HISTORICAL MEASUREMENT SNAPSHOT MODAL */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <span>Order Inspection</span>
                  <span className="font-mono text-amber-400">#{inspectingOrder.orderNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {inspectingOrder.status}
                  </span>
                </h2>
                <div className="text-xs text-neutral-400 mt-1">
                  Placed on {inspectingOrder.createdAt.slice(0, 10)} · Target Delivery: <strong className="text-white">{inspectingOrder.deliveryDate}</strong>
                </div>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client & Family Linkage */}
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Primary Account:</span>
                <span className="font-semibold text-white">{inspectingOrder.customerName}</span>
              </div>
              {inspectingOrder.familyMemberName && (
                <div className="flex items-center justify-between pt-1 border-t border-neutral-900">
                  <span className="text-neutral-400">Tailored For Family Member:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {inspectingOrder.familyMemberName} ({inspectingOrder.familyMemberRelationship || 'Member'})
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
                <span>Contact:</span>
                <span>{currentUser.permissions.canViewCustomerPhone ? inspectingOrder.customerPhone : '[Phone Restricted]'} ({inspectingOrder.customerCity})</span>
              </div>
            </div>

            {/* Historical Measurement Snapshot Section */}
            {inspectingOrder.measurementsSnapshot ? (
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-200 font-semibold uppercase tracking-wider text-[11px]">
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>Historical Measurement Snapshot</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    Immutable Record
                  </span>
                </div>

                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  These measurements are permanently locked as used during fabric cutting for Order #{inspectingOrder.orderNumber}. Subsequent edits to the client profile do not alter this snapshot.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                  {[
                    { label: 'Chest', val: `${inspectingOrder.measurementsSnapshot.chest}"` },
                    { label: 'Waist', val: `${inspectingOrder.measurementsSnapshot.waist}"` },
                    { label: 'Hips', val: `${inspectingOrder.measurementsSnapshot.hip}"` },
                    { label: 'Shoulder', val: `${inspectingOrder.measurementsSnapshot.shoulder}"` },
                    { label: 'Sleeve', val: `${inspectingOrder.measurementsSnapshot.sleeve}"` },
                    { label: 'Jacket Lgth', val: `${inspectingOrder.measurementsSnapshot.jacketLength}"` },
                    { label: 'Pant Waist', val: `${inspectingOrder.measurementsSnapshot.trouserWaist}"` },
                    { label: 'Pant Lgth', val: `${inspectingOrder.measurementsSnapshot.trouserLength}"` },
                  ].map((m, idx) => (
                    <div key={idx} className="p-2 rounded bg-neutral-900 border border-neutral-800">
                      <span className="text-[10px] text-neutral-500 block">{m.label}</span>
                      <span className="text-xs font-bold text-amber-400 font-mono mt-0.5 block">{m.val}</span>
                    </div>
                  ))}
                </div>

                {inspectingOrder.customFieldsSnapshot && (
                  <div className="pt-2 border-t border-neutral-900">
                    <span className="text-[10px] text-neutral-400 block mb-1">Custom Specs Snapshot:</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(inspectingOrder.customFieldsSnapshot).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300">
                          {k}: {v}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-500 text-center">
                Standard ready-to-wear sizing specifications applied.
              </div>
            )}

            {/* Financials & Items */}
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-neutral-400 font-semibold block text-[11px] uppercase tracking-wider">Garment Items</span>
              {inspectingOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-neutral-300">
                  <span>{it.quantity}x {it.title} ({it.fabric})</span>
                  <span className="font-mono font-bold text-white">Rs. {it.totalPricePKR.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-neutral-900 flex justify-between font-mono font-bold text-sm">
                <span>Grand Total:</span>
                <span className="text-white">Rs. {inspectingOrder.grandTotalPKR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-emerald-400">Advance Paid: Rs. {inspectingOrder.advancePaidPKR.toLocaleString()}</span>
                <span className={inspectingOrder.balanceDuePKR > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  Balance Due: Rs. {inspectingOrder.balanceDuePKR.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => {
                  onSelectOrderForPrint(inspectingOrder);
                  setInspectingOrder(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Thermal POS Receipt</span>
              </button>
              <button
                onClick={() => setInspectingOrder(null)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
