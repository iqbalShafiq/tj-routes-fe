import { useChatContext } from '../../lib/hooks/useChatContext';

interface PresenceIndicatorProps {
  userId: number;
  roomId?: string;
  showText?: boolean;
  className?: string;
}

export function PresenceIndicator({ userId, roomId, showText = false, className = '' }: PresenceIndicatorProps) {
  const { isUserOnline } = useChatContext();
  const online = isUserOnline(userId, roomId);

  if (showText) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div
          className={`w-2 h-2 rounded-full ${
            online ? 'bg-success' : 'bg-text-muted'
          }`}
        />
        <span className={`text-xs ${online ? 'text-success' : 'text-text-muted'}`}>
          {online ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-2.5 h-2.5 rounded-full border-2 border-bg-main ${
        online ? 'bg-success' : 'bg-text-muted'
      } ${className}`}
      title={online ? 'Online' : 'Offline'}
    />
  );
}
