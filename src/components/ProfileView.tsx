import React, { useState } from 'react';
import {
  clearCredentials,
  getSavedCredentials,
  normalizeBaseUrl,
  saveCredentials,
} from '../services/config';

// Tampilkan hanya beberapa karakter awal, sisanya XXXXX. Aman untuk key.
function maskSecret(value: string): string {
  return value ? `${value.slice(0, 5)}XXXX` : '••••••••';
}

// Base URL ditampilkan tanpa nama toko: hostname dimasking, TLD dipertahankan.
function maskBaseUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    const host = url.hostname;
    const dot = host.lastIndexOf('.');
    const name = dot > 0 ? host.slice(0, dot) : host;
    const tld = dot > 0 ? host.slice(dot) : '';
    const masked = name.length <= 2 ? '••••' : `${name.slice(0, 2)}${'•'.repeat(Math.min(name.length, 6))}`;
    return `${url.protocol}//${masked}${tld}`;
  } catch {
    return '••••••••';
  }
}

export const ProfileView: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // WooCommerce API credentials
  const saved = getSavedCredentials();
  const [baseUrl, setBaseUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const handleSave = () => {
    const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
    if (!normalizedBaseUrl) {
      setSaveError('Base URL wajib diisi.');
      return;
    }
    const key = consumerKey.trim();
    const secret = consumerSecret.trim();
    if (!key || !secret) {
      setSaveError('Consumer Key dan Consumer Secret wajib diisi.');
      return;
    }
    saveCredentials({ baseUrl: normalizedBaseUrl, consumerKey: key, consumerSecret: secret });
    // Reload supaya seluruh request langsung memakai key baru.
    location.reload();
  };

  const handleReset = () => {
    clearCredentials();
    location.reload();
  };

  return (
    <div className="flex-1 flex flex-col p-5 gap-6">
      <h2 className="text-[28px] font-bold text-[#1E1A34] text-center">
        Profile & Settings
      </h2>

      {/* User Card */}
      <div className="bg-white rounded-[24px] border-[3px] border-[#1E1A34] p-5 flex items-center gap-4 shadow-[0_4px_0_rgba(30,26,52,0.08)]">
        <div className="w-16 h-16 rounded-full bg-[#FFC79A] border-[3px] border-[#1E1A34] flex items-center justify-center text-[28px] font-bold text-[#1E1A34]">
          UT
        </div>
        <div>
          <h3 className="font-bold text-[18px] text-[#1E1A34]">User Tracky</h3>
          <p className="text-[13px] text-gray-600 font-medium">Beta version Tracky</p>
          <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border-[1.5px] border-[#1E1A34]">
            Shift Active
          </span>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-[24px] border-[3px] border-[#1E1A34] p-5 flex flex-col gap-4 shadow-[0_4px_0_rgba(30,26,52,0.08)]">
        <h4 className="font-bold text-[16px] text-[#1E1A34] border-b-[2px] border-slate-100 pb-2">
          Scanner Preferences
        </h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-[#1E1A34]">volume_up</span>
            <div>
              <p className="font-bold text-[14px] font-medium text-[#1E1A34]">Beep Sound on Scan</p>
              <p className="text-[12px] text-gray-500">Audio feedback for barcode detection</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-7 rounded-full border-[2.5px] border-[#1E1A34] p-0.5 transition-colors cursor-pointer ${
              soundEnabled ? 'bg-[#FFC79A]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-[#1E1A34] transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-[#1E1A34]">cloud_upload</span>
            <div>
              <p className="font-bold text-[14px] font-medium text-[#1E1A34]">Auto Sync to Cloud</p>
              <p className="text-[12px] text-gray-500">Upload parcel logs immediately</p>
            </div>
          </div>
          <button
            onClick={() => setAutoSave(!autoSave)}
            className={`w-12 h-7 rounded-full border-[2.5px] border-[#1E1A34] p-0.5 transition-colors cursor-pointer ${
              autoSave ? 'bg-[#FFC79A]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-[#1E1A34] transition-transform ${
                autoSave ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* WooCommerce API Credentials */}
      <div className="bg-white rounded-[24px] border-[3px] border-[#1E1A34] p-5 flex flex-col gap-4 shadow-[0_4px_0_rgba(30,26,52,0.08)]">
        <div className="flex items-center gap-2 border-b-[2px] border-slate-100 pb-2">
          <span className="material-symbols-outlined text-[22px] text-[#1E1A34]">key</span>
          <h4 className="font-bold text-[16px] text-[#1E1A34]">WooCommerce API</h4>
        </div>

        {saved ? (
          <>
            <div>
              <label className="block text-[13px] font-bold text-[#1E1A34] mb-1">
                Base URL (domain)
              </label>
              <div className="no-copy w-full px-4 py-3 rounded-[16px] border-[2.5px] border-[#1E1A34] bg-slate-50 font-mono font-medium text-[14px] text-[#1E1A34] select-none">
                {maskBaseUrl(saved.baseUrl)}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1E1A34] mb-1">
                Consumer Key
              </label>
              <div className="no-copy w-full px-4 py-3 rounded-[16px] border-[2.5px] border-[#1E1A34] bg-slate-50 font-mono font-medium text-[14px] text-[#1E1A34] select-none">
                {maskSecret(saved.consumerKey)}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1E1A34] mb-1">
                Consumer Secret
              </label>
              <div className="no-copy w-full px-4 py-3 rounded-[16px] border-[2.5px] border-[#1E1A34] bg-slate-50 font-mono font-medium text-[14px] text-[#1E1A34] select-none">
                {maskSecret(saved.consumerSecret)}
              </div>
            </div>

            <p className="text-[12px] text-gray-500 font-medium">
              API key tersimpan dan tidak bisa diubah. Gunakan Reset untuk memasang key baru.
            </p>

            <button
              onClick={() => setResetOpen(true)}
              className="w-full bg-red-50 hover:bg-red-100 rounded-full border-[3px] border-[#1E1A34] py-3 px-6 flex items-center justify-center gap-2 font-bold text-[15px] text-red-700 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
              Reset API Key
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-[13px] font-bold text-[#1E1A34] mb-1">
                Base URL (domain)
              </label>
              <input
                type="text"
                placeholder="contoh.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] border-[2.5px] border-[#1E1A34] font-medium text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFC79A]"
              />
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                Cukup domain — path /wp-json/wc/v3 ditambahkan otomatis.
              </p>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1E1A34] mb-1">
                Consumer Key
              </label>
              <input
                type="password"
                autoComplete="off"
                placeholder="ck_xxxxxxxxxxxx"
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="no-copy w-full px-4 py-3 rounded-[16px] border-[2.5px] border-[#1E1A34] font-medium text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFC79A]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1E1A34] mb-1">
                Consumer Secret
              </label>
              <input
                type="password"
                autoComplete="off"
                placeholder="cs_xxxxxxxxxxxx"
                value={consumerSecret}
                onChange={(e) => setConsumerSecret(e.target.value)}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="no-copy w-full px-4 py-3 rounded-[16px] border-[2.5px] border-[#1E1A34] font-medium text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFC79A]"
              />
            </div>

            {saveError && <p className="text-[12px] font-bold text-red-600">{saveError}</p>}

            <button
              onClick={handleSave}
              className="w-full bg-[#FFC79A] hover:bg-[#ffb67b] rounded-full border-[3px] border-[#1E1A34] py-3 px-6 flex items-center justify-center gap-2 font-bold text-[15px] text-[#1E1A34] shadow-[0_3px_0_#1E1A34] active:translate-y-0.5 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                save
              </span>
              Simpan API Key
            </button>

            <button
              onClick={() => setResetOpen(true)}
              className="w-full bg-red-50 hover:bg-red-100 rounded-full border-[3px] border-[#1E1A34] py-3 px-6 flex items-center justify-center gap-2 font-bold text-[15px] text-red-700 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
              Reset API Key
            </button>
          </>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-[#E6DEFF] rounded-[24px] border-[3px] border-[#1E1A34] p-5 shadow-[0_4px_0_rgba(30,26,52,0.08)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[22px] text-[#1E1A34]">info</span>
          <h4 className="font-bold text-[15px] text-[#1E1A34]">Tracky Mobile v2.4</h4>
        </div>
        <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
          Aplikasi ini sedang dikembangkan bersama Zamify (versi beta).
        </p>
      </div>

      {/* Dialog Konfirmasi Reset API Key */}
      {resetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white border-t-[3px] sm:border-[3px] border-[#1E1A34] rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[26px] text-red-600">restart_alt</span>
              <h3 className="text-[20px] font-bold text-[#1E1A34]">Yakin Reset?</h3>
            </div>
            <p className="text-[14px] text-gray-700 font-medium mb-4">
              API key di dalam app akan dihapus dan kembali kosong. Lanjut?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setResetOpen(false)}
                className="flex-1 py-3 rounded-full border-[2.5px] border-[#1E1A34] font-bold text-[#1E1A34] hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-full border-[2.5px] border-[#1E1A34] bg-red-500 font-bold text-white hover:bg-red-600 shadow-[0_3px_0_#1E1A34] active:translate-y-0.5 cursor-pointer"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
