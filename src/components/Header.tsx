import React from 'react';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  onSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Tracky',
  onBack,
  onSettings,
}) => {
  return (
    <header className="flex items-center justify-between px-5 py-4 w-full top-0 sticky bg-white/90 backdrop-blur-md z-30 border-b-[3px] border-[#1E1A34]">
      {onBack ? (
        <button
          onClick={onBack}
          className="active:scale-95 transition-transform hover:opacity-80 p-2 rounded-full border-[3px] border-[#1E1A34] bg-white flex items-center justify-center cursor-pointer shadow-[0_2px_0_#1E1A34]"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined font-bold text-[#1E1A34]">arrow_back</span>
        </button>
      ) : (
        <div className="w-11" />
      )}

      <h1 className="text-[24px] font-bold tracking-tight text-[#1E1A34]">
        {title}
      </h1>

      <button
        onClick={onSettings}
        className="active:scale-95 transition-transform hover:opacity-80 p-2 rounded-full border-[3px] border-[#1E1A34] bg-white flex items-center justify-center cursor-pointer shadow-[0_2px_0_#1E1A34]"
        aria-label="Settings"
      >
        <span className="material-symbols-outlined font-bold text-[#1E1A34]">settings</span>
      </button>
    </header>
  );
};
