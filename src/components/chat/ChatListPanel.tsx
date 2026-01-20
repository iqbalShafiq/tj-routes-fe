import { useState } from 'react';
import { InputWithIcon } from '../ui/InputWithIcon';
import { Tabs } from '../ui/Tabs';
import { ConversationsList } from './ConversationsList';
import { GroupsList } from './GroupsList';
import { RequestsList } from './RequestsList';
import { NewChatModal } from './NewChatModal';
import { useCreateChatRequest, useConversations, useSentChatRequests, useReceivedChatRequests } from '../../lib/hooks/useChat';
import { getMessageButtonState } from '../../lib/utils/chatHelpers';

interface ChatListPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectChat: (type: 'conversation' | 'group', id: number) => void;
  selectedChatId: number | null;
}

export function ChatListPanel({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onSelectChat,
  selectedChatId,
}: ChatListPanelProps) {
  const tabs = ['chats', 'groups', 'requests'];
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Hooks for handling user selection
  const createRequest = useCreateChatRequest();
  const { data: conversations } = useConversations();
  const { data: sentRequests } = useSentChatRequests();
  const { data: receivedRequests } = useReceivedChatRequests();

  // Handler for selecting a user from the modal
  const handleSelectUser = async (userId: number) => {
    const buttonState = getMessageButtonState(
      userId,
      conversations?.items,
      sentRequests?.items,
      receivedRequests?.items
    );

    if (buttonState.type === 'open_chat') {
      onSelectChat('conversation', buttonState.conversationId!);
    } else if (buttonState.type === 'send_request') {
      await createRequest.mutateAsync({ user_id: userId });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-text-primary">Chat</h1>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 text-accent hover:bg-accent/10 hover:scale-105 rounded-lg transition-all duration-200 active:scale-95"
            aria-label="Start new chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <form onSubmit={(e: React.FormEvent) => e.preventDefault()}>
          <InputWithIcon
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </form>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' && (
          <ConversationsList onSelect={onSelectChat} selectedId={selectedChatId} searchQuery={searchQuery} />
        )}
        {activeTab === 'groups' && (
          <GroupsList onSelect={onSelectChat} selectedId={selectedChatId} searchQuery={searchQuery} />
        )}
        {activeTab === 'requests' && <RequestsList onSelect={onSelectChat} />}
      </div>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}
