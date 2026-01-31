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
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- TABS CONFIG ---
const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "workspace", label: "Workspace", icon: Briefcase },
  { id: "data", label: "Data & Privacy", icon: Database },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- MOCK CHANGE DETECTION ---
  // In a real app, this would compare form state to initial state
  const handleInputChange = () => {
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      // Brief success effect then redirect
      router.push("/dashboard");
    }, 1200);
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
            {activeTab === "profile" && (
              <ProfileSection onChange={handleInputChange} />
            )}
            {activeTab === "security" && (
              <SecuritySection onChange={handleInputChange} />
            )}
            {activeTab === "preferences" && (
              <PreferencesSection onChange={handleInputChange} />
            )}
            {activeTab === "appearance" && (
              <AppearanceSection onChange={handleInputChange} />
            )}
            {activeTab === "workspace" && (
              <WorkspaceSection onChange={handleInputChange} />
            )}
            {activeTab === "data" && (
              <DataSection onChange={handleInputChange} />
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
              className="h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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

// 1. PROFILE TAB
function ProfileSection({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Identity"
        desc="Manage your digital presence within the network."
      />

      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center relative group cursor-pointer hover:border-emerald-500/50 transition-colors">
          <User className="w-8 h-8 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-xs text-white">Edit</span>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-white font-medium">User Avatar</h3>
          <p className="text-sm text-zinc-500">Supports JPG, PNG (Max 2MB)</p>
        </div>
      </div>

      <div className="grid gap-6">
        <SettingsField label="Display Name">
          <Input
            onChange={onChange}
            placeholder="e.g. Cipher One"
            className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 h-12 text-white"
          />
        </SettingsField>
        <SettingsField label="Username">
          <Input
            onChange={onChange}
            placeholder="@cipher"
            className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 h-12 text-white"
          />
        </SettingsField>
        <SettingsField label="Email Address">
          <Input
            onChange={onChange}
            placeholder="user@signalforge.ai"
            className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 h-12 text-white"
          />
        </SettingsField>
      </div>
    </div>
  );
}

// 2. SECURITY TAB
function SecuritySection({ onChange }: { onChange: () => void }) {
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
            2FA is active. Encryption standards met.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <SettingsField label="Password">
          <Button
            variant="outline"
            className="w-full justify-between h-12 bg-black/20 border-zinc-800 hover:bg-zinc-900 hover:text-white"
          >
            <span>••••••••••••••••</span>
            <span className="text-xs text-zinc-500">Last changed 30d ago</span>
          </Button>
        </SettingsField>

        <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
          <div className="space-y-1">
            <span className="text-sm text-zinc-200">
              Two-Factor Authentication
            </span>
            <p className="text-xs text-zinc-500">
              Additional authentication layer active.
            </p>
          </div>
          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 cursor-pointer">
            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. PREFERENCES TAB
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

// 4. APPEARANCE TAB (Structure Only)
function AppearanceSection({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Environment Theme"
        desc="Select the visual frequency of the workspace."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* THEME 1: SIGNAL (Dark) */}
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

        {/* THEME 2: VIOLET (Light) - Mocked Visuals */}
        <div
          onClick={onChange}
          className="group cursor-pointer relative aspect-video rounded-2xl bg-zinc-100 border-2 border-transparent hover:border-purple-400 overflow-hidden transition-all"
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

// 5. WORKSPACE TAB
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

// 6. DATA TAB
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
