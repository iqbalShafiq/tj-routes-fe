import { useGroups } from '../../lib/hooks/useChat';
import { EmptyState } from '../ui/EmptyState';
import type { GroupChat } from '../../lib/api/chat';

interface GroupsListProps {
  onSelect: (type: 'conversation' | 'group', id: number) => void;
  selectedId: number | null;
  searchQuery: string;
}

export function GroupsList({ onSelect, selectedId, searchQuery }: GroupsListProps) {
  const { data, isLoading } = useGroups();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-text-muted">Loading groups...</div>
      </div>
    );
  }

  const groups = data?.items || [];

  const filteredGroups = groups.filter((group: GroupChat) => {
    if (!searchQuery.trim()) return true;
    const name = group.name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  if (filteredGroups.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        title="No groups yet"
        description="Join groups to chat with other TransJakarta enthusiasts or create your own!"
        className="py-8 animate-scale-in"
      />
    );
  }

  return (
    <div className="divide-y divide-border animate-fade-in">
      {filteredGroups.map((group: GroupChat, index: number) => (
        <button
          key={group.id}
          onClick={() => onSelect('group', group.id)}
          className={`w-full p-4 text-left hover:bg-bg-elevated transition-all duration-200 active:scale-[0.98] flex items-center gap-3 ${
            selectedId === group.id ? 'bg-bg-elevated' : ''
          } ${index < 3 ? `animate-stagger-${index + 1}` : ''}`}
        >
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center overflow-hidden">
              {group.avatar_url ? (
                <img src={group.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-lg">{group.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-text-primary truncate">{group.name}</div>
            <div className="text-sm text-text-secondary mt-0.5 flex items-center gap-2">
              <span className={`px-1.5 py-0.5 text-xs rounded ${
                group.type === 'public' ? 'bg-success/10 text-success' :
                group.type === 'private' ? 'bg-warning/10 text-warning' :
                'bg-bg-elevated text-text-secondary'
              }`}>
                {group.type}
              </span>
              <span>{group.members?.length || 0} members</span>
            </div>
          </div>

          <svg className="w-5 h-5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );
}
