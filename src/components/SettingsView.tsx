/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Printer,
  FileText,
  Clock,
  UserCheck,
  Check,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Search,
  ExternalLink,
  Globe,
  Database,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Store,
  Phone,
  MapPin,
  RefreshCw,
  Save,
  Zap,
  UserPlus,
  Key,
  Eye,
  EyeOff,
  Lock,
  Copy,
  CheckSquare,
  Square,
  Users,
  Edit3,
  X,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { db, ADMIN_USER, EMPLOYEE_USER } from '../db/demoDatabase.ts';
import { AuditLog, ThermalPrinterConfig, UserAccount } from '../types/index.ts';

interface SettingsViewProps {
  currentUser: UserAccount;
  printerConfig: ThermalPrinterConfig;
  auditLogs: AuditLog[];
  onUpdatePrinterConfig: (config: ThermalPrinterConfig) => void;
  onResetData: () => void;
  onClearAllData?: () => void;
  onClearSettingsData?: () => void;
  onRemoveAllDemoData?: () => void;
  onLoadSampleData?: () => void;
  onSwitchUser: () => void;
  onExportBackup?: () => void;
  onImportBackup?: () => void;
  onReloadUsers?: () => void;
  isDarkMode?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  printerConfig,
  auditLogs,
  onUpdatePrinterConfig,
  onResetData,
  onClearAllData,
  onClearSettingsData,
  onRemoveAllDemoData,
  onLoadSampleData,
  onSwitchUser,
  onExportBackup,
  onImportBackup,
  onReloadUsers,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'hardware' | 'autosave' | 'data' | 'rbac' | 'audit'>('profile');
  const [logFilter, setLogFilter] = useState('');

  // Staff users state for generator & RBAC visibility
  const [staffUsers, setStaffUsers] = useState<UserAccount[]>(() => {
    try {
      return db.getUsers();
    } catch {
      return [ADMIN_USER, EMPLOYEE_USER];
    }
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffFormError, setStaffFormError] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);

