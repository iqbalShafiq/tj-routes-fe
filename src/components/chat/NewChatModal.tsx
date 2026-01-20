import { useState, useMemo } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { useFriends } from '../../lib/hooks/useFollowUser';
import { Modal } from '../ui/Modal';
import { InputWithIcon } from '../ui/InputWithIcon';
import { EmptyState } from '../ui/EmptyState';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
}

export const NewChatModal = ({ isOpen, onClose, onSelectUser }: NewChatModalProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch friends (mutual follows)
  const { data: friendsData, isLoading } = useFriends(user?.id || 0);

  const filteredFriends = useMemo(() => {
    if (!friendsData?.data) return [];
    if (!searchQuery.trim()) return friendsData.data;

    return friendsData.data.filter(friend =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friendsData?.data, searchQuery]);

  const handleUserClick = (userId: number) => {
    onSelectUser(userId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start New Chat" size="md">
      <div className="space-y-4">
        {/* Search Input */}
        <InputWithIcon
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        {/* Friends List */}
        {isLoading ? (
          <div className="text-center py-8 text-text-muted">Loading friends...</div>
        ) : filteredFriends.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No friends found" : "No friends yet"}
            description={searchQuery
              ? "Try a different search term"
              : "Follow users to see them as friends when they follow you back"
            }
          />
        ) : (
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {filteredFriends.map(friend => (
              <button
                key={friend.id}
                onClick={() => handleUserClick(friend.id)}
                className="w-full p-3 hover:bg-bg-elevated transition-colors flex items-center gap-3 text-left"
              >
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg">
                  {friend.username.charAt(0).toUpperCase()}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{friend.username}</p>
                  <p className="text-xs text-text-muted">
                    {friend.reputation_points.toLocaleString()} points • {friend.level}
                  </p>
                </div>

                {/* Arrow Icon */}
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
