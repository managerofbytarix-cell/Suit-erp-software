/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  Scissors,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  Edit2,
  X,
  Check,
  Calendar,
  ShoppingBag,
  Archive,
  RotateCcw,
  Clock,
  Printer,
  MessageCircle,
  ExternalLink,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import {
  Customer,
  FamilyMember,
  BespokeMeasurements,
  MeasurementRevision,
  AlterationRecord,
  Order,
  UserAccount
} from '../types/index.ts';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  currentUser: UserAccount;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'totalOrdersCount' | 'totalSpentPKR' | 'createdAt'>) => void;
  onUpdateCustomer?: (customerId: string, updates: Partial<Customer>) => void;
  onDeleteCustomer?: (customerId: string) => void;
  availableCities?: string[];
  onAddCity?: (city: string) => void;
  onUpdateMeasurements: (customerId: string, measurements: BespokeMeasurements) => void;
  onAddFamilyMember: (
    customerId: string,
    memberData: Omit<FamilyMember, 'id' | 'customerId' | 'createdAt' | 'updatedAt' | 'isArchived' | 'measurementHistory' | 'alterations'>
  ) => void;
  onUpdateFamilyMember: (customerId: string, memberId: string, updates: Partial<FamilyMember>) => void;
  onArchiveFamilyMember: (customerId: string, memberId: string) => void;
  onUnarchiveFamilyMember: (customerId: string, memberId: string) => void;
  onAddMemberMeasurementRevision: (
    customerId: string,
    memberId: string,
    revisionData: {
      measurements: BespokeMeasurements;
      fitNotes?: string;
      customFields?: Record<string, string | number>;
    }
  ) => void;
  onAddMemberAlteration: (
    customerId: string,
    memberId: string,
    alteration: Omit<AlterationRecord, 'id' | 'date'>
  ) => void;
  onSelectCustomerForOrder: (customer: Customer, member?: FamilyMember) => void;
  onSelectOrderForPrint: (order: Order) => void;
  onOpenWhatsApp?: (customerId: string) => void;
  isDarkMode: boolean;
}

