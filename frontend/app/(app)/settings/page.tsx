"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Database,
  Save,
  AlertCircle,
  Loader2,
  Key,
  Download,
  Trash2,
  Check,
  QrCode,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/user-context";
import { getToken } from "@/lib/auth";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";
import QRCode from "qrcode";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data & Privacy", icon: Database },
];

const AVATAR_STYLES = [
  { id: "shapes", label: "Abstract" },
  { id: "bottts", label: "Robots" },
  { id: "identicon", label: "Geometric" },
  { id: "avataaars", label: "Humans" },
  { id: "icons", label: "Symbols" },
];

interface ProfileFormData {
  full_name: string;
  avatar_style: string;
  global_currency: string;
}

// ✅ FIX: Strict Type for Factors
interface MFAFactor {
  id: string;
  status: "verified" | "unverified";
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    avatar_style: "shapes",
    global_currency: "USD",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.user_metadata?.full_name || "",
        avatar_style: user.user_metadata?.avatar_style || "shapes",
        global_currency: user.user_metadata?.global_currency || "USD",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "profile" && user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: formData.full_name,
            avatar_style: formData.avatar_style,
            global_currency: formData.global_currency,
          },
        });
        if (error) throw error;
      }

      // Force exactly new JWT with fresh metadata
      await supabase.auth.refreshSession();
      await refreshUser();

      setTimeout(() => {
        setIsSaving(false);
        setHasChanges(false);
        router.refresh();
      }, 800);
    } catch (error) {
      alert("Calibration Failed: " + (error as Error).message);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[80vh] flex flex-col relative">
      <div className="mb-12 space-y-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            System Calibration
          </h1>
          <p className="text-zinc-500 font-light mt-2">
            Configure environment and identity parameters.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit backdrop-blur-md">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-500 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-settings-tab"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-white/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                <tab.icon className="w-4 h-4" />
              </span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl"
          >
            {activeTab === "profile" && user && (
              <ProfileSection
                user={user}
                formData={formData}
                onChange={handleInputChange}
              />
            )}
            {activeTab === "security" && <SecuritySection />}
            {activeTab === "data" && user && <DataSection user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calibrating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5" /> Save Changes
                </div>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-8 border-b border-white/5 pb-4">
      <h2 className="text-xl font-medium text-white">{title}</h2>
      <p className="text-sm text-zinc-500">{desc}</p>
    </div>
  );
}

