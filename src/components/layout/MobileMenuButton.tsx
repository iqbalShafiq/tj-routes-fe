interface MobileMenuButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const MobileMenuButton = ({ onClick, isOpen }: MobileMenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 card-chamfered"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className="relative w-6 h-5">
        <span
          className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? 'top-2 rotate-45' : 'top-0'
          }`}
        />
        <span
          className={`absolute left-0 top-2 w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}
        />
        <span
          className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? 'top-2 -rotate-45' : 'top-4'
          }`}
        />
      </div>
    </button>
  );
};

