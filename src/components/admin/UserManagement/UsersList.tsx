import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Shield, Ban, Coins, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface UserListItem {
  user_id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_blacklisted: boolean;
  loyalty_points: number;
}

interface UsersListProps {
  language: string;
  onSelectUser: (userId: string) => void;
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

export const UsersList = ({ language, onSelectUser, toast }: UsersListProps) => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (search?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('search_users_for_admin', {
        p_search_term: search || null
      });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to load users' : 'فشل في تحميل المستخدمين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            {language === 'en' ? 'User Management' : 'إدارة المستخدمين'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'en' 
              ? `${users.length} users registered`
              : `${users.length} مستخدم مسجل`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={language === 'en' ? 'Search by name, email, or ID...' : 'ابحث بالاسم أو البريد أو المعرف...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rtl:pl-4 rtl:pr-10"
        />
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user, index) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectUser(user.user_id)}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12 border-2 border-border group-hover:border-primary/50 transition-colors">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                  {getInitials(user.full_name, user.email)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground truncate">
                    {user.full_name || user.email.split('@')[0]}
                  </h3>
                  {user.is_admin && (
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {user.is_blacklisted && (
                    <Badge variant="destructive" className="text-xs">
                      <Ban className="w-3 h-3 mr-1" />
                      {language === 'en' ? 'Banned' : 'محظور'}
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {user.email}
                </p>
                
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-500" />
                    {user.loyalty_points} {language === 'en' ? 'pts' : 'نقطة'}
                  </span>
                  <span className="font-mono text-[10px] opacity-60">
                    {user.user_id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {searchTerm 
              ? (language === 'en' ? 'No users found' : 'لم يتم العثور على مستخدمين')
              : (language === 'en' ? 'No users registered yet' : 'لا يوجد مستخدمين مسجلين')}
          </p>
        </div>
      )}
    </div>
  );
};
