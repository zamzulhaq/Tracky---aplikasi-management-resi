import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-6 bg-white border-t-[3px] border-[#1E1A34] rounded-t-[32px] shadow-[0_-4px_10px_rgba(0,0,0,0.08)] max-w-md mx-auto right-0">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer ${
          activeTab === 'home'
            ? 'bg-[#FFDCC2] text-[#2E1500] border-[3px] border-[#1E1A34]'
            : 'text-gray-600 hover:bg-[#201C36] hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">home</span>
        <span className={`text-[12px] leading-tight mt-0.5 ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>
          Home
        </span>
      </button>

      <button
        onClick={() => setActiveTab('scanner')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer ${
          activeTab === 'scanner'
            ? 'bg-[#FFDCC2] text-[#2E1500] border-[3px] border-[#1E1A34]'
            : 'text-gray-600 hover:bg-[#201C36] hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          barcode_scanner
        </span>
        <span className={`text-[12px] leading-tight mt-0.5 ${activeTab === 'scanner' ? 'font-bold' : 'font-medium'}`}>
          Scanner
        </span>
      </button>

      <button
        onClick={() => setActiveTab('shipments')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer ${
          activeTab === 'shipments'
            ? 'bg-[#FFDCC2] text-[#2E1500] border-[3px] border-[#1E1A34]'
            : 'text-gray-600 hover:bg-[#201C36] hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">package_2</span>
        <span className={`text-[12px] leading-tight mt-0.5 ${activeTab === 'shipments' ? 'font-bold' : 'font-medium'}`}>
          Shipments
        </span>
      </button>

      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer ${
          activeTab === 'profile'
            ? 'bg-[#FFDCC2] text-[#2E1500] border-[3px] border-[#1E1A34]'
            : 'text-gray-600 hover:bg-[#201C36] hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">person</span>
        <span className={`text-[12px] leading-tight mt-0.5 ${activeTab === 'profile' ? 'font-bold' : 'font-medium'}`}>
          Profile
        </span>
      </button>
    </nav>
  );
};