  // Staff Form state
  const [staffForm, setStaffForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    title: 'Showroom Sales Associate',
    canViewCustomerPhone: false, // Hide phone number from salesperson
    canViewCustomerAddress: false, // Hide address from salesperson
    canViewProfits: false, // Hide wholesale costs and profit margins
    canViewFinancialTotals: false, // Hide revenue and outstanding receivables
    canEditMeasurements: true, // Allow editing measurements
    canApplyDiscounts: true, // Allow custom discounts
    allowedViews: ['orders', 'products', 'customers', 'thermal'],
  });

  const reloadStaff = () => {
    try {
      const u = db.getUsers();
      setStaffUsers(u);
      if (onReloadUsers) onReloadUsers();
    } catch (err) {
      console.error('Failed to reload staff accounts:', err);
    }
  };

  // Store & Hardware state
  const [config, setConfig] = useState<ThermalPrinterConfig>({
    ...printerConfig,
    autoSaveEnabled: printerConfig.autoSaveEnabled ?? true,
    autoSaveDelayMs: printerConfig.autoSaveDelayMs ?? 450,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string>('');
  const isInitialMount = React.useRef(true);

  // Sync if prop changes from outside
  React.useEffect(() => {
    setConfig({
      ...printerConfig,
      autoSaveEnabled: printerConfig.autoSaveEnabled ?? true,
      autoSaveDelayMs: printerConfig.autoSaveDelayMs ?? 450,
    });
  }, [printerConfig]);

  // Debounced Auto-Save Effect
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!config.autoSaveEnabled) return;

    setIsAutoSaving(true);
    const delay = config.autoSaveDelayMs || 450;
    const timer = setTimeout(() => {
      onUpdatePrinterConfig(config);
      setIsAutoSaving(false);
      setLastAutoSavedAt(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [config, onUpdatePrinterConfig]);

  const handleSaveStoreProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdatePrinterConfig(config);
    setSaveSuccessMessage('Settings and website configuration saved successfully.');
    setSaveSuccess(true);
    setLastAutoSavedAt(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleAutoSave = (enabled: boolean) => {
    const updated = { ...config, autoSaveEnabled: enabled };
    setConfig(updated);
    onUpdatePrinterConfig(updated);
    setSaveSuccessMessage(enabled ? 'Auto-Save enabled! Changes will now save as you type.' : 'Auto-Save disabled. Remember to click Save manually.');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearAllSettingsFields = () => {
    if (window.confirm('Clear all demo data in settings? Shop name, address, phone number, and website in settings will be reset to blank.')) {
      const cleanConfig: ThermalPrinterConfig = {
        paperWidth: '80mm',
        businessName: '',
        tagline: '',
        address: '',
        city: '',
        phone: '',
        websiteUrl: '',
        ntnNumber: '',
        footerNote: '',
        printBarcode: true,
        cutPaperAfterPrint: true,
        autoSaveEnabled: config.autoSaveEnabled ?? true,
        autoSaveDelayMs: config.autoSaveDelayMs ?? 450,
      };
      setConfig(cleanConfig);
      if (onClearSettingsData) {
        onClearSettingsData();
      } else {
        onUpdatePrinterConfig(cleanConfig);
      }
      setSaveSuccessMessage('Settings demo data cleared! All fields are now blank ready for your business info.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const handleRemoveAllDemoDataAction = () => {
    if (window.confirm('Remove ALL demo data across the entire atelier ERP?\n\n• Purges all demo products & inventory\n• Purges all demo orders & tailoring status\n• Purges all demo customers & family measurements\n• Purges all demo payments & expenses\n• Purges all demo WhatsApp chat threads\n• Wipes all demo settings fields to clean blank values\n\nAre you sure you want to proceed?')) {
      if (onRemoveAllDemoData) {
        onRemoveAllDemoData();
      } else {
        if (onClearAllData) onClearAllData();
        if (onClearSettingsData) onClearSettingsData();
      }
      const cleanConfig: ThermalPrinterConfig = {
        paperWidth: '80mm',
        businessName: '',
        tagline: '',
        address: '',
        city: '',
        phone: '',
        websiteUrl: '',
        ntnNumber: '',
        footerNote: '',
        printBarcode: true,
        cutPaperAfterPrint: true,
        autoSaveEnabled: config.autoSaveEnabled ?? true,
        autoSaveDelayMs: config.autoSaveDelayMs ?? 450,
      };
      setConfig(cleanConfig);
      setSaveSuccessMessage('All demo data removed successfully! You now have a complete clean slate for your bespoke atelier.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    }
  };

  const handleTestWebsite = () => {
    if (!config.websiteUrl) return;
    let url = config.websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(logFilter.toLowerCase()) ||
      l.userName.toLowerCase().includes(logFilter.toLowerCase()) ||
      l.details.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Atelier Configuration &amp; Business Profile
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Store identity, official website URL, POS thermal hardware, RBAC access security, and persistent audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={handleRemoveAllDemoDataAction}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-800/50 shadow-xs transition-all whitespace-nowrap"
              title="Remove all demo products, orders, customers, finances, chats, and blank out settings"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Remove All Demo Data</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('autosave')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
              config.autoSaveEnabled
                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50 hover:bg-emerald-900/50'
                : isDarkMode ? 'text-slate-400 bg-slate-900 border-slate-700 hover:text-white' : 'text-stone-600 bg-stone-100 border-stone-300 hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto-Save Option: <strong>{config.autoSaveEnabled ? 'ON' : 'OFF'}</strong></span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                isDarkMode
                  ? 'text-[#E6CA85] hover:text-white bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border-[#D4AF37]/30'
                  : 'text-[#846227] hover:text-stone-900 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border-[#D4AF37]/40'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data Clean &amp; Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 border-b pb-2 overflow-x-auto ${
        isDarkMode ? 'border-slate-800' : 'border-stone-200'
      }`}>
        {[
          { id: 'profile', label: 'Store Profile & Website', icon: Store },
          { id: 'hardware', label: 'POS Thermal Printer', icon: Printer },
          { id: 'autosave', label: 'Auto-Save Option', icon: Zap },
          { id: 'data', label: 'Data Clean & Backup', icon: Database },
          { id: 'rbac', label: 'Role Permissions (RBAC)', icon: Shield },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Auto-Save Option & Live Persistence Control */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors ${
        isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8]'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            config.autoSaveEnabled
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Auto-Save Mode (خودکار محفوظ کریں)
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                config.autoSaveEnabled
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-stone-200 text-stone-700'
              }`}>
                {config.autoSaveEnabled ? 'Auto-Save: Active' : 'Auto-Save: Disabled'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Automatically saves all store information, website URL, printer roll sizes, and system configurations to storage as you type.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Status Indicator */}
          {config.autoSaveEnabled && (
            <div className={`text-[11px] font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
            }`}>
              {isAutoSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
                  <span className="text-[#E6CA85]">Saving...</span>
                </>
              ) : lastAutoSavedAt ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Auto-saved at {lastAutoSavedAt}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Auto-save Ready</span>
                </>
              )}
            </div>
          )}

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => handleToggleAutoSave(!config.autoSaveEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.autoSaveEnabled ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-800' : 'bg-stone-300'
            }`}
            role="switch"
            aria-checked={config.autoSaveEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMessage || 'Settings and configuration updated successfully.'}</span>
          </div>
          {config.websiteUrl && (
            <button
              onClick={handleTestWebsite}
              className="text-xs font-bold text-emerald-300 underline flex items-center gap-1"
            >
              <span>Test Link</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* TAB 1: Business Profile & Website URL */}
      {activeTab === 'profile' && (
        <div className={`rounded-xl border p-6 space-y-6 text-xs transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold mb-1">
              <Globe className="w-4 h-4" />
              <span>STORE IDENTITY &amp; OFFICIAL WEBSITE</span>
            </div>
            <h2 className={`text-base font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Business Information &amp; Website Link
            </h2>
            <p className={`mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Enter your atelier details and website. The website URL will be linked in the top navigation bar, printed on customer thermal slips &amp; invoices, and shared in WhatsApp messages.
            </p>
          </div>

          <form onSubmit={handleSaveStoreProfile} className="space-y-4 max-w-2xl">
            {/* Website URL Field */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#D4AF37]/10 via-[#0B101B] to-[#0B101B] border-[#D4AF37]/30'
                : 'bg-gradient-to-r from-[#D4AF37]/15 via-white to-white border-[#D4AF37]/40'
            }`}>
              <label className={`block text-xs font-bold ${isDarkMode ? 'text-[#E6CA85]' : 'text-[#846227]'}`}>
                Official Business Website URL (ویب سائٹ کا لنک)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={config.websiteUrl || ''}
                    onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                    placeholder="https://www.yourdomain.com"
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg font-mono text-xs focus:outline-none focus:border-[#D4AF37] ${
                      isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                {config.websiteUrl && (
                  <button
                    type="button"
                    onClick={handleTestWebsite}
                    className={`px-3.5 py-2 font-semibold rounded-lg border flex items-center justify-center gap-1.5 shrink-0 transition-colors ${
                      isDarkMode
                        ? 'bg-[#121A2C] hover:bg-[#18233C] text-[#E6CA85] border-[#202E4A]'
                        : 'bg-stone-100 hover:bg-stone-200 text-[#846227] border-stone-300'
                    }`}
                  >
                    <span>Test Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Tip: Enter your full website URL starting with <code>https://</code>. When saved, a <strong>Website</strong> shortcut appears on your header bar, and the link prints on all customer thermal receipts so clients can browse your bespoke collection online.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                  Atelier Business Name (Header)
                </label>
                <input
                  type="text"
                  value={config.businessName}
                  onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                  placeholder="e.g. Royal Bespoke Tailors"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                    isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                  placeholder="e.g. Master Tailors & Fine Bespoke Attire"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                    isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                Showroom / Atelier Address
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                placeholder="e.g. Shop number, floor, plaza, street"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                  isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                  City / Region
                </label>
                <input
                  type="text"
                  value={config.city}
                  onChange={(e) => setConfig({ ...config, city: e.target.value })}
                  placeholder="e.g. Lahore, Pakistan"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                    isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                  Telephone Contact &amp; WhatsApp
                </label>
                <input
                  type="text"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  placeholder="e.g. +92 300 0000000"
                  className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-[#D4AF37] ${
                    isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                  National Tax Number (NTN)
                </label>
                <input
                  type="text"
                  value={config.ntnNumber}
                  onChange={(e) => setConfig({ ...config, ntnNumber: e.target.value })}
                  placeholder="e.g. PK-NTN 0000000-0"
                  className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-[#D4AF37] ${
                    isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                  Default Paper Roll Width
                </label>
                <select
                  value={config.paperWidth}
                  onChange={(e) => setConfig({ ...config, paperWidth: e.target.value as any })}
                  className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-[#D4AF37] ${
                    isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                >
                  <option value="58mm">58mm (2-inch narrow POS roll)</option>
                  <option value="80mm">80mm (3-inch standard POS roll)</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                Receipt Footer Note &amp; Policy
              </label>
              <textarea
                rows={2}
                value={config.footerNote}
                onChange={(e) => setConfig({ ...config, footerNote: e.target.value })}
                placeholder="e.g. Bespoke garments strictly crafted to client specifications. Alterations honoured within 14 days of delivery."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                  isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{config.autoSaveEnabled ? 'Save Profile (Auto-Save Active)' : 'Save Business Profile & Website'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAllSettingsFields}
                className={`px-4 py-2.5 font-semibold rounded-lg border transition-colors flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-[#121A2C] hover:bg-[#18233C] text-[#E6CA85] border-[#202E4A]'
                    : 'bg-stone-100 hover:bg-stone-200 text-[#846227] border-stone-300'
                }`}
                title="Wipe demo names, addresses, phone numbers in settings to clean blank values"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Remove Demo Data in Settings</span>
              </button>

              {currentUser.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={handleRemoveAllDemoDataAction}
                  className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold rounded-lg border border-rose-800/50 transition-colors flex items-center gap-2"
                  title="Remove all demo products, orders, customers, finances, chats, and blank out settings"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Remove ALL Demo Data</span>
                </button>
              )}

              {config.autoSaveEnabled && (
                <span className={`text-[11px] flex items-center gap-1.5 font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Changes auto-save as you type</span>
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Hardware Printer */}
      {activeTab === 'hardware' && (
        <div className={`rounded-xl border p-6 space-y-6 text-xs transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div>
            <h2 className={`text-base font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              POS Thermal Printer Parameters
            </h2>
            <p className={`mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Customize receipt paper roll width, Code128 barcodes, and auto-cut paper signals.
            </p>
          </div>

          <form onSubmit={handleSaveStoreProfile} className="space-y-4 max-w-xl">
            <div>
              <label className={`block mb-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                Default Paper Roll Width
              </label>
              <select
                value={config.paperWidth}
                onChange={(e) => setConfig({ ...config, paperWidth: e.target.value as any })}
                className={`w-full px-3 py-2 border rounded-lg font-mono focus:outline-none focus:border-[#D4AF37] ${
                  isDarkMode ? 'bg-[#090E18] border-[#182338] text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              >
                <option value="58mm">58mm (2-inch narrow POS roll - 32 columns)</option>
                <option value="80mm">80mm (3-inch standard POS roll - 48 columns)</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.printBarcode}
                  onChange={(e) => setConfig({ ...config, printBarcode: e.target.checked })}
                  className="rounded accent-[#D4AF37]"
                />
                <span className={isDarkMode ? 'text-slate-300' : 'text-stone-700'}>Print Code128 barcode simulation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.cutPaperAfterPrint}
                  onChange={(e) => setConfig({ ...config, cutPaperAfterPrint: e.target.checked })}
                  className="rounded accent-[#D4AF37]"
                />
                <span className={isDarkMode ? 'text-slate-300' : 'text-stone-700'}>Send ESC/POS auto-cutter command</span>
              </label>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-lg shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{config.autoSaveEnabled ? 'Save Hardware (Auto-Save Active)' : 'Save Hardware Configuration'}</span>
              </button>
              {config.autoSaveEnabled && (
                <span className={`text-[11px] flex items-center gap-1.5 font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-saves on change</span>
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Auto-Save Options & Storage Sync */}
      {activeTab === 'autosave' && (
        <div className={`rounded-xl border p-6 space-y-6 text-xs transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <Zap className="w-4 h-4" />
              <span>LIVE DATA PERSISTENCE &amp; STORAGE</span>
            </div>
            <h2 className={`text-base font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Auto-Save Options &amp; Synchronization (خودکار محفوظ کریں)
            </h2>
            <p className={`mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Control how frequently and when changes across store identity, POS thermal hardware, and atelier data are saved to local storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Toggle Card */}
            <div className={`p-5 rounded-xl border transition-all ${
              config.autoSaveEnabled
                ? 'bg-emerald-950/20 border-emerald-800/60'
                : isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    config.autoSaveEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-stone-200 text-stone-600'
                  }`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Master Auto-Save Mode
                    </h3>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                      {config.autoSaveEnabled ? 'State is actively auto-saved on every change' : 'Manual saving required via Save button'}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => handleToggleAutoSave(!config.autoSaveEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.autoSaveEnabled ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-800' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={config.autoSaveEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className={`mt-4 pt-4 border-t flex items-center justify-between text-[11px] ${
                isDarkMode ? 'border-slate-800/60' : 'border-stone-200'
              }`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-stone-500'}>Current Status:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                  config.autoSaveEnabled
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-stone-200 text-stone-700'
                }`}>
                  {config.autoSaveEnabled ? 'ACTIVE (AUTOMATIC)' : 'DISABLED (MANUAL ONLY)'}
                </span>
              </div>
            </div>

            {/* Delay / Debounce Setting */}
            <div className={`p-5 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
                <Clock className="w-4 h-4" />
                <span>Auto-Save Debounce Speed</span>
              </div>
              <p className={`leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Choose how quickly the system writes your input to browser storage after you pause typing.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: 'Instant', ms: 300, desc: '300ms' },
                  { label: 'Standard', ms: 750, desc: '750ms' },
                  { label: 'Relaxed', ms: 1500, desc: '1.5 sec' },
                ].map((speed) => (
                  <button
                    key={speed.ms}
                    type="button"
                    disabled={!config.autoSaveEnabled}
                    onClick={() => {
                      const updated = { ...config, autoSaveDelayMs: speed.ms };
                      setConfig(updated);
                      onUpdatePrinterConfig(updated);
                      setSaveSuccessMessage(`Auto-Save delay set to ${speed.label} (${speed.desc}).`);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2500);
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      (config.autoSaveDelayMs || 450) === speed.ms
                        ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                        : config.autoSaveEnabled
                        ? isDarkMode ? 'bg-[#121A2C] border-[#182338] text-slate-300 hover:border-slate-600' : 'bg-white border-stone-300 text-stone-800 hover:border-stone-400'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-xs font-semibold">{speed.label}</div>
                    <div className="text-[10px] opacity-80 font-mono">{speed.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sync Information & Diagnostics */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>What is Auto-Saved in this Atelier Application?</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-stone-200'}`}>
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Store Identity &amp; Website</div>
                <div className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Atelier name, tagline, address, phone number, NTN and official website link.
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-stone-200'}`}>
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>POS Thermal Hardware</div>
                <div className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  58mm / 80mm roll width, barcode emulation, and automatic ESC/POS paper cutter signals.
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-stone-200'}`}>
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Orders &amp; Bespoke Measurements</div>
                <div className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Suit booking details, body measurements, alterations, and payment records.
                </div>
              </div>
            </div>

            <div className={`pt-2 flex items-center justify-between border-t ${
              isDarkMode ? 'border-slate-800' : 'border-stone-200'
            }`}>
              <div className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                {isAutoSaving ? (
                  <span className="text-[#D4AF37] flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-saving in progress...</span>
                  </span>
                ) : lastAutoSavedAt ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Last storage write confirmed at {lastAutoSavedAt}</span>
                  </span>
                ) : (
                  <span>Auto-save engine ready. Edits will sync automatically.</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleSaveStoreProfile()}
                className={`px-3.5 py-1.5 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
                  isDarkMode
                    ? 'bg-[#121A2C] hover:bg-[#18233C] text-white border-[#202E4A]'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
                }`}
              >
                <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Force Save Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Data Clean & Management */}
      {activeTab === 'data' && (
        <div className={`rounded-xl border p-6 space-y-6 text-xs transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div>
            <h2 className={`text-base font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Database Management &amp; Demo Data Removal
            </h2>
            <p className={`mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Start completely clean with 0 demo records, wipe demo profile settings, or export offline backups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Remove ALL Demo Data (Full Clean Slate) */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <Trash2 className="w-4 h-4" />
                  <span>Remove ALL Demo Data</span>
                </div>
                <p className={`leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                  Full atelier clean slate: Purges all sample suit products, customer directories, bookings, expenses, chats, and wipes all settings fields to clean blank inputs.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveAllDemoDataAction}
                className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove ALL Demo Data</span>
              </button>
            </div>

            {/* Box 2: Clear Settings Data to Clean Blank */}
            <div className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between ${
              isDarkMode ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 font-bold ${isDarkMode ? 'text-[#E6CA85]' : 'text-[#846227]'}`}>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Demo Data in Settings</span>
                </div>
                <p className={`leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                  Clears any demo shop names, addresses, phone numbers, NTN, and website links in settings. Resets all input fields to clean blank values so you can enter your own real identity.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearAllSettingsFields}
                className={`w-full px-4 py-2.5 font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                  isDarkMode
                    ? 'bg-[#121A2C] hover:bg-[#18233C] text-[#E6CA85] border-[#202E4A]'
                    : 'bg-white hover:bg-stone-50 text-[#846227] border-stone-300'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Wipe Settings to Blank</span>
              </button>
            </div>

            {/* Box 3: Purge Records Only */}
            <div className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between ${
              isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 font-bold ${isDarkMode ? 'text-slate-300' : 'text-stone-800'}`}>
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Purge Records Only</span>
                </div>
                <p className={`leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Clears only transaction records (products, orders, customers, finances, chats) while preserving your current shop name and settings configuration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Purge all order, product, and client records? Settings will be preserved.')) {
                    if (onClearAllData) {
                      onClearAllData();
                    } else {
                      onResetData();
                    }
                    setSaveSuccessMessage('All records purged to zero. Shop settings retained.');
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                  }
                }}
                className={`w-full px-4 py-2.5 font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                  isDarkMode
                    ? 'bg-[#121A2C] hover:bg-[#18233C] text-slate-300 border-[#202E4A]'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Purge Records to Zero</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
          }`}>
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Full Database JSON Backup &amp; Offline Archive
            </h3>
            <p className={`leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Export your entire bespoke ERP database to a JSON file on your computer, or restore a previously saved backup file.
            </p>
            <div className="flex flex-wrap gap-2">
              {onExportBackup && (
                <button
                  type="button"
                  onClick={onExportBackup}
                  className={`px-4 py-2 font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                    isDarkMode
                      ? 'bg-[#121A2C] hover:bg-[#18233C] text-emerald-400 border-[#202E4A]'
                      : 'bg-white hover:bg-stone-100 text-emerald-600 border-stone-300'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full JSON Backup</span>
                </button>
              )}
              {onImportBackup && (
                <button
                  type="button"
                  onClick={onImportBackup}
                  className={`px-4 py-2 font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                    isDarkMode
                      ? 'bg-[#121A2C] hover:bg-[#18233C] text-blue-400 border-[#202E4A]'
                      : 'bg-white hover:bg-stone-100 text-blue-600 border-stone-300'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore from Backup File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Staff Logins & RBAC Visibility */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Top Control Header */}
          <div className={`rounded-xl border p-6 space-y-5 text-xs transition-colors ${
            isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#D4AF37] font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>STAFF ACCESS CONTROL &amp; VISIBILITY RULES</span>
                </div>
                <h2 className={`text-base font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Sales Staff Accounts &amp; Information Visibility (سیلز لاگ ان اور فیلڈ کنٹرول)
                </h2>
                <p className={`mt-0.5 max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Generate salesperson logins with password protection. Decide exactly what information each salesperson can see and what stays hidden (e.g. client phone numbers, addresses, fabric costs, gross profits, financial balances).
                </p>
              </div>

              {currentUser.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    const rnd = Math.floor(1000 + Math.random() * 9000);
                    setStaffForm({
                      name: '',
                      username: `sales_${rnd}`,
                      email: '',
                      password: `zs_sales_${rnd}`,
                      title: 'Showroom Sales Associate',
                      canViewCustomerPhone: false, // Default: HIDE phone
                      canViewCustomerAddress: false, // Default: HIDE address
                      canViewProfits: false, // Default: HIDE wholesale costs & profit
                      canViewFinancialTotals: false, // Default: HIDE revenue balances
                      canEditMeasurements: true,
                      canApplyDiscounts: true,
                      allowedViews: ['orders', 'products', 'customers', 'thermal'],
                    });
                    setEditingStaffId(null);
                    setStaffFormError('');
                    setIsStaffModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Generate New Sales Login</span>
                </button>
              )}
            </div>

            {/* Registered Staff Accounts Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Configured Atelier Logins ({staffUsers.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Password strictly enforced for each login
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffUsers.map((user) => {
                  const isAdmin = user.role === 'ADMIN';
                  const isCurrent = currentUser.id === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                        isCurrent
                          ? 'border-[#D4AF37] bg-[#121B2F]/80 shadow-xs'
                          : isDarkMode
                          ? 'bg-[#090E18] border-[#182338]'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div>
                        {/* Header with Role & Quick Copy */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isAdmin ? 'bg-[#D4AF37] text-slate-950' : 'bg-blue-600 text-white'
                            }`}>
                              {isAdmin ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                  {user.name}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-[#D4AF37]/20 text-[#E6CA85] border border-[#D4AF37]/40">
                                    You (Logged In)
                                  </span>
                                )}
                              </div>
                              <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                                {user.title}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                            isAdmin ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-blue-500/15 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>

                        {/* Credentials Card */}
                        <div className={`p-2.5 rounded-lg border font-mono text-[11px] space-y-1 ${
                          isDarkMode ? 'bg-[#060A12] border-[#141E30]' : 'bg-white border-stone-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Username:</span>
                            <span className="font-bold text-white">@{user.username || 'user'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Password:</span>
                            <span className="font-semibold text-amber-400">
                              {user.password || '••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Email:</span>
                            <span className="text-slate-300 truncate max-w-[180px]">{user.email}</span>
                          </div>
                        </div>

                        {/* Visibility & Hidden Info Badges */}
                        <div className="mt-3 space-y-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                            Information Visibility Status:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {/* Phone badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                              user.permissions.canViewCustomerPhone
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                            }`}>
                              <span>Phone:</span>
                              <strong>{user.permissions.canViewCustomerPhone ? 'Visible' : 'HIDDEN'}</strong>
                            </span>

                            {/* Address badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                              user.permissions.canViewCustomerAddress
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                            }`}>
                              <span>Address:</span>
                              <strong>{user.permissions.canViewCustomerAddress ? 'Visible' : 'HIDDEN'}</strong>
                            </span>

                            {/* Profit / COGS badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                              user.permissions.canViewProfits
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                            }`}>
                              <span>Costs &amp; Profits:</span>
                              <strong>{user.permissions.canViewProfits ? 'Visible' : 'HIDDEN'}</strong>
                            </span>

                            {/* Financial totals */}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                              user.permissions.canViewFinancialTotals
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                            }`}>
                              <span>Financial Totals:</span>
                              <strong>{user.permissions.canViewFinancialTotals ? 'Visible' : 'HIDDEN'}</strong>
                            </span>

                            {/* Measurements edit badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                              user.permissions.canEditMeasurements
                                ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                                : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                            }`}>
                              <span>Measurements:</span>
                              <strong>{user.permissions.canEditMeasurements ? 'Can Edit' : 'Read-Only'}</strong>
                            </span>
                          </div>

                          {/* Allowed views */}
                          <div className="text-[10px] text-slate-400 mt-1">
                            <span className="text-slate-500">Allowed Menu Sections: </span>
                            <span className="font-mono text-slate-300">
                              {(user.permissions.allowedViews || ['orders', 'products', 'customers', 'thermal']).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-[#182338] flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const creds = `${config.businessName || 'Atelier'} Login Credentials\nName: ${user.name}\nUsername: ${user.username}\nPassword: ${user.password}\nRole: ${user.role}`;
                            navigator.clipboard.writeText(creds);
                            setCopiedStaffId(user.id);
                            setTimeout(() => setCopiedStaffId(null), 2500);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                            copiedStaffId === user.id
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : isDarkMode
                              ? 'bg-[#121A2C] hover:bg-[#18233C] text-slate-300 border-[#202E4A]'
                              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                          title="Copy login information"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{copiedStaffId === user.id ? 'Credentials Copied!' : 'Copy Login Info'}</span>
                        </button>

                        {currentUser.role === 'ADMIN' && (
                          <div className="flex items-center gap-1.5">
                            {isAdmin ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStaffId(user.id);
                                  setStaffForm({
                                    name: user.name,
                                    username: user.username,
                                    email: user.email,
                                    password: user.password || '',
                                    title: user.title,
                                    canViewCustomerPhone: true,
                                    canViewCustomerAddress: true,
                                    canViewProfits: true,
                                    canViewFinancialTotals: true,
                                    canEditMeasurements: true,
                                    canApplyDiscounts: true,
                                    allowedViews: user.permissions.allowedViews || ['dashboard', 'orders', 'products', 'customers', 'thermal', 'finance', 'settings', 'audit'],
                                  });
                                  setStaffFormError('');
                                  setIsStaffModalOpen(true);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                                  isDarkMode
                                    ? 'bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E6CA85] border-[#D4AF37]/40'
                                    : 'bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#846227] border-[#D4AF37]/50'
                                }`}
                                title="Edit Admin Login ID, username, password and profile"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>Edit Admin ID &amp; Login</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStaffId(user.id);
                                    setStaffForm({
                                      name: user.name,
                                      username: user.username,
                                      email: user.email,
                                      password: user.password || '',
                                      title: user.title,
                                      canViewCustomerPhone: user.permissions.canViewCustomerPhone,
                                      canViewCustomerAddress: user.permissions.canViewCustomerAddress,
                                      canViewProfits: user.permissions.canViewProfits,
                                      canViewFinancialTotals: user.permissions.canViewFinancialTotals,
                                      canEditMeasurements: user.permissions.canEditMeasurements,
                                      canApplyDiscounts: user.permissions.canApplyDiscounts,
                                      allowedViews: user.permissions.allowedViews || ['orders', 'products', 'customers', 'thermal'],
                                    });
                                    setStaffFormError('');
                                    setIsStaffModalOpen(true);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                                    isDarkMode
                                      ? 'bg-[#121A2C] hover:bg-[#18233C] text-[#E6CA85] border-[#202E4A]'
                                      : 'bg-white hover:bg-stone-100 text-[#846227] border-stone-300'
                                  }`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Visibility</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete login account for ${user.name} (@${user.username})?`)) {
                                      db.deleteSalesUser(user.id, currentUser);
                                      reloadStaff();
                                      setSaveSuccessMessage(`Sales account @${user.username} deleted.`);
                                      setSaveSuccess(true);
                                      setTimeout(() => setSaveSuccess(false), 3000);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 transition-colors"
                                  title="Delete sales account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Role Switcher Reminder */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
            }`}>
              <div>
                <span className={`font-semibold block ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Active Logged In Account:</span>
                <span className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>
                  You are navigating as <strong>{currentUser.name}</strong> (@{currentUser.username || 'user'}, {currentUser.role}).
                </span>
              </div>
              <button
                type="button"
                onClick={onSwitchUser}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-lg shadow-xs shrink-0 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Switch / Test Another Login (Requires Password)</span>
              </button>
            </div>
          </div>

          {/* RBAC Reference Isolation Matrix */}
          <div className={`rounded-xl border p-6 space-y-4 text-xs transition-colors ${
            isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
          }`}>
            <div>
              <h3 className={`text-base font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Role-Based Access Control (RBAC) &amp; Privacy Isolation Matrix
              </h3>
              <p className={`mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Demonstrates how sensitive client telephone numbers, addresses, and business profit margins are isolated or masked.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-[#182338] text-slate-400 bg-[#090E18]' : 'border-stone-200 text-stone-600 bg-stone-50'}`}>
                    <th className="py-3 px-4">System Capability / Field</th>
                    <th className="py-3 px-4 text-center">Admin (Owner)</th>
                    <th className="py-3 px-4 text-center">Salesperson (Default)</th>
                    <th className="py-3 px-4">Customizable Per Salesperson?</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'}`}>
                  {[
                    {
                      name: 'Client Telephone Number',
                      admin: true,
                      emp: false,
                      custom: 'Yes - Admin can toggle Show or Hide per sales account',
                    },
                    {
                      name: 'Client Street Address',
                      admin: true,
                      emp: false,
                      custom: 'Yes - Admin can toggle Show or Hide per sales account',
                    },
                    {
                      name: 'Wholesale Fabric Costs & Profit Margins',
                      admin: true,
                      emp: false,
                      custom: 'Yes - Admin can toggle Show or Hide per sales account',
                    },
                    {
                      name: 'Total Store Financial Balances & Receivables',
                      admin: true,
                      emp: false,
                      custom: 'Yes - Admin can toggle Show or Hide per sales account',
                    },
                    {
                      name: 'Edit Bespoke Measurements & Alterations',
                      admin: true,
                      emp: true,
                      custom: 'Yes - Admin can set to Can Edit or Read-Only',
                    },
                    {
                      name: 'Apply Order Discounts',
                      admin: true,
                      emp: true,
                      custom: 'Yes - Admin can allow or restrict custom discounts',
                    },
                    {
                      name: 'Allowed Navigation Modules',
                      admin: true,
                      emp: true,
                      custom: 'Yes - Admin can choose which tabs are visible/hidden in sidebar',
                    },
                    {
                      name: 'Purge Records & Hardware Printer Setup',
                      admin: true,
                      emp: false,
                      custom: 'No - Strictly locked to Admin only',
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                      <td className={`py-3 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{row.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-semibold text-emerald-500">
                          Granted
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.emp ? (
                          <span className="text-[11px] font-semibold text-emerald-500">
                            Granted
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-500">
                            Restricted
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-4 font-mono text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                        {row.custom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GENERATE / EDIT SALESPERSON & ADMIN MODAL */}
          {isStaffModalOpen && (() => {
            const isEditingAdmin = editingStaffId
              ? staffUsers.find((u) => u.id === editingStaffId)?.role === 'ADMIN'
              : false;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="px-6 py-4 bg-gradient-to-b from-[#0B101B] to-[#0E1524] border-b border-[#182338] flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white font-serif-display flex items-center gap-2">
                        {isEditingAdmin ? <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> : <UserPlus className="w-5 h-5 text-[#D4AF37]" />}
                        <span>
                          {isEditingAdmin
                            ? 'Edit Admin ID & Account Credentials'
                            : (editingStaffId ? 'Edit Salesperson Visibility & Access' : 'Generate New Salesperson Login')}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isEditingAdmin
                          ? 'Change your Admin Login ID / Username, Password, Display Name, and Email.'
                          : 'Configure account credentials and choose exactly what information to hide or show.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsStaffModalOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setStaffFormError('');

                      if (!staffForm.name.trim()) {
                        setStaffFormError('Please enter the full name.');
                        return;
                      }

                      if (!staffForm.username.trim()) {
                        setStaffFormError('Please enter a username / login ID.');
                        return;
                      }

                      if (!staffForm.password.trim()) {
                        setStaffFormError('Password is required! You cannot have an account without a password.');
                        return;
                      }

                      try {
                        if (editingStaffId) {
                          db.updateSalesUser(
                            editingStaffId,
                            {
                              name: staffForm.name.trim(),
                              username: staffForm.username.trim().toLowerCase(),
                              title: staffForm.title.trim(),
                              email: staffForm.email.trim(),
                              password: staffForm.password.trim(),
                              permissions: isEditingAdmin
                                ? staffUsers.find((u) => u.id === editingStaffId)!.permissions
                                : {
                                    ...staffUsers.find((u) => u.id === editingStaffId)!.permissions,
                                    canViewCustomerPhone: staffForm.canViewCustomerPhone,
                                    canViewCustomerAddress: staffForm.canViewCustomerAddress,
                                    canViewProfits: staffForm.canViewProfits,
                                    canViewFinancialTotals: staffForm.canViewFinancialTotals,
                                    canEditMeasurements: staffForm.canEditMeasurements,
                                    canApplyDiscounts: staffForm.canApplyDiscounts,
                                    allowedViews: staffForm.allowedViews,
                                  },
                            },
                            currentUser
                          );
                          setSaveSuccessMessage(
                            isEditingAdmin
                              ? `Admin Login ID & profile updated! New login: @${staffForm.username.trim().toLowerCase()}`
                              : `Updated visibility and login for @${staffForm.username}`
                          );
                        } else {
                          db.createSalesUser(
                            {
                              name: staffForm.name.trim(),
                              username: staffForm.username.trim().toLowerCase(),
                              email: staffForm.email.trim() || `${staffForm.username.trim().toLowerCase()}@sartoriallibas.pk`,
                              password: staffForm.password.trim(),
                              title: staffForm.title.trim() || 'Showroom Sales Associate',
                              permissions: {
                                canViewProfits: staffForm.canViewProfits,
                                canViewCustomerPhone: staffForm.canViewCustomerPhone,
                                canViewCustomerAddress: staffForm.canViewCustomerAddress,
                                canViewPrivateWhatsApp: false,
                                canManageSettings: false,
                                canDeleteRecords: false,
                                canExportData: false,
                                canViewFinancialTotals: staffForm.canViewFinancialTotals,
                                canEditMeasurements: staffForm.canEditMeasurements,
                                canApplyDiscounts: staffForm.canApplyDiscounts,
                                allowedViews: staffForm.allowedViews,
                              },
                            },
                            currentUser
                          );
                          setSaveSuccessMessage(`New sales login @${staffForm.username} created successfully! Password protected.`);
                        }

                        reloadStaff();
                        setIsStaffModalOpen(false);
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3500);
                      } catch (err: any) {
                        setStaffFormError(err.message || 'Failed to save account.');
                      }
                    }}
                    className="p-6 space-y-5 overflow-y-auto text-xs bg-[#0E1524]"
                  >
                    {staffFormError && (
                      <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{staffFormError}</span>
                      </div>
                    )}

                    {/* Section 1: Basic Account Info */}
                    <div className="p-4 rounded-xl bg-[#080D17] border border-[#182338] space-y-3">
                      <span className="font-bold text-white text-xs uppercase tracking-wider block">
                        1. {isEditingAdmin ? 'Admin Credentials & Profile' : 'Login Credentials & Profile'}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-medium mb-1">
                            {isEditingAdmin ? 'Admin Full Name' : 'Full Name'}
                          </label>
                          <input
                            type="text"
                            required
                            value={staffForm.name}
                            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                            placeholder="e.g. Administrator"
                            className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                            <span>{isEditingAdmin ? 'Admin ID / Username (لاگ ان آئی ڈی)' : 'Username (Login ID)'}</span>
                            {isEditingAdmin && <span className="text-[10px] text-[#D4AF37] font-semibold">Editable</span>}
                          </label>
                          <input
                            type="text"
                            required
                            value={staffForm.username}
                            onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value.replace(/[^a-zA-Z0-9._-]/g, '') })}
                            placeholder={isEditingAdmin ? 'e.g. admin' : 'e.g. aliraza'}
                            className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            {isEditingAdmin ? 'Use this login ID to sign into the Atelier ERP.' : 'Salesperson will use this username to sign in.'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-slate-300 font-medium flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{isEditingAdmin ? 'Admin Password (پاس ورڈ)' : 'Password (لازمی پاس ورڈ)'}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const rnd = Math.floor(1000 + Math.random() * 9000);
                                setStaffForm({ ...staffForm, password: isEditingAdmin ? `admin_${rnd}` : `sales_${rnd}` });
                              }}
                              className="text-[10px] text-[#D4AF37] hover:underline"
                            >
                              + Generate Random
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showStaffPassword ? 'text' : 'password'}
                              required
                              value={staffForm.password}
                              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                              placeholder="Set password"
                              className="w-full px-3 py-2 pr-10 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowStaffPassword(!showStaffPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              {showStaffPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-medium mb-1">Job Designation / Title</label>
                          <input
                            type="text"
                            value={staffForm.title}
                            onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })}
                            placeholder={isEditingAdmin ? 'Managing Director & Master Tailor' : 'e.g. Senior Floor Associate'}
                            className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                        <input
                          type="email"
                          value={staffForm.email}
                          onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                          placeholder={isEditingAdmin ? 'admin@atelier.com' : 'sales@atelier.com'}
                          className="w-full px-3 py-2 bg-[#0E1524] border border-[#182338] rounded-lg text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {isEditingAdmin ? (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5">
                        <div className="font-semibold flex items-center gap-2 text-[#D4AF37]">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Master Privileges (مکمل ایڈمن اختیارات)</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          The Administrator account retains full, unrestricted master access across all ERP views, financial records, client phone numbers, wholesale costs, and atelier settings.
                        </p>
                      </div>
                    ) : (
                      <>

                  {/* Section 2: Granular Information Visibility Toggles */}
                  <div className="p-4 rounded-xl bg-[#080D17] border border-[#182338] space-y-3.5">
                    <div>
                      <span className="font-bold text-white text-xs uppercase tracking-wider block">
                        2. Information Visibility &amp; Hidden Data Controls
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Choose what information to hide or show for this salesperson account.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {/* Phone visibility */}
                      <div className="p-3 rounded-lg border border-[#182338] bg-[#0E1524] flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Client Telephone Numbers (کلائنٹ کا فون نمبر)</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {staffForm.canViewCustomerPhone
                              ? 'Show: Salesperson can view real client phone numbers'
                              : 'HIDE: Salesperson only sees client name. Phone is masked (••••••••••••)'}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={staffForm.canViewCustomerPhone}
                            onChange={(e) => setStaffForm({ ...staffForm, canViewCustomerPhone: e.target.checked })}
                            className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${staffForm.canViewCustomerPhone ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {staffForm.canViewCustomerPhone ? 'Show Phone' : 'HIDE Phone'}
                          </span>
                        </label>
                      </div>

                      {/* Address visibility */}
                      <div className="p-3 rounded-lg border border-[#182338] bg-[#0E1524] flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Client Street &amp; House Address (پتہ چھپائیں)</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {staffForm.canViewCustomerAddress
                              ? 'Show: Salesperson can view full street addresses'
                              : 'HIDE: House and street address hidden; only city is shown'}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={staffForm.canViewCustomerAddress}
                            onChange={(e) => setStaffForm({ ...staffForm, canViewCustomerAddress: e.target.checked })}
                            className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${staffForm.canViewCustomerAddress ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {staffForm.canViewCustomerAddress ? 'Show Address' : 'HIDE Address'}
                          </span>
                        </label>
                      </div>

                      {/* Wholesale Costs & Profits */}
                      <div className="p-3 rounded-lg border border-[#182338] bg-[#0E1524] flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Wholesale Costs &amp; Gross Margins (خرید لاگت اور منافع)</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {staffForm.canViewProfits
                              ? 'Show: Salesperson can view factory cost price & margins'
                              : 'HIDE: Wholesale cost columns and profit percentages are concealed'}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={staffForm.canViewProfits}
                            onChange={(e) => setStaffForm({ ...staffForm, canViewProfits: e.target.checked })}
                            className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${staffForm.canViewProfits ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {staffForm.canViewProfits ? 'Show Costs' : 'HIDE Costs'}
                          </span>
                        </label>
                      </div>

                      {/* Financial Balances */}
                      <div className="p-3 rounded-lg border border-[#182338] bg-[#0E1524] flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Financial Totals &amp; Cashflow Summary (مجموعی آمدنی)</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {staffForm.canViewFinancialTotals
                              ? 'Show: Salesperson can view overall revenue totals & balances'
                              : 'HIDE: Financial totals and client spend balances are concealed'}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={staffForm.canViewFinancialTotals}
                            onChange={(e) => setStaffForm({ ...staffForm, canViewFinancialTotals: e.target.checked })}
                            className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${staffForm.canViewFinancialTotals ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {staffForm.canViewFinancialTotals ? 'Show Totals' : 'HIDE Totals'}
                          </span>
                        </label>
                      </div>

                      {/* Measurement Editing */}
                      <div className="p-3 rounded-lg border border-[#182338] bg-[#0E1524] flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <div className="font-semibold text-white">Bespoke Measurements Editing Rights</div>
                          <div className="text-[11px] text-slate-400">
                            {staffForm.canEditMeasurements
                              ? 'Allowed: Can record bespoke measurements & alterations'
                              : 'Restricted: Measurements are read-only for this salesperson'}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={staffForm.canEditMeasurements}
                            onChange={(e) => setStaffForm({ ...staffForm, canEditMeasurements: e.target.checked })}
                            className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${staffForm.canEditMeasurements ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {staffForm.canEditMeasurements ? 'Can Edit' : 'Read-Only'}
                          </span>
                        </label>
                      </div>

                      {/* Custom Order Discounts */}
                      <div className="p-3 rounded-lg border border-[#182338] bg-[#0E1524] flex items-center justify-between">
                        <div className="space-y-0.5 pr-2">
                          <div className="font-semibold text-white">Custom Order Discount Rights</div>
                          <div className="text-[11px] text-slate-400">
                            {staffForm.canApplyDiscounts
                              ? 'Allowed: Can enter custom discount amounts on suit orders'
                              : 'Restricted: Cannot apply discounts without admin approval'}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={staffForm.canApplyDiscounts}
                            onChange={(e) => setStaffForm({ ...staffForm, canApplyDiscounts: e.target.checked })}
                            className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${staffForm.canApplyDiscounts ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {staffForm.canApplyDiscounts ? 'Allow Discounts' : 'Disallow'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Allowed Navigation Views */}
                  <div className="p-4 rounded-xl bg-[#080D17] border border-[#182338] space-y-3">
                    <span className="font-bold text-white text-xs uppercase tracking-wider block">
                      3. Allowed Navigation Menu Sections (منیو آپشنز)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Unchecked sections will be completely hidden from the salesperson sidebar.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { id: 'orders', label: 'Suit Orders' },
                        { id: 'products', label: 'Products & Fabrics' },
                        { id: 'customers', label: 'Client Cards' },
                        { id: 'thermal', label: 'Thermal Station' },
                      ].map((view) => {
                        const isChecked = staffForm.allowedViews.includes(view.id);
                        return (
                          <button
                            key={view.id}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                if (staffForm.allowedViews.length <= 1) {
                                  alert('At least one navigation section must remain enabled.');
                                  return;
                                }
                                setStaffForm({
                                  ...staffForm,
                                  allowedViews: staffForm.allowedViews.filter((v) => v !== view.id),
                                });
                              } else {
                                setStaffForm({
                                  ...staffForm,
                                  allowedViews: [...staffForm.allowedViews, view.id],
                                });
                              }
                            }}
                            className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                              isChecked
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-semibold'
                                : 'bg-[#0E1524] border-[#182338] text-slate-400'
                            }`}
                          >
                            <span>{view.label}</span>
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  </>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isEditingAdmin
                        ? 'Save Admin Profile & ID'
                        : (editingStaffId ? 'Save Visibility Changes' : 'Generate & Save Sales Login')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
        </div>
      )}

      {/* TAB 6: Audit Trail */}
      {activeTab === 'audit' && (
        <div className={`rounded-xl border overflow-hidden text-xs transition-colors ${
          isDarkMode ? 'bg-[#0E1524] border-[#182338]' : 'bg-white border-[#E7E2D8] shadow-xs'
        }`}>
          <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDarkMode ? 'bg-[#090E18] border-[#182338]' : 'bg-stone-50 border-stone-200'
          }`}>
            <div>
              <h2 className={`font-bold font-serif-display ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                System Activity Audit Log
              </h2>
              <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Immutable chronological log of all stock adjustments, order status changes, and logins
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                placeholder="Filter logs by user or action..."
                className={`w-full pl-8 pr-3 py-1.5 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${
                  isDarkMode ? 'bg-[#121A2C] border-[#182338] text-white' : 'bg-white border-stone-300 text-stone-900'
                }`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${
                  isDarkMode ? 'border-[#182338] text-slate-400 bg-[#0B101B]' : 'border-stone-200 text-stone-600 bg-stone-100'
                }`}>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono text-[11px] ${
                isDarkMode ? 'divide-[#182338] text-slate-200' : 'divide-stone-200 text-stone-800'
              }`}>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className={isDarkMode ? 'hover:bg-[#121A2C]' : 'hover:bg-stone-50'}>
                    <td className={`py-3 px-4 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>{log.timestamp}</td>
                    <td className={`py-3 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        log.userRole === 'ADMIN' ? isDarkMode ? 'text-[#E6CA85]' : 'text-[#846227]' : 'text-blue-500'
                      }`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-bold ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>{log.action}</td>
                    <td className={`py-3 px-4 font-sans text-xs ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
