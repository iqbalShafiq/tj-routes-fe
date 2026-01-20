import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export function CloseChatButton() {
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate({ to: -1 as any });
    } else {
      navigate({ to: '/feed' });
    }
  };

  return (
    <button
      onClick={handleClose}
      className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span>Close Chat</span>
    </button>
  );
}