function SettingsField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfileSection({
  user,
  formData,
  onChange,
}: {
  user: SupabaseUser;
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: string) => void;
}) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Identity"
        desc="Manage your digital presence within the network."
      />

      <div className="space-y-4">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Avatar Signature
        </label>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {AVATAR_STYLES.map((style) => {
            const isActive = formData.avatar_style === style.id;
            const url = `https://api.dicebear.com/9.x/${style.id}/svg?seed=${user.id}&backgroundColor=09090b`;
            return (
              <button
                key={style.id}
                onClick={() => onChange("avatar_style", style.id)}
                className={`relative flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all overflow-hidden group ${
                  isActive
                    ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105 bg-emerald-500/10"
                    : "border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600 bg-black/20"
                }`}
              >
                <div className="absolute inset-0 p-2">
                  <Image
                    src={url}
                    alt={style.label}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] text-center py-1.5 text-zinc-300 font-medium backdrop-blur-md border-t border-white/5">
                  {style.label}
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-lg">
                    <Check className="w-2.5 h-2.5 stroke-[3px]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6">
        <SettingsField label="Display Name">
          <Input
            value={formData.full_name}
            onChange={(e) => onChange("full_name", e.target.value)}
            placeholder="e.g. Cipher One"
            className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 h-12 text-white"
          />
        </SettingsField>

        <SettingsField label="Internal ID (Immutable)">
          <Input
            value={user.email || ""}
            readOnly
            className="bg-black/20 border-zinc-800 text-zinc-500 h-12 cursor-not-allowed"
          />
          <div className="flex items-center gap-2 text-[10px] text-zinc-600 mt-1">
            <Shield className="w-3 h-3" />
            <span>Identity locked by administrator protocol.</span>
          </div>
        </SettingsField>
        <SettingsField label="Base Financial Currency">
          <select
            value={formData.global_currency}
            onChange={(e) => onChange("global_currency", e.target.value)}
            className="w-full bg-black/20 border border-zinc-800 focus:border-emerald-500/50 rounded-md h-12 text-white px-3 outline-none transition-colors appearance-none"
          >
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
            <option value="INR">INR (₹) - Indian Rupee</option>
            <option value="JPY">JPY (¥) - Japanese Yen</option>
          </select>
          <div className="flex items-center gap-2 text-[10px] text-zinc-600 mt-1">
            <span>
              LLMs will automatically convert all charts and reports to this
              baseline.
            </span>
          </div>
        </SettingsField>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA State
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState("");

  // Check status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.all?.find(
        (f: MFAFactor) => f.status === "verified",
      );
      if (verified) {
        setIs2FAEnabled(true);
        setFactorId(verified.id);
      }
    };
    checkStatus();
  }, []);

  const handlePasswordUpdate = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    setLoading(false);
    if (error) {
      alert("Security Error: " + error.message);
    } else {
      alert("Protocol Updated: Password changed successfully.");
      setPassword("");
    }
  };

  const onEnable2FA = async () => {
    setIsEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (error) {
      alert(error.message);
      setIsEnrolling(false);
      return;
    }

    setFactorId(data.id);
    const qr = await QRCode.toDataURL(data.totp.uri);
    setQrCodeUrl(qr);
  };

  const onVerify2FA = async () => {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: verifyCode,
    });

    if (error) {
      alert("Invalid Code: " + error.message);
    } else {
      const { error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) {
        alert(challengeError.message);
        return;
      }
      alert(
        "2FA Enabled Successfully! You will need this code to login next time.",
      );
      setIsEnrolling(false);
      setIs2FAEnabled(true);
      setQrCodeUrl("");
      setVerifyCode("");
    }
  };

  //Disable 2FA
  const onDisable2FA = async () => {
    const confirm = window.confirm(
      "Are you sure you want to remove 2FA? This will lower your account security.",
    );
    if (!confirm) return;

    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      alert("Error removing 2FA: " + error.message);
    } else {
      setIs2FAEnabled(false);
      setFactorId("");
      alert("2FA has been disabled.");
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Security Protocols"
        desc="Manage authentication layers and session integrity."
      />

      {/* PASSWORD ROTATION */}
      <div className="space-y-6">
        <SettingsField label="Rotate Access Key">
          <div className="flex gap-3">
            <Input
              type="password"
              placeholder="Enter new master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 text-white h-12"
            />
            <Button
              onClick={handlePasswordUpdate}
              disabled={!password || loading}
              className="h-12 px-6 bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-300 border border-zinc-700 hover:border-emerald-500 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              {loading ? "Updating..." : "Update Key"}
            </Button>
          </div>
        </SettingsField>
      </div>

      {/* 2FA ENROLLMENT */}
      <div className="pt-6 border-t border-white/5 space-y-4">
        <div
          className={`flex items-center justify-between p-4 border rounded-xl transition-all ${is2FAEnabled ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-900/30 border-zinc-800"}`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-200 font-medium">
                Two-Factor Authentication
              </span>
              {is2FAEnabled && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {is2FAEnabled
                ? "Your account is secured with TOTP."
                : "Add an extra layer of security."}
            </p>
          </div>

          {/* LOGIC: Show different buttons based on status */}
          {is2FAEnabled ? (
            <Button
              onClick={onDisable2FA}
              variant="outline"
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> Remove 2FA
            </Button>
          ) : !isEnrolling ? (
            <Button
              onClick={onEnable2FA}
              variant="outline"
              className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-black"
            >
              Enable 2FA
            </Button>
          ) : (
            <Button
              onClick={() => setIsEnrolling(false)}
              variant="ghost"
              className="text-zinc-500"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* QR REVEAL UI (Only when enrolling) */}
        {isEnrolling && qrCodeUrl && !is2FAEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-6 border border-zinc-800 bg-black/20 rounded-xl space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-white p-2 rounded-lg">
                <Image
                  src={qrCodeUrl}
                  alt="2FA QR"
                  width={160}
                  height={160}
                  unoptimized
                />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-white font-medium">Scan Verification</h4>
                </div>
                <p className="text-sm text-zinc-400">
                  Use your authenticator app (Google Auth, Authy) to scan this
                  code. Enter the 6-digit pin below to activate.
                </p>
                <div className="flex gap-3 max-w-sm">
                  <Input
                    placeholder="000 000"
                    className="font-mono text-center tracking-widest text-lg bg-black/50 border-zinc-700 h-12"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                  />
                  <Button
                    onClick={onVerify2FA}
                    disabled={verifyCode.length < 6}
                    className="h-12 bg-emerald-500 text-black font-bold px-6"
                  >
                    Verify
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DataSection({ user }: { user: SupabaseUser }) {
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingPurge, setLoadingPurge] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const handlePurge = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all reports and API keys? This cannot be undone.",
      )
    ) {
      return;
    }
    setLoadingPurge(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");
      const res = await fetch(`${API_URL}/api/user/purge`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to purge data");
      localStorage.removeItem("hasGeminiKey");
      alert("All intelligence configurations and cache have been purged.");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoadingPurge(false);
    }
  };

  const handleExport = async () => {
    setLoadingExport(true);
    const exportData = {
      identity: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        created_at: user.created_at,
      },
      archive: "No active reports found in session context.",
      timestamp: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signalforge_archive_${user.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setLoadingExport(false), 800);
  };

  const handleDelete = async () => {
    if (!password) {
      alert("Please confirm your password.");
      return;
    }
    setLoadingDelete(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });
      if (authError) throw new Error("Incorrect password. Deletion aborted.");

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { scheduled_for_deletion: sevenDaysFromNow.toISOString() },
      });
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      router.push("/");
      alert("Workspace scheduled for deletion. You have 7 days to recover.");
    } catch (error) {
      alert((error as Error).message);
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Data & Retention"
        desc="Manage your research archive and account lifecycle."
      />

      <div className="space-y-4">
        <Button
          onClick={handleExport}
          disabled={loadingExport}
          variant="outline"
          className="w-full justify-start h-12 bg-black/20 border-zinc-800 hover:bg-zinc-900 hover:text-white group"
        >
          {loadingExport ? (
            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-3 text-zinc-500 group-hover:text-emerald-400" />
          )}
          Export Intelligence Archive (JSON)
        </Button>

        <Button
          onClick={handlePurge}
          disabled={loadingPurge}
          variant="outline"
          className="w-full justify-start h-12 bg-black/20 border-zinc-800 hover:bg-zinc-900 hover:text-white group mt-4"
        >
          {loadingPurge ? (
            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-3 text-zinc-500 group-hover:text-orange-400" />
          )}
          Purge Session Context & API Keys
        </Button>

        <div className="pt-8 border-t border-white/5">
          <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
          {!deleteConfirmOpen ? (
            <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl space-y-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div className="space-y-1">
                  <p className="text-sm text-red-200">Delete Workspace</p>
                  <p className="text-xs text-red-400/60">
                    Account scheduled for removal. Data retained for 7 days.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setDeleteConfirmOpen(true)}
                variant="destructive"
                className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20"
              >
                Initiate Deletion Sequence
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-6 border border-red-500/30 bg-red-950/20 rounded-xl space-y-4"
            >
              <div className="space-y-2">
                <h5 className="text-red-400 font-medium flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Confirm Deletion
                </h5>
                <p className="text-sm text-zinc-400">
                  This action will log you out immediately. To cancel deletion,
                  simply log back in within 7 days.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/40 border-red-900/50 focus:border-red-500/50 text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setDeleteConfirmOpen(false)}
                  variant="ghost"
                  className="flex-1 hover:bg-white/5 text-zinc-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={!password || loadingDelete}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                >
                  {loadingDelete ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm & Delete"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
