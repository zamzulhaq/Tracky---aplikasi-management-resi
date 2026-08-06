import React, { useState } from 'react';

export const ProfileView: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

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
          <p className="text-[13px] text-gray-600 font-medium">Beta version untuk azrahstore</p>
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
    </div>
  );
};
