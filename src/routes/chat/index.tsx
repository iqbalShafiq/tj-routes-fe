import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ChatLayout } from '../../components/chat/ChatLayout';
import { ChatListPanel } from '../../components/chat/ChatListPanel';
import { ChatDetailPanel } from '../../components/chat/ChatDetailPanel';
import { ChatProvider, useChatContext } from '../../lib/hooks/useChatContext';

type TabType = 'chats' | 'groups' | 'requests';

export const Route = createFileRoute('/chat/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      conversation: search.conversation ? Number(search.conversation) : undefined,
      group: search.group ? Number(search.group) : undefined,
    };
  },
  component: () => (
    <ChatProvider enabled={true}>
      <ChatHub />
    </ChatProvider>
  ),
});

function ChatHub() {
  const [selectedChat, setSelectedChat] = useState<{
    type: 'conversation' | 'group';
    id: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [searchQuery, setSearchQuery] = useState('');

  const { joinRoom, leaveRoom } = useChatContext();
  const search = Route.useSearch();

  // Auto-select chat from URL params
  useEffect(() => {
    if (search.conversation) {
      setSelectedChat({ type: 'conversation', id: search.conversation });
    } else if (search.group) {
      setSelectedChat({ type: 'group', id: search.group });
    }
  }, [search.conversation, search.group]);

  // Join/leave rooms when chat is selected/deselected
  useEffect(() => {
    if (selectedChat) {
      const roomId = selectedChat.type === 'conversation'
        ? `conversation:${selectedChat.id}`
        : `group:${selectedChat.id}`;

      joinRoom(roomId);

      // Leave room on cleanup
      return () => {
        leaveRoom(roomId);
      };
    }
    // joinRoom and leaveRoom are now stable (memoized with empty deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  const handleSelectChat = (type: 'conversation' | 'group', id: number) => {
    setSelectedChat({ type, id });
  };

  const handleCloseDetail = () => {
    setSelectedChat(null);
  };

  return (
    <div className="h-screen">
      <ChatLayout
        leftPanel={
          <ChatListPanel
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as TabType)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChat?.id ?? null}
          />
        }
        rightPanel={
          selectedChat ? (
            <ChatDetailPanel
              type={selectedChat.type}
              id={selectedChat.id}
              onClose={handleCloseDetail}
            />
          ) : null
        }
        infoPanel={selectedChat}
        selectedChatId={selectedChat?.id ?? null}
        onCloseDetail={handleCloseDetail}
      />
    </div>
  );
}
