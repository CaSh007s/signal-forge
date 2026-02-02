"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Sliders,
  Palette,
  Briefcase,
  Database,
  Save,
  AlertCircle,
  Moon,
  Sun,
  Check,
  Loader2,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/user-context"; // Global Context
import { User as SupabaseUser } from "@supabase/supabase-js"; // Type Alias
import Image from "next/image";

// --- CONFIGURATION ---
const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "workspace", label: "Workspace", icon: Briefcase },
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
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useUser(); // Use Global Context
  const [activeTab, setActiveTab] = useState("profile");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for editing form data
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    avatar_style: "shapes",
  });

  // Sync global user data to local form state on load
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.user_metadata?.full_name || "",
        avatar_style: user.user_metadata?.avatar_style || "shapes",
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
      // 1. Update Profile Logic
      if (activeTab === "profile" && user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: formData.full_name,
            avatar_style: formData.avatar_style,
          },
        });
        if (error) throw error;
      }

      // 2. Refresh Global Context (Updates Navbar instantly)
      await refreshUser();

      // 3. UX Feedback
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
      {/* 1. HEADER & TABS */}
      <div className="mb-12 space-y-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            System Calibration
          </h1>
          <p className="text-zinc-500 font-light mt-2">
            Configure environment and identity parameters.
          </p>
        </div>

        {/* Floating Glass Tabs */}
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

      {/* 2. DISSOLVING CONTENT AREA */}
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
            {activeTab === "preferences" && (
              <PreferencesSection onChange={() => setHasChanges(true)} />
            )}
            {activeTab === "appearance" && (
              <AppearanceSection onChange={() => setHasChanges(true)} />
            )}
            {activeTab === "workspace" && (
              <WorkspaceSection onChange={() => setHasChanges(true)} />
            )}
            {activeTab === "data" && (
              <DataSection onChange={() => setHasChanges(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. LATENT SAVE BUTTON */}
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

// --- SECTIONS (Sub-components) ---

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

// 1. PROFILE TAB (FULLY FUNCTIONAL)
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

      {/* AVATAR SELECTOR */}
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
      </div>
    </div>
  );
}

// 2. SECURITY TAB (FUNCTIONAL PASSWORD UPDATE)
function SecuritySection() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Security Protocols"
        desc="Manage authentication layers and session integrity."
      />

      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
        <div>
          <h4 className="text-emerald-400 font-medium text-sm">
            Environment Secure
          </h4>
          <p className="text-xs text-emerald-500/60 mt-1">
            Encryption standards met. Session secured.
          </p>
        </div>
      </div>

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

        <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
          <div className="space-y-1">
            <span className="text-sm text-zinc-200">
              Two-Factor Authentication
            </span>
            <p className="text-xs text-zinc-500">
              Additional authentication layer.
            </p>
          </div>
          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500/20 border border-emerald-500/50 cursor-pointer">
            <span className="translate-x-6 inline-block h-3 w-3 transform rounded-full bg-emerald-500 shadow-md transition" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. PREFERENCES TAB (Mock UI)
function PreferencesSection({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Interface Physics"
        desc="Tune the system's responsiveness and density."
      />

      <div className="space-y-8">
        <SettingsField label="Motion Intensity">
          <div
            className="h-2 bg-zinc-800 rounded-full overflow-hidden relative group cursor-pointer"
            onClick={onChange}
          >
            <div className="absolute left-0 top-0 h-full w-2/3 bg-emerald-500" />
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-2 font-mono">
            <span>Minimal</span>
            <span>Cinematic</span>
          </div>
        </SettingsField>

        <SettingsField label="Information Density">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onChange}
              className="p-4 border border-emerald-500/50 bg-emerald-500/10 rounded-xl text-left space-y-2"
            >
              <div className="w-8 h-4 bg-emerald-500/40 rounded" />
              <span className="text-sm text-emerald-400 block">Comfort</span>
            </button>
            <button
              onClick={onChange}
              className="p-4 border border-zinc-800 bg-black/20 hover:border-zinc-700 rounded-xl text-left space-y-2"
            >
              <div className="space-y-1">
                <div className="w-8 h-2 bg-zinc-700 rounded" />
                <div className="w-8 h-2 bg-zinc-700 rounded" />
              </div>
              <span className="text-sm text-zinc-400 block">Compact</span>
            </button>
          </div>
        </SettingsField>
      </div>
    </div>
  );
}

// 4. APPEARANCE TAB (Mock UI)
function AppearanceSection({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Environment Theme"
        desc="Select the visual frequency of the workspace."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={onChange}
          className="group cursor-pointer relative aspect-video rounded-2xl bg-[#09090b] border-2 border-emerald-500 overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/20" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
            <div className="w-2 h-2 rounded-full bg-green-500/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center border border-emerald-500/30">
                <Moon className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-emerald-400 font-medium text-sm">
                Signal (Default)
              </span>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-emerald-500">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={onChange}
          className="group cursor-pointer relative aspect-video rounded-2xl bg-zinc-100 border-2 border-transparent hover:border-purple-400 overflow-hidden transition-all opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full mx-auto flex items-center justify-center border border-purple-500/20">
                <Sun className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-zinc-600 font-medium text-sm">
                Violet (Light)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. WORKSPACE TAB (Mock UI)
function WorkspaceSection({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Workspace Behavior"
        desc="Configure defaults for agent initialization."
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-black/20 border border-zinc-800 rounded-xl">
          <span className="text-sm text-zinc-300">Auto-save Reports</span>
          <div
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 cursor-pointer"
            onClick={onChange}
          >
            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-black/20 border border-zinc-800 rounded-xl">
          <span className="text-sm text-zinc-300">
            Default to Dashboard on Login
          </span>
          <div
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 cursor-pointer"
            onClick={onChange}
          >
            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. DATA TAB (Mock UI)
function DataSection({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Data & Retention"
        desc="Manage your research archive and account lifecycle."
      />

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start h-12 bg-black/20 border-zinc-800 hover:bg-zinc-900 hover:text-white group"
        >
          <Database className="w-4 h-4 mr-3 text-zinc-500 group-hover:text-emerald-400" />
          Export Intelligence Archive (JSON)
        </Button>

        <div className="pt-8 border-t border-white/5">
          <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
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
              onClick={onChange}
              variant="destructive"
              className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20"
            >
              Initiate Deletion Sequence
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
