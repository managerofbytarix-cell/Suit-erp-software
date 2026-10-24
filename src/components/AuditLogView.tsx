/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ShoppingBag,
  Users,
  Scissors,
  CreditCard,
  Settings,
  Shield,
  FileText,
  RotateCcw,
  Sparkles,
  PlusCircle,
  X,
  Clock,
  ArrowUpDown,
  Lock
} from 'lucide-react';
import { AuditLog, UserAccount } from '../types/index.ts';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
  currentUser: UserAccount;
  onAddManualLog?: (action: string, details: string, entityType: AuditLog['entityType']) => void;
  onClearLogs?: () => void;
  isDarkMode?: boolean;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  currentUser,
  onAddManualLog,
  onClearLogs,
  isDarkMode = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualAction, setManualAction] = useState('SECURITY_CHECK');
  const [manualDetails, setManualDetails] = useState('');
  const [manualEntity, setManualEntity] = useState<AuditLog['entityType']>('AUTH');

  const isAdmin = currentUser.role === 'ADMIN';

  // Metrics
  const totalLogs = auditLogs.length;
  const orderLogsCount = auditLogs.filter((l) => l.entityType === 'ORDER').length;
  const customerLogsCount = auditLogs.filter((l) => l.entityType === 'CUSTOMER').length;
  const systemLogsCount = auditLogs.filter(
    (l) => l.entityType === 'SETTINGS' || l.entityType === 'AUTH' || l.entityType === 'BACKUP'
  ).length;

  // Filtered and Sorted Logs
  const filteredLogs = useMemo(() => {
    let result = auditLogs.filter((log) => {
      // Entity Filter
      if (selectedEntity !== 'ALL' && log.entityType !== selectedEntity) {
        return false;
      }
      // Role Filter
      if (selectedRole !== 'ALL' && log.userRole !== selectedRole) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchUser = log.userName.toLowerCase().includes(q);
        const matchEntity = log.entityType.toLowerCase().includes(q);
        const matchTime = log.timestamp.toLowerCase().includes(q);
        if (!matchAction && !matchDetails && !matchUser && !matchEntity && !matchTime) {
          return false;
        }
      }
      return true;
    });

    if (sortOrder === 'asc') {
      result = [...result].reverse();
    }
    return result;
  }, [auditLogs, selectedEntity, selectedRole, searchQuery, sortOrder]);

  // Export handlers
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `atelier_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User Name', 'Role', 'Entity Type', 'Action', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName.replace(/"/g, '""')}"`,
      `"${l.userRole}"`,
      `"${l.entityType}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atelier_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDetails.trim()) return;
    if (onAddManualLog) {
      onAddManualLog(manualAction.trim().toUpperCase(), manualDetails.trim(), manualEntity);
    }
    setManualDetails('');
    setIsManualModalOpen(false);
  };

  const getEntityIcon = (type: AuditLog['entityType']) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />;
      case 'CUSTOMER':
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PRODUCT':
        return <Scissors className="w-3.5 h-3.5 text-purple-400" />;
      case 'PAYMENT':
        return <CreditCard className="w-3.5 h-3.5 text-blue-400" />;
      case 'SETTINGS':
        return <Settings className="w-3.5 h-3.5 text-rose-400" />;
      case 'AUTH':
      case 'BACKUP':
        return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getEntityBadgeStyle = (type: AuditLog['entityType']) => {
    switch (type) {
      case 'ORDER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CUSTOMER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PRODUCT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'PAYMENT':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'SETTINGS':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'AUTH':
      case 'BACKUP':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (!isAdmin) {
    return (
      <div className={`p-8 rounded-2xl border text-center max-w-lg mx-auto my-12 ${
        isDarkMode ? 'bg-[#0E1526] border-[#1C2942]' : 'bg-white border-[#E2DDD4]'
      }`}>
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Restricted Security Area</h2>
        <p className="text-xs text-slate-400 mb-6">
          The System Audit Log is restricted to Master Tailors and Managing Directors (Admin Role). Sales associates do not have clearance to view audit trail logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className={`text-2xl font-bold font-serif-display tracking-tight ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>
              System Audit Log &amp; Security Trail
            </h1>
          </div>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Immutable chronological register of all atelier transactions, customer modifications, order dispatches, and administrative configurations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#D4AF37] text-slate-950 hover:bg-[#E6CA85] transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Security Check</span>
          </button>

          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-[#101728] hover:bg-[#162138] text-slate-300 border-[#1F2C45]'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
            }`}
            title="Download audit logs as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-[#101728] hover:bg-[#162138] text-slate-300 border-[#1F2C45]'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
            }`}
            title="Download audit logs as JSON"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>JSON</span>
          </button>

          {onClearLogs && (
            <button
              onClick={() => {
                if (window.confirm('Clear all audit logs? This cannot be undone.')) {
                  onClearLogs();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border-rose-800/40'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
              title="Prune all audit logs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Prune Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1526] border-[#1C2942]' : 'bg-white border-[#E2DDD4] shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Events</span>
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {totalLogs}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded in database</div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1526] border-[#1C2942]' : 'bg-white border-[#E2DDD4] shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Order &amp; Fits</span>
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-amber-400">
            {orderLogsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Creation, status &amp; trials</div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1526] border-[#1C2942]' : 'bg-white border-[#E2DDD4] shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Customer Events</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-emerald-400">
            {customerLogsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Family &amp; measurements</div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#0E1526] border-[#1C2942]' : 'bg-white border-[#E2DDD4] shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>System &amp; Settings</span>
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-indigo-400">
            {systemLogsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Config, auth &amp; backups</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#0E1526] border-[#1C2942]' : 'bg-white border-[#E2DDD4]'
      }`}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, details, user name, timestamp..."
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none transition-colors ${
              isDarkMode
                ? 'bg-[#070B14] border-[#182338] text-white focus:border-[#D4AF37]'
                : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Entity dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className={`px-3 py-2 text-xs rounded-lg border outline-none font-medium ${
              isDarkMode
                ? 'bg-[#070B14] border-[#182338] text-slate-200'
                : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}
          >
            <option value="ALL">All Entity Types</option>
            <option value="ORDER">Orders &amp; Fittings</option>
            <option value="CUSTOMER">Customers &amp; Family</option>
            <option value="PRODUCT">Products &amp; Fabrics</option>
            <option value="PAYMENT">Payments &amp; Expenses</option>
            <option value="SETTINGS">Settings &amp; Atelier</option>
            <option value="AUTH">Authentication &amp; Security</option>
            <option value="CATEGORY">Categories</option>
            <option value="BACKUP">Backups &amp; Restore</option>
            <option value="AI_AGENT">Sartorial AI</option>
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`px-3 py-2 text-xs rounded-lg border outline-none font-medium ${
              isDarkMode
                ? 'bg-[#070B14] border-[#182338] text-slate-200'
                : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin Only</option>
            <option value="EMPLOYEE">Salesperson / Staff</option>
          </select>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className={`flex items-center gap-1 px-3 py-2 text-xs rounded-lg border font-medium transition-colors ${
              isDarkMode
                ? 'bg-[#070B14] border-[#182338] text-slate-300 hover:text-white'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:text-stone-900'
            }`}
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className={`rounded-xl border overflow-hidden ${
        isDarkMode ? 'bg-[#0E1526] border-[#1C2942]' : 'bg-white border-[#E2DDD4] shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] uppercase tracking-wider ${
                isDarkMode
                  ? 'border-[#1C2942] bg-[#070B14] text-slate-400'
                  : 'border-[#E2DDD4] bg-[#FAF8F5] text-stone-500 font-semibold'
              }`}>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details &amp; Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2942]/60 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="w-6 h-6 text-slate-600" />
                      <span>No audit logs found matching your filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      isDarkMode ? 'hover:bg-[#141D32]' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-300 text-[11px]">
                        {log.timestamp}
                      </div>
                    </td>

                    {/* Operator & Role */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          log.userRole === 'ADMIN'
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        }`}>
                          {log.userName.slice(0, 1)}
                        </div>
                        <div>
                          <div className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>
                            {log.userName}
                          </div>
                          <div className={`text-[10px] ${
                            log.userRole === 'ADMIN' ? 'text-[#D4AF37]' : 'text-blue-400'
                          }`}>
                            {log.userRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Entity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono border ${getEntityBadgeStyle(log.entityType)}`}>
                        {getEntityIcon(log.entityType)}
                        <span>{log.entityType}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-mono text-[11px] font-semibold ${
                        isDarkMode ? 'text-slate-100' : 'text-stone-900'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4">
                      <div className={`leading-relaxed text-[11px] ${
                        isDarkMode ? 'text-slate-300' : 'text-stone-700'
                      }`}>
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Security Note Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
            isDarkMode ? 'bg-[#0E1526] border-[#1C2942] text-white' : 'bg-white border-[#E2DDD4] text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-[#1C2942]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm font-serif-display">Record Audit / Security Note</h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Action Type
                </label>
                <input
                  type="text"
                  value={manualAction}
                  onChange={(e) => setManualAction(e.target.value.toUpperCase())}
                  placeholder="e.g. INVENTORY_PHYSICAL_COUNT, SHIFT_CASH_VERIFIED"
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none font-mono ${
                    isDarkMode ? 'bg-[#070B14] border-[#182338] text-white' : 'bg-stone-50 border-stone-200'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Entity Category
                </label>
                <select
                  value={manualEntity}
                  onChange={(e) => setManualEntity(e.target.value as AuditLog['entityType'])}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none font-medium ${
                    isDarkMode ? 'bg-[#070B14] border-[#182338] text-slate-200' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <option value="AUTH">Authentication / Security</option>
                  <option value="ORDER">Orders &amp; Fittings</option>
                  <option value="CUSTOMER">Customers</option>
                  <option value="PRODUCT">Products &amp; Stock</option>
                  <option value="PAYMENT">Cash &amp; Payments</option>
                  <option value="SETTINGS">Atelier Settings</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Log Details &amp; Findings
                </label>
                <textarea
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe the security check or verification details..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#070B14] border-[#182338] text-white' : 'bg-stone-50 border-stone-200'
                  }`}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#D4AF37] text-slate-950 hover:bg-[#E6CA85]"
                >
                  Record into Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
