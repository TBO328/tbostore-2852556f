import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldOff, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRole {
  user_id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
}

interface UsersManagementProps {
  language: string;
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  currentUserId?: string;
}

export const UsersManagement = ({ language, toast, currentUserId }: UsersManagementProps) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    email: string;
    makeAdmin: boolean;
  }>({ open: false, userId: '', email: '', makeAdmin: false });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_users_with_roles');
      
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

  const handleRoleChange = (userId: string, email: string, makeAdmin: boolean) => {
    if (userId === currentUserId && !makeAdmin) {
      toast({
        title: language === 'en' ? 'Cannot remove own admin' : 'لا يمكن إزالة صلاحيتك',
        description: language === 'en' 
          ? 'You cannot remove your own admin privileges' 
          : 'لا يمكنك إزالة صلاحيات الأدمن الخاصة بك',
        variant: 'destructive',
      });
      return;
    }
    
    setConfirmDialog({ open: true, userId, email, makeAdmin });
  };

  const confirmRoleChange = async () => {
    const { userId, makeAdmin } = confirmDialog;
    setConfirmDialog({ ...confirmDialog, open: false });
    setUpdating(userId);

    try {
      const { data, error } = await supabase.rpc('set_admin_role', {
        _target_user_id: userId,
        _make_admin: makeAdmin,
      });

      if (error) throw error;

      if (data) {
        setUsers(prev =>
          prev.map(u =>
            u.user_id === userId ? { ...u, is_admin: makeAdmin } : u
          )
        );
        toast({
          title: language === 'en' ? 'Success' : 'تم بنجاح',
          description: makeAdmin
            ? (language === 'en' ? 'User promoted to admin' : 'تم ترقية المستخدم لأدمن')
            : (language === 'en' ? 'Admin privileges removed' : 'تم إزالة صلاحيات الأدمن'),
        });
      } else {
        throw new Error('Permission denied');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: language === 'en' ? 'Error' : 'خطأ',
        description: language === 'en' ? 'Failed to update role' : 'فشل في تحديث الصلاحية',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {language === 'en' ? 'Manage Users' : 'إدارة المستخدمين'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {language === 'en' 
            ? `${users.length} users registered`
            : `${users.length} مستخدم مسجل`}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{language === 'en' ? 'Email' : 'البريد الإلكتروني'}</TableHead>
              <TableHead>{language === 'en' ? 'Registered' : 'تاريخ التسجيل'}</TableHead>
              <TableHead className="text-center">{language === 'en' ? 'Role' : 'الصلاحية'}</TableHead>
              <TableHead className="text-center w-32">{language === 'en' ? 'Admin' : 'أدمن'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <motion.tr
                key={user.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-mono text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{user.email}</span>
                    {user.user_id === currentUserId && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {language === 'en' ? 'You' : 'أنت'}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString(
                    language === 'ar' ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.is_admin
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {user.is_admin ? (
                      <>
                        <Shield className="w-3 h-3" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" />
                        User
                      </>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {updating === user.user_id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <Switch
                      checked={user.is_admin}
                      onCheckedChange={(checked) =>
                        handleRoleChange(user.user_id, user.email, checked)
                      }
                      disabled={user.user_id === currentUserId}
                    />
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {language === 'en' ? 'No users registered yet' : 'لا يوجد مستخدمين مسجلين'}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.makeAdmin
                ? (language === 'en' ? 'Promote to Admin?' : 'ترقية لأدمن؟')
                : (language === 'en' ? 'Remove Admin?' : 'إزالة صلاحية الأدمن؟')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.makeAdmin
                ? (language === 'en'
                    ? `Are you sure you want to give admin privileges to ${confirmDialog.email}? They will have full access to the admin panel.`
                    : `هل أنت متأكد من منح صلاحيات الأدمن لـ ${confirmDialog.email}؟ سيكون لديه وصول كامل للوحة التحكم.`)
                : (language === 'en'
                    ? `Are you sure you want to remove admin privileges from ${confirmDialog.email}?`
                    : `هل أنت متأكد من إزالة صلاحيات الأدمن من ${confirmDialog.email}؟`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className={confirmDialog.makeAdmin ? 'bg-primary' : 'bg-destructive hover:bg-destructive/90'}
            >
              {confirmDialog.makeAdmin
                ? (language === 'en' ? 'Promote' : 'ترقية')
                : (language === 'en' ? 'Remove' : 'إزالة')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
