import { useState } from 'react';
import { UsersList } from './UsersList';
import { UserDetailPage } from './UserDetailPage';

interface UserManagementProps {
  language: string;
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  currentUserId?: string;
}

export const UserManagement = ({ language, toast, currentUserId }: UserManagementProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (selectedUserId) {
    return (
      <UserDetailPage
        userId={selectedUserId}
        language={language}
        onBack={() => setSelectedUserId(null)}
        toast={toast}
        currentUserId={currentUserId}
      />
    );
  }

  return (
    <UsersList
      language={language}
      onSelectUser={setSelectedUserId}
      toast={toast}
    />
  );
};