const COMMON_RELATIONSHIPS = [
  'Self',
  'Head of Family',
  'Father',
  'Brother',
  'Son',
  'Uncle',
  'Cousin',
  'Nephew',
  'Groom',
  'Grandfather',
  'In-Law',
  'Custom'
];

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  currentUser,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  availableCities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Peshawar',
    'Multan',
    'Sialkot',
    'Gujranwala',
    'Quetta',
    'Abbottabad',
    'Bahawalpur',
    'Sargodha',
    'Sukkur',
    'Mirpur (AJK)',
    'Overseas (UK / UAE / USA)'
  ],
  onAddCity,
  onUpdateMeasurements,
  onAddFamilyMember,
  onUpdateFamilyMember,
  onArchiveFamilyMember,
  onUnarchiveFamilyMember,
  onAddMemberMeasurementRevision,
  onAddMemberAlteration,
  onSelectCustomerForOrder,
  onSelectOrderForPrint,
  onOpenWhatsApp,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [showArchivedMembers, setShowArchivedMembers] = useState(false);

  // Modals
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isAlterationModalOpen, setIsAlterationModalOpen] = useState(false);
  const [inspectingSnapshotOrder, setInspectingSnapshotOrder] = useState<Order | null>(null);

  // New Primary Customer / Family Account Form
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '+92 300 ',
    email: '',
    city: 'Lahore',
    address: '',
    notes: '',
    headRelationship: 'Head of Family',
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
  });
  const [isCustomCityInput, setIsCustomCityInput] = useState(false);
  const [customCityText, setCustomCityText] = useState('');
  const [showInitialSpecs, setShowInitialSpecs] = useState(false);

  // Edit Family Account Form
  const [editCust, setEditCust] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    notes: '',
  });
  const [isEditCustomCityInput, setIsEditCustomCityInput] = useState(false);
  const [editCustomCityText, setEditCustomCityText] = useState('');

  // Add Family Member Form
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    relationship: 'Son',
    customRelationship: '',
    phone: '',
    notes: '',
    preferences: 'Italian cut, slim fit, peak lapel.',
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
    customFieldName: '',
    customFieldValue: '',
    customFields: {} as Record<string, string | number>,
  });

  // Edit Family Member Form
  const [editMemberForm, setEditMemberForm] = useState({
    name: '',
    relationship: '',
    phone: '',
    notes: '',
    preferences: '',
  });

  // Measurement Revision Form
  const [revisionForm, setRevisionForm] = useState<{
    measurements: BespokeMeasurements;
    fitNotes: string;
    customFields: Record<string, string | number>;
    newCustomKey: string;
    newCustomVal: string;
  }>({
    measurements: {
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
    },
    fitNotes: 'Trial fitting conducted. Minor adjustment recorded.',
    customFields: {},
    newCustomKey: '',
    newCustomVal: '',
  });

  // Alteration Form
  const [alterationForm, setAlterationForm] = useState({
    garment: 'Bespoke Suit Jacket',
    alterationDetails: 'Take in jacket waist by 0.5 inches and shorten sleeves by 0.25 inch.',
    status: 'In Tailoring' as const,
    masterTailor: 'Master Aslam',
    costPKR: 0,
    orderNumber: '',
  });

  // Current selected customer
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;

  // Filtered members for current customer
  const allMembers = selectedCustomer?.familyMembers || [];
  const visibleMembers = showArchivedMembers
    ? allMembers
    : allMembers.filter((m) => !m.isArchived);

  // Selected member
  const currentMember =
    visibleMembers.find((m) => m.id === selectedMemberId) ||
    visibleMembers[0] ||
    allMembers[0] ||
    null;

  // Available cities across directory and system configuration
  const directoryCities = Array.from(
    new Set([
      'All',
      ...customers.map((c) => c.city).filter(Boolean),
      ...availableCities,
    ])
  );

  // Filtered Customers based on universal search & selected city filter
  const filteredCustomers = customers.filter((c) => {
    // City filter
    if (selectedCityFilter !== 'All' && c.city.toLowerCase() !== selectedCityFilter.toLowerCase()) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    // Search primary customer details
    const matchCust =
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (currentUser.permissions.canViewCustomerPhone && c.phone.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q);

    if (matchCust) return true;

    // Search family member names
    const matchMember = c.familyMembers?.some((fm) =>
      fm.name.toLowerCase().includes(q) ||
      fm.relationship.toLowerCase().includes(q) ||
      (fm.city && fm.city.toLowerCase().includes(q)) ||
      (currentUser.permissions.canViewCustomerPhone && fm.phone && fm.phone.toLowerCase().includes(q))
    );
    if (matchMember) return true;

    // Search customer orders
    const matchOrder = orders.some(
      (o) => o.customerId === c.id && (o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
    );
    return matchOrder;
  });

  // Family orders
  const familyOrders = selectedCustomer
    ? orders.filter((o) => o.customerId === selectedCustomer.id)
    : [];

  // Member orders
  const memberOrders = currentMember
    ? familyOrders.filter((o) => o.familyMemberId === currentMember.id || (!o.familyMemberId && currentMember.relationship === 'Self'))
    : [];

  // Family calculations
  const nonCancelledFamilyOrders = familyOrders.filter((o) => o.status !== 'Cancelled');
  const familyTotalSpent = nonCancelledFamilyOrders.reduce((sum, o) => sum + o.grandTotalPKR, 0);
  const familyBalanceDue = nonCancelledFamilyOrders.reduce((sum, o) => sum + o.balanceDuePKR, 0);
  const pendingSuitsCount = nonCancelledFamilyOrders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Completed'
  ).length;
  const completedSuitsCount = nonCancelledFamilyOrders.filter(
    (o) => o.status === 'Delivered' || o.status === 'Completed'
  ).length;

  // Handlers
  const handleOpenAddMemberModal = () => {
    setNewMemberForm({
      name: '',
      relationship: 'Son',
      customRelationship: '',
      phone: selectedCustomer?.phone ? `${selectedCustomer.phone.slice(0, 8)} ` : '+92 300 ',
      notes: '',
      preferences: 'Italian cut, slim fit, peak lapel.',
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
      customFieldName: '',
      customFieldValue: '',
      customFields: {},
    });
    setIsAddMemberModalOpen(true);
  };

  const handleAddCustomFieldToNewMember = () => {
    if (!newMemberForm.customFieldName.trim()) return;
    setNewMemberForm({
      ...newMemberForm,
      customFields: {
        ...newMemberForm.customFields,
        [newMemberForm.customFieldName.trim()]: newMemberForm.customFieldValue.trim(),
      },
      customFieldName: '',
      customFieldValue: '',
    });
  };

  const handleSubmitNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newMemberForm.name.trim()) return;

    const finalRelationship =
      newMemberForm.relationship === 'Custom'
        ? newMemberForm.customRelationship.trim() || 'Family Member'
        : newMemberForm.relationship;

    onAddFamilyMember(selectedCustomer.id, {
      name: newMemberForm.name.trim(),
      relationship: finalRelationship,
      phone: newMemberForm.phone.trim() || undefined,
      notes: newMemberForm.notes.trim() || undefined,
      preferences: newMemberForm.preferences.trim() || undefined,
      currentMeasurements: {
        chest: Number(newMemberForm.chest),
        waist: Number(newMemberForm.waist),
        hip: Number(newMemberForm.hip),
        shoulder: Number(newMemberForm.shoulder),
        sleeve: Number(newMemberForm.sleeve),
        jacketLength: Number(newMemberForm.jacketLength),
        collar: Number(newMemberForm.collar),
        trouserWaist: Number(newMemberForm.trouserWaist),
        trouserLength: Number(newMemberForm.trouserLength),
        inseam: Number(newMemberForm.inseam),
        thigh: Number(newMemberForm.thigh),
        lapelStyle: newMemberForm.lapelStyle,
        ventStyle: newMemberForm.ventStyle,
      },
      customFields: Object.keys(newMemberForm.customFields).length > 0 ? newMemberForm.customFields : undefined,
    });

    setIsAddMemberModalOpen(false);
  };

  const handleOpenEditMemberModal = () => {
    if (!currentMember) return;
    setEditMemberForm({
      name: currentMember.name,
      relationship: currentMember.relationship,
      phone: currentMember.phone || '',
      notes: currentMember.notes || '',
      preferences: currentMember.preferences || '',
    });
    setIsEditMemberModalOpen(true);
  };

  const handleSaveEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !currentMember) return;

    onUpdateFamilyMember(selectedCustomer.id, currentMember.id, {
      name: editMemberForm.name.trim(),
      relationship: editMemberForm.relationship.trim(),
      phone: editMemberForm.phone.trim() || undefined,
      notes: editMemberForm.notes.trim() || undefined,
      preferences: editMemberForm.preferences.trim() || undefined,
    });

    setIsEditMemberModalOpen(false);
  };

  const handleOpenRevisionModal = () => {
    if (!currentMember) return;
    setRevisionForm({
      measurements: { ...currentMember.currentMeasurements },
      fitNotes: `Trial fitting revision conducted on ${new Date().toLocaleDateString('en-GB')}`,
      customFields: currentMember.customFields ? { ...currentMember.customFields } : {},
      newCustomKey: '',
      newCustomVal: '',
    });
    setIsRevisionModalOpen(true);
  };

  const handleAddCustomFieldToRevision = () => {
    if (!revisionForm.newCustomKey.trim()) return;
    setRevisionForm({
      ...revisionForm,
      customFields: {
        ...revisionForm.customFields,
        [revisionForm.newCustomKey.trim()]: revisionForm.newCustomVal.trim(),
      },
      newCustomKey: '',
      newCustomVal: '',
    });
  };

  const handleSaveRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !currentMember) return;

    onAddMemberMeasurementRevision(selectedCustomer.id, currentMember.id, {
      measurements: revisionForm.measurements,
      fitNotes: revisionForm.fitNotes,
      customFields: Object.keys(revisionForm.customFields).length > 0 ? revisionForm.customFields : undefined,
    });

    setIsRevisionModalOpen(false);
  };

  const handleOpenAlterationModal = () => {
    if (!currentMember) return;
    setAlterationForm({
      garment: 'Bespoke Suit Jacket',
      alterationDetails: 'Take in jacket waist by 0.5 inches and press shoulder canvas.',
      status: 'In Tailoring',
      masterTailor: 'Master Aslam',
      costPKR: 0,
      orderNumber: memberOrders[0]?.orderNumber || '',
    });
    setIsAlterationModalOpen(true);
  };

  const handleSaveAlteration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !currentMember) return;

    onAddMemberAlteration(selectedCustomer.id, currentMember.id, {
      garment: alterationForm.garment.trim(),
      alterationDetails: alterationForm.alterationDetails.trim(),
      status: alterationForm.status,
      masterTailor: alterationForm.masterTailor.trim(),
      costPKR: Number(alterationForm.costPKR) || 0,
      orderNumber: alterationForm.orderNumber.trim() || undefined,
    });

    setIsAlterationModalOpen(false);
  };

  const handleToggleArchiveMember = () => {
    if (!selectedCustomer || !currentMember) return;
    if (currentMember.relationship === 'Self') {
      alert('The primary account holder (Self) cannot be archived.');
      return;
    }

    if (currentMember.isArchived) {
      onUnarchiveFamilyMember(selectedCustomer.id, currentMember.id);
    } else {
      if (
        window.confirm(
          `Archive ${currentMember.name} (${currentMember.relationship})? Their financial orders, invoices and measurement history will be safely preserved.`
        )
      ) {
        onArchiveFamilyMember(selectedCustomer.id, currentMember.id);
      }
    }
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name.trim()) return;

    const finalCity = (isCustomCityInput ? customCityText.trim() : newCust.city.trim()) || 'Lahore';
    if (onAddCity && finalCity) {
      onAddCity(finalCity);
    }

    onAddCustomer({
      name: newCust.name.trim(),
      phone: newCust.phone.trim(),
      email: newCust.email.trim(),
      city: finalCity,
      address: newCust.address.trim(),
      notes: newCust.notes.trim(),
      measurements: {
        chest: Number(newCust.chest),
        waist: Number(newCust.waist),
        hip: Number(newCust.hip),
        shoulder: Number(newCust.shoulder),
        sleeve: Number(newCust.sleeve),
        jacketLength: Number(newCust.jacketLength),
        collar: Number(newCust.collar),
        trouserWaist: Number(newCust.trouserWaist),
        trouserLength: Number(newCust.trouserLength),
        inseam: Number(newCust.inseam),
        thigh: Number(newCust.thigh),
        lapelStyle: newCust.lapelStyle,
        ventStyle: newCust.ventStyle,
      },
    });

    setIsAddCustomerModalOpen(false);
    setIsCustomCityInput(false);
    setCustomCityText('');
    setNewCust({
      name: '',
      phone: '+92 300 ',
      email: '',
      city: finalCity,
      address: '',
      notes: '',
      headRelationship: 'Head of Family',
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
    });
  };

  const handleOpenEditCustomerModal = () => {
    if (!selectedCustomer) return;
    setEditCust({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email || '',
      city: selectedCustomer.city,
      address: selectedCustomer.address,
      notes: selectedCustomer.notes || '',
    });
    setIsEditCustomCityInput(false);
    setEditCustomCityText('');
    setIsEditCustomerModalOpen(true);
  };

  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !editCust.name.trim()) return;

    const finalCity = (isEditCustomCityInput ? editCustomCityText.trim() : editCust.city.trim()) || editCust.city || 'Lahore';
    if (onAddCity && finalCity) {
      onAddCity(finalCity);
    }

    if (onUpdateCustomer) {
      onUpdateCustomer(selectedCustomer.id, {
        name: editCust.name.trim(),
        phone: editCust.phone.trim(),
        email: editCust.email.trim(),
        city: finalCity,
        address: editCust.address.trim(),
        notes: editCust.notes.trim(),
      });
    }

    setIsEditCustomerModalOpen(false);
  };

  const handleDeleteCustomerAction = () => {
    if (!selectedCustomer) return;
    if (window.confirm(`Delete family account "${selectedCustomer.name}" and all associated member profiles? This cannot be undone.`)) {
      if (onDeleteCustomer) {
        onDeleteCustomer(selectedCustomer.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-display flex items-center gap-2">
            <span>Customer &amp; Family Management System</span>
            <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Bespoke CRM
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Individual family profiles, custom master tailor measurement cards, alteration logs &amp; immutable order snapshots
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Family Account</span>
        </button>
      </div>

      {/* Employee Role Notice */}
      {currentUser.role === 'EMPLOYEE' && (
        <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>Salesperson Mode:</strong> Client telephone and contact numbers are protected. You can view client names, measurements, and cities to assist with fittings and orders.
          </span>
        </div>
      )}

      {/* Universal Search & Directory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer & Family Directory (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentUser.permissions.canViewCustomerPhone ? "Search family name, member, city, phone..." : "Search family name, member, city..."}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60 max-h-[75vh] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                No matching customer or family member found.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                const membersCount = c.familyMembers?.length || 1;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setSelectedMemberId('');
                    }}
                    className={`p-4 cursor-pointer transition-all rounded-lg ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-[#152037] border border-[#D4AF37]/40 text-white'
                          : 'bg-[#FDFBF7] border border-[#D4AF37]/50 text-stone-900 shadow-xs'
                        : isDarkMode ? 'hover:bg-neutral-800/40 text-slate-300' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-xs">{c.name}</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {c.city}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
                      {currentUser.permissions.canViewCustomerPhone ? (
                        <span>{c.phone}</span>
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-sans italic">Profile #{c.id.slice(-5)}</span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-sans">
                        {membersCount} {membersCount === 1 ? 'Member' : 'Members'}
                      </span>
                    </div>

                    {/* Member names preview */}
                    {c.familyMembers && c.familyMembers.length > 1 && (
                      <div className="mt-2 text-[10px] text-neutral-400 truncate">
                        <span className="text-neutral-500">Family: </span>
                        {c.familyMembers.map((m) => `${m.name} (${m.relationship})`).join(' · ')}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-800/50">
                      <span>{c.totalOrdersCount} orders placed</span>
                      <span className="font-mono text-neutral-300">
                        {currentUser.permissions.canViewFinancialTotals ? `Rs. ${c.totalSpentPKR.toLocaleString()}` : '••••••'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer & Family Dashboard (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedCustomer ? (
            <div className="space-y-6">
              {/* Primary Customer Header Banner */}
              <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold text-white font-serif-display">
                        {selectedCustomer.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        Primary Client Account
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {selectedCustomer.city}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 mt-2 flex flex-wrap items-center gap-4">
                      {currentUser.permissions.canViewCustomerPhone ? (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-neutral-500" />
                          {selectedCustomer.phone}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 italic text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-600" />
                          <span>[Number Hidden - Admin Only]</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        {currentUser.permissions.canViewCustomerAddress ? selectedCustomer.address : `${selectedCustomer.city} [Restricted Address]`}
                      </span>
                      {selectedCustomer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-neutral-500" />
                          {selectedCustomer.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => onSelectCustomerForOrder(selectedCustomer, currentMember || undefined)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>New Suit Order</span>
                    </button>
                  </div>
                </div>

                {/* Family-Level Dashboard KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Family Members</span>
                    <div className="text-base font-bold text-white font-mono mt-1 flex items-baseline gap-1.5">
                      <span>{allMembers.length}</span>
                      <span className="text-[10px] text-neutral-400 font-sans font-normal">
                        ({allMembers.filter((m) => !m.isArchived).length} active)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Total Family Suits</span>
                    <div className="text-base font-bold text-amber-400 font-mono mt-1">
                      {nonCancelledFamilyOrders.length} Orders
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Suits in Progress</span>
                    <div className="text-base font-bold text-blue-400 font-mono mt-1 flex items-baseline gap-1.5">
                      <span>{pendingSuitsCount}</span>
                      <span className="text-[10px] text-emerald-400 font-sans font-normal">
                        ({completedSuitsCount} delivered)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Family Balance Due</span>
                    <div className={`text-base font-bold font-mono mt-1 ${familyBalanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {currentUser.permissions.canViewFinancialTotals ? `Rs. ${familyBalanceDue.toLocaleString()}` : '••••••'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Members Navigation Tabs */}
              <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Family Members Directory
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      ({visibleMembers.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-neutral-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showArchivedMembers}
                        onChange={(e) => setShowArchivedMembers(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Show Archived ({allMembers.filter((m) => m.isArchived).length})</span>
                    </label>

                    <button
                      onClick={handleOpenAddMemberModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add Family Member</span>
                    </button>
                  </div>
                </div>

                {/* Member Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {visibleMembers.map((member) => {
                    const isSelected = currentMember?.id === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMemberId(member.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold shadow-sm'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        <UserCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-neutral-950' : 'text-neutral-500'}`} />
                        <span>{member.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected
                              ? 'bg-neutral-950/20 text-neutral-950 font-bold'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {member.relationship}
                        </span>
                        {member.isArchived && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                            Archived
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Individual Member Detailed Profile Card */}
                {currentMember ? (
                  <div className="pt-2 space-y-6">
                    {/* Member Profile Banner */}
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-serif-display">
                            {currentMember.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20">
                            {currentMember.relationship} of {selectedCustomer.name}
                          </span>
                          {currentMember.isArchived && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                              Archived Member
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-neutral-400 mt-1.5 flex flex-wrap items-center gap-4">
                          {currentMember.phone && currentUser.permissions.canViewCustomerPhone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3.5 h-3.5 text-neutral-500" />
                              {currentMember.phone}
                            </span>
                          )}
                          {currentMember.preferences && (
                            <span className="flex items-center gap-1 text-neutral-300">
                              <Tag className="w-3.5 h-3.5 text-amber-400" />
                              <strong className="text-neutral-400">Prefers:</strong> {currentMember.preferences}
                            </span>
                          )}
                        </div>

                        {currentMember.notes && (
                          <p className="text-xs text-neutral-400 mt-2 italic bg-neutral-900/60 px-3 py-1.5 rounded border border-neutral-800/60 inline-block">
                            Notes: {currentMember.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {currentUser.permissions.canEditMeasurements ? (
                          <>
                            <button
                              onClick={handleOpenEditMemberModal}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-amber-400" />
                              <span>Edit Details</span>
                            </button>

                            <button
                              onClick={handleOpenRevisionModal}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 rounded-lg border border-amber-800/60 transition-colors"
                            >
                              <Scissors className="w-3 h-3 text-amber-400" />
                              <span>Record Fitting Revision</span>
                            </button>

                            <button
                              onClick={handleOpenAlterationModal}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
                            >
                              <Clock className="w-3 h-3 text-blue-400" />
                              <span>Log Alteration</span>
                            </button>
                          </>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-neutral-400 border border-neutral-800 text-[11px] font-mono">
                            Measurements: Read-Only (Staff Restricted)
                          </span>
                        )}

                        <button
                          onClick={() => onSelectCustomerForOrder(selectedCustomer, currentMember)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>New Suit for {currentMember.name.split(' ')[0]}</span>
                        </button>

                        {currentMember.relationship !== 'Self' && (
                          <button
                            onClick={handleToggleArchiveMember}
                            title={currentMember.isArchived ? 'Restore member' : 'Archive member'}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 transition-colors"
                          >
                            {currentMember.isArchived ? (
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Archive className="w-3.5 h-3.5 text-rose-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Master Tailor Measurement Sheet (Inches) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                          <Scissors className="w-4 h-4 text-amber-400" />
                          <span>Master Tailor Bespoke Measurement Sheet (Inches)</span>
                        </div>
                        <span className="text-xs text-neutral-400 font-mono">
                          Lapel: {currentMember.currentMeasurements.lapelStyle || 'Peak Lapel'} · Vent: {currentMember.currentMeasurements.ventStyle || 'Double Vent'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Chest (Chhati)', value: `${currentMember.currentMeasurements.chest}"` },
                          { label: 'Waist (Kamar)', value: `${currentMember.currentMeasurements.waist}"` },
                          { label: 'Hips (Coolay)', value: `${currentMember.currentMeasurements.hip}"` },
                          { label: 'Shoulder (Teera)', value: `${currentMember.currentMeasurements.shoulder}"` },
                          { label: 'Sleeve (Baazoo)', value: `${currentMember.currentMeasurements.sleeve}"` },
                          { label: 'Jacket Length (Lambaee)', value: `${currentMember.currentMeasurements.jacketLength}"` },
                          { label: 'Collar (Gala)', value: `${currentMember.currentMeasurements.collar}"` },
                          { label: 'Pant Waist', value: `${currentMember.currentMeasurements.trouserWaist}"` },
                          { label: 'Pant Length', value: `${currentMember.currentMeasurements.trouserLength}"` },
                          { label: 'Inseam (Asan)', value: `${currentMember.currentMeasurements.inseam}"` },
                          { label: 'Thigh (Raan)', value: `${currentMember.currentMeasurements.thigh}"` },
                          { label: 'Lapel Style', value: currentMember.currentMeasurements.lapelStyle },
                        ].map((m, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                            <div className="text-[11px] text-neutral-500">{m.label}</div>
                            <div className="text-sm font-bold text-amber-400 font-mono mt-1">
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Custom Measurement Fields Section */}
                      {currentMember.customFields && Object.keys(currentMember.customFields).length > 0 && (
                        <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                            Custom Garment &amp; Traditional Measurements
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(currentMember.customFields).map(([key, val]) => (
                              <div key={key} className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                                <span className="text-[10px] text-neutral-500 block truncate">{key}</span>
                                <span className="text-xs font-bold text-neutral-200 font-mono mt-0.5 block">
                                  {typeof val === 'number' ? `${val}"` : val}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentMember.currentMeasurements.customNotes && (
                        <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                          <span className="font-semibold text-neutral-400 block mb-1">Cutting Room Notes:</span>
                          <p className="text-neutral-300 leading-relaxed font-mono">
                            {currentMember.currentMeasurements.customNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Member Measurement Revision History */}
                    {currentMember.measurementHistory && currentMember.measurementHistory.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>Measurement Revision History</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {currentMember.measurementHistory.length} Previous Revisions Logged
                          </span>
                        </div>

                        <div className="space-y-2">
                          {currentMember.measurementHistory.map((rev) => (
                            <div
                              key={rev.id}
                              className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px]">
                                <span className="text-amber-400 font-semibold">{rev.date}</span>
                                <span>Recorded By: {rev.recordedBy}</span>
                              </div>
                              <p className="text-neutral-300">{rev.fitNotes}</p>
                              <div className="text-[10px] text-neutral-500 font-mono flex flex-wrap gap-x-3 gap-y-1">
                                <span>Chest: {rev.measurements.chest}&quot;</span>
                                <span>Waist: {rev.measurements.waist}&quot;</span>
                                <span>Shoulder: {rev.measurements.shoulder}&quot;</span>
                                <span>Sleeve: {rev.measurements.sleeve}&quot;</span>
                                <span>Pant Waist: {rev.measurements.trouserWaist}&quot;</span>
                                <span>Pant Length: {rev.measurements.trouserLength}&quot;</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Member Orders, Invoices & Alteration History */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                          <ShoppingBag className="w-4 h-4 text-emerald-400" />
                          <span>Orders &amp; Invoices for {currentMember.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {memberOrders.length} {memberOrders.length === 1 ? 'Order' : 'Orders'}
                        </span>
                      </div>

                      {memberOrders.length === 0 ? (
                        <div className="p-6 text-center rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-500 text-xs">
                          No bespoke suit orders recorded specifically for this family member yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {memberOrders.map((ord) => (
                            <div
                              key={ord.id}
                              className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white font-mono">{ord.orderNumber}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                                    {ord.status}
                                  </span>
                                  <span className="text-[10px] text-neutral-400">
                                    Delivery: {ord.deliveryDate}
                                  </span>
                                </div>
                                <div className="text-neutral-300">
                                  {ord.items.map((it) => it.title).join(', ')}
                                </div>
                                {ord.measurementsSnapshot && (
                                  <div className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Immutable measurement snapshot recorded at order creation</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 self-end md:self-auto">
                                <div className="text-right font-mono">
                                  <div className="text-white font-bold">
                                    Rs. {ord.grandTotalPKR.toLocaleString()}
                                  </div>
                                  <div className={`text-[10px] ${ord.balanceDuePKR > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {ord.balanceDuePKR > 0 ? `Due: Rs. ${ord.balanceDuePKR.toLocaleString()}` : 'Fully Paid'}
                                  </div>
                                </div>

                                {ord.measurementsSnapshot && (
                                  <button
                                    onClick={() => setInspectingSnapshotOrder(ord)}
                                    className="px-2.5 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-[11px] font-medium"
                                  >
                                    View Snapshot
                                  </button>
                                )}

                                <button
                                  onClick={() => onSelectOrderForPrint(ord)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-700 text-[11px] font-medium"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Receipt</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Alterations History Section */}
                    {currentMember.alterations && currentMember.alterations.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span>Alterations &amp; Fitting Adjustments Log</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {currentMember.alterations.map((alt) => (
                            <div
                              key={alt.id}
                              className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white">{alt.garment}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
                                    {alt.status}
                                  </span>
                                  <span className="text-neutral-500 text-[10px] font-mono">{alt.date}</span>
                                </div>
                                <p className="text-neutral-400 mt-1">{alt.alterationDetails}</p>
                                <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                                  Master Tailor: {alt.masterTailor}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    No family member selected. Click &quot;Add Family Member&quot; to begin.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs">
              Select a customer from the left directory to review their Customer Dashboard &amp; Family Structure.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD NEW PRIMARY CUSTOMER */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-white">Register New Family Account</h2>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-neutral-400 mb-1">Primary Client Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mian Jahangir Khan"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Primary Contact Number</label>
                <input
                  type="text"
                  required
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="client@domain.pk"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">City</label>
                  <select
                    value={newCust.city}
                    onChange={(e) => setNewCust({ ...newCust, city: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Multan">Multan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House, Street, Sector"
                    value={newCust.address}
                    onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Consultation / Family Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Head of business family, regular client for wedding sherwanis and Italian 3-piece suits."
                  value={newCust.notes}
                  onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Register Family Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FAMILY MEMBER */}
      {isAddMemberModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-white">
                Add Family Member to {selectedCustomer.name}&apos;s Account
              </h2>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Member Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Bajwa"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Relationship to Primary Client *</label>
                  <select
                    value={newMemberForm.relationship}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, relationship: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    {COMMON_RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newMemberForm.relationship === 'Custom' && (
                <div>
                  <label className="block text-neutral-400 mb-1">Specify Custom Relationship</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grandson / Stepson / Brother-in-Law"
                    value={newMemberForm.customRelationship}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, customRelationship: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Member Direct Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+92 300 ..."
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Fabric &amp; Cut Preferences</label>
                  <input
                    type="text"
                    placeholder="e.g. Peak lapel, slim fit, Prince Coat"
                    value={newMemberForm.preferences}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, preferences: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Personal / Tailor Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Groom for November wedding reception"
                  value={newMemberForm.notes}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Initial Measurements for this Member */}
              <div className="pt-2 border-t border-neutral-800 space-y-3">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Initial Bespoke Measurements (Inches)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-neutral-500 text-[11px] mb-1">Chest</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={newMemberForm.chest}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, chest: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 text-[11px] mb-1">Waist</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={newMemberForm.waist}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, waist: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 text-[11px] mb-1">Hips</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={newMemberForm.hip}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, hip: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 text-[11px] mb-1">Shoulder</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={newMemberForm.shoulder}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, shoulder: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 text-[11px] mb-1">Sleeve</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={newMemberForm.sleeve}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, sleeve: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 text-[11px] mb-1">Jacket Length</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={newMemberForm.jacketLength}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, jacketLength: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 text-[11px] mb-1">Pant Waist</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={newMemberForm.trouserWaist}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, trouserWaist: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 text-[11px] mb-1">Pant Length</label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      value={newMemberForm.trouserLength}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, trouserLength: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Measurement Fields Add */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <span className="text-xs font-semibold text-neutral-400 block">
                  Add Custom Garment Measurements (e.g. Sherwani Length, Kamiz Daman, Pagri Size)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Field name (e.g. Sherwani Length)"
                    value={newMemberForm.customFieldName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, customFieldName: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 42.5)"
                    value={newMemberForm.customFieldValue}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, customFieldValue: e.target.value })}
                    className="w-28 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomFieldToNewMember}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium"
                  >
                    Add
                  </button>
                </div>

                {Object.keys(newMemberForm.customFields).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(newMemberForm.customFields).map(([k, v]) => (
                      <span key={k} className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-amber-400">
                        {k}: {v}&quot;
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Save Family Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMBER PROFILE */}
      {isEditMemberModalOpen && currentMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-white">
                Edit Profile · {currentMember.name}
              </h2>
              <button
                onClick={() => setIsEditMemberModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-3">
              <div>
                <label className="block text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editMemberForm.name}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  value={editMemberForm.relationship}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, relationship: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editMemberForm.phone}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Preferences</label>
                <input
                  type="text"
                  value={editMemberForm.preferences}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, preferences: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editMemberForm.notes}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditMemberModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD FITTING REVISION */}
      {isRevisionModalOpen && currentMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-white">
                Record Fitting Revision · {currentMember.name} ({currentMember.relationship})
              </h2>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRevision} className="space-y-4">
              <div>
                <label className="block text-neutral-400 mb-1">Fitting Session Notes / Reason for Revision *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding fitting trial. Taken in waist 0.5 inch, increased armhole comfort."
                  value={revisionForm.fitNotes}
                  onChange={(e) => setRevisionForm({ ...revisionForm, fitNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Chest (Inches)</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={revisionForm.measurements.chest}
                    onChange={(e) =>
                      setRevisionForm({
                        ...revisionForm,
                        measurements: { ...revisionForm.measurements, chest: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Waist (Inches)</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={revisionForm.measurements.waist}
                    onChange={(e) =>
                      setRevisionForm({
                        ...revisionForm,
                        measurements: { ...revisionForm.measurements, waist: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Hips (Inches)</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={revisionForm.measurements.hip}
                    onChange={(e) =>
                      setRevisionForm({
                        ...revisionForm,
                        measurements: { ...revisionForm.measurements, hip: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Shoulder (Inches)</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={revisionForm.measurements.shoulder}
                    onChange={(e) =>
                      setRevisionForm({
                        ...revisionForm,
                        measurements: { ...revisionForm.measurements, shoulder: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Sleeve Length</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={revisionForm.measurements.sleeve}
                    onChange={(e) =>
                      setRevisionForm({
                        ...revisionForm,
                        measurements: { ...revisionForm.measurements, sleeve: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Jacket Length</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={revisionForm.measurements.jacketLength}
                    onChange={(e) =>
                      setRevisionForm({
                        ...revisionForm,
                        measurements: { ...revisionForm.measurements, jacketLength: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Pant Waist</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={revisionForm.measurements.trouserWaist}
                    onChange={(e) =>
                      setRevisionForm({
                        ...revisionForm,
                        measurements: { ...revisionForm.measurements, trouserWaist: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Pant Length</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={revisionForm.measurements.trouserLength}
                    onChange={(e) =>
                      setRevisionForm({
                        ...revisionForm,
                        measurements: { ...revisionForm.measurements, trouserLength: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                </div>
              </div>

              {/* Custom fields in revision */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <span className="text-xs font-semibold text-neutral-400 block">
                  Custom Garment Measurements
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Field name (e.g. Armhole Depth)"
                    value={revisionForm.newCustomKey}
                    onChange={(e) => setRevisionForm({ ...revisionForm, newCustomKey: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 9.5)"
                    value={revisionForm.newCustomVal}
                    onChange={(e) => setRevisionForm({ ...revisionForm, newCustomVal: e.target.value })}
                    className="w-28 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomFieldToRevision}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs"
                  >
                    Add
                  </button>
                </div>

                {Object.keys(revisionForm.customFields).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(revisionForm.customFields).map(([k, v]) => (
                      <span key={k} className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-amber-400">
                        {k}: {v}&quot;
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Save Fitting Revision to History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG ALTERATION */}
      {isAlterationModalOpen && currentMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-white">
                Log Alteration · {currentMember.name}
              </h2>
              <button
                onClick={() => setIsAlterationModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAlteration} className="space-y-3">
              <div>
                <label className="block text-neutral-400 mb-1">Garment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Navy Bespoke Trouser"
                  value={alterationForm.garment}
                  onChange={(e) => setAlterationForm({ ...alterationForm, garment: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Alteration Details / Defect *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Take in waist 0.5 inch, shorten trouser length by 0.75 inch."
                  value={alterationForm.alterationDetails}
                  onChange={(e) => setAlterationForm({ ...alterationForm, alterationDetails: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Status</label>
                  <select
                    value={alterationForm.status}
                    onChange={(e) => setAlterationForm({ ...alterationForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  >
                    <option value="Received">Received</option>
                    <option value="In Tailoring">In Tailoring</option>
                    <option value="Ready for Fitting">Ready for Fitting</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Master Tailor</label>
                  <input
                    type="text"
                    required
                    value={alterationForm.masterTailor}
                    onChange={(e) => setAlterationForm({ ...alterationForm, masterTailor: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAlterationModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg shadow-sm"
                >
                  Record Alteration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT HISTORICAL ORDER MEASUREMENT SNAPSHOT */}
      {inspectingSnapshotOrder && inspectingSnapshotOrder.measurementsSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Historical Measurements Snapshot</span>
                  <span className="font-mono text-amber-400">#{inspectingSnapshotOrder.orderNumber}</span>
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Client: {inspectingSnapshotOrder.customerName}
                  {inspectingSnapshotOrder.familyMemberName && ` · Member: ${inspectingSnapshotOrder.familyMemberName} (${inspectingSnapshotOrder.familyMemberRelationship})`}
                </p>
              </div>
              <button
                onClick={() => setInspectingSnapshotOrder(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
              <strong>Immutable Snapshot Rule:</strong> These measurements reflect the precise cutting specifications used when this order was created ({inspectingSnapshotOrder.createdAt.slice(0, 10)}). Subsequent edits to the client or family member profile have zero effect on this historical record.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Chest', value: `${inspectingSnapshotOrder.measurementsSnapshot.chest}"` },
                { label: 'Waist', value: `${inspectingSnapshotOrder.measurementsSnapshot.waist}"` },
                { label: 'Hips', value: `${inspectingSnapshotOrder.measurementsSnapshot.hip}"` },
                { label: 'Shoulder', value: `${inspectingSnapshotOrder.measurementsSnapshot.shoulder}"` },
                { label: 'Sleeve', value: `${inspectingSnapshotOrder.measurementsSnapshot.sleeve}"` },
                { label: 'Jacket Length', value: `${inspectingSnapshotOrder.measurementsSnapshot.jacketLength}"` },
                { label: 'Collar', value: `${inspectingSnapshotOrder.measurementsSnapshot.collar}"` },
                { label: 'Pant Waist', value: `${inspectingSnapshotOrder.measurementsSnapshot.trouserWaist}"` },
                { label: 'Pant Length', value: `${inspectingSnapshotOrder.measurementsSnapshot.trouserLength}"` },
                { label: 'Inseam', value: `${inspectingSnapshotOrder.measurementsSnapshot.inseam}"` },
                { label: 'Thigh', value: `${inspectingSnapshotOrder.measurementsSnapshot.thigh}"` },
                { label: 'Lapel Cut', value: inspectingSnapshotOrder.measurementsSnapshot.lapelStyle },
              ].map((m, idx) => (
                <div key={idx} className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">{m.label}</span>
                  <span className="text-xs font-bold text-amber-400 font-mono mt-0.5 block">{m.value}</span>
                </div>
              ))}
            </div>

            {inspectingSnapshotOrder.customFieldsSnapshot && (
              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-400 block">Custom Measurements Snapshot:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(inspectingSnapshotOrder.customFieldsSnapshot).map(([k, v]) => (
                    <span key={k} className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-200">
                      {k}: {v}&quot;
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <button
                onClick={() => setInspectingSnapshotOrder(null)}
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
