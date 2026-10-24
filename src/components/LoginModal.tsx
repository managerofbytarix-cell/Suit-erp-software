/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Eye,
  EyeOff,
  Key,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { db, ADMIN_USER, EMPLOYEE_USER } from '../db/demoDatabase.ts';
import { UserAccount } from '../types/index.ts';

interface LoginModalProps {
  isOpen: boolean;
  isLocked?: boolean; // When true, cannot be dismissed without valid password login
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  activeUser: UserAccount;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  isLocked = false,
  onClose,
  onLogin,
  activeUser,
}) => {
  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemUsers, setSystemUsers] = useState<UserAccount[]>([]);

  // Load all accounts (including newly generated sales accounts)
  useEffect(() => {
    if (isOpen) {
      try {
        const users = db.getUsers();
        setSystemUsers(users);
        // Pre-fill active user's username or identifier if not locked, or default to admin
        if (!identifierInput) {
          setIdentifierInput(activeUser?.username || 'admin');
        }
      } catch {
        setSystemUsers([ADMIN_USER, EMPLOYEE_USER]);
      }
      setLoginError('');
      setPasswordInput('');
    }
  }, [isOpen, activeUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = identifierInput.trim();
    const cleanPw = passwordInput.trim();

    if (!cleanId) {
      setLoginError('Please enter your username or email address.');
      return;
    }

    if (!cleanPw) {
      setLoginError('Password is required! You cannot log in without entering your password.');
      return;
    }

    setIsSubmitting(true);
    // Strict authentication via database service
    const authResult = db.authenticateUser(cleanId, cleanPw);
    setIsSubmitting(false);

    if (authResult.success && authResult.user) {
      onLogin(authResult.user);
      onClose();
    } else {
      setLoginError(authResult.error || 'Authentication failed: Invalid credentials. Password is required.');
    }
  };

  const handleSelectAccountChip = (user: UserAccount) => {
    setIdentifierInput(user.username || user.email);
    // Fill in the account's password so the user sees the password field populated and can sign in
    setPasswordInput(user.password || '');
    setLoginError('');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in ${
      isLocked ? 'cursor-default' : ''
    }`}>
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Brand Header */}
        <div className="px-6 py-5 bg-gradient-to-b from-[#0B101B] to-[#0E1524] border-b border-[#182338] text-center relative">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#D4AF37] font-semibold mb-1 tracking-wide">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Atelier Access Portal</span>
            <span aria-hidden="true">·</span>
            <span>Password Protected</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-serif-display tracking-tight">
            Atelier ERP
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {isLocked
              ? 'Atelier session locked. Enter your account password to verify your identity and access your authorized workspace.'
              : 'Switch user session or verify credentials. Password is required for all atelier logins.'}
          </p>

          {!isLocked && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="p-6 space-y-6 text-xs bg-[#0E1524]">
          {/* Error Banner */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-300">Access Denied</div>
                <div className="text-[11px] mt-0.5 leading-relaxed">{loginError}</div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                <span>Username or Email Address</span>
                <span className="text-[10px] text-slate-500 font-mono">e.g. admin or sales</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifierInput}
                  onChange={(e) => {
                    setIdentifierInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Enter username (e.g. admin, sales) or email"
                  className="w-full px-3.5 py-2.5 bg-[#080D17] border border-[#182338] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white font-semibold">
                  <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Account Password (لازمی پاس ورڈ)</span>
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium">
                  * Password strictly required
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Enter your confidential password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#080D17] border border-[#182338] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#E6CA85] text-slate-950 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In With Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Credential Helpers */}
          <div className="pt-2 border-t border-[#182338] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Authorized Atelier Accounts ({systemUsers.length})</span>
              </span>
              <span className="text-[10px] text-slate-500">Click to fill credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {systemUsers.map((u) => {
                const isAdmin = u.role === 'ADMIN';
                const isSelected = identifierInput.toLowerCase() === (u.username?.toLowerCase() || u.email.toLowerCase());

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectAccountChip(u)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#141F35] border-[#D4AF37] text-white shadow-xs'
                        : 'bg-[#080D17] border-[#182338] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                      isAdmin ? 'bg-[#D4AF37] text-slate-950' : 'bg-blue-600 text-white'
                    }`}>
                      {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-white truncate text-[11px]">{u.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                          isAdmin ? 'text-[#D4AF37] bg-[#D4AF37]/15' : 'text-blue-400 bg-blue-500/15'
                        }`}>
                          {isAdmin ? 'Admin' : 'Sales'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        @{u.username || 'user'} · pwd: {u.password || '••••'}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                        {isAdmin ? 'All options & margins visible' : 'Selective options & hidden info'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-[#090F1C] border border-[#162136] text-[11px] text-slate-400 leading-relaxed flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                <strong>Zero Password Bypass:</strong> Every login strictly authenticates password credentials. Admins can generate custom sales staff logins in Settings &gt; Staff Logins.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
