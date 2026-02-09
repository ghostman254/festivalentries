import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, Download, Filter, ChevronDown, ChevronUp, UserPlus, Users, Trash2, Search, KeyRound, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAndSanitizeError } from '@/lib/error-utils';
import { SCHOOL_CATEGORIES, ITEM_TYPES } from '@/lib/constants';
import type { Session } from '@supabase/supabase-js';
import { z } from 'zod';

interface SchoolRow {
  id: string;
  school_name: string;
  category: string;
  teacher_name: string;
  phone_number: string;
  total_items: number;
  created_at: string;
  items: ItemRow[];
}

interface ItemRow {
  id: string;
  item_type: string;
  language: string | null;
  item_code: string;
  status: string;
  created_at: string;
}

interface AdminUser {
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

const adminEmailSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const passwordChangeSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterItemType, setFilterItemType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  
  // Admin management state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [deleteSchoolId, setDeleteSchoolId] = useState<string | null>(null);
  
  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  useEffect(() => {
    const checkAdminRole = async (userId: string) => {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (!roleData || roleData.role !== 'admin') {
        toast({ 
          title: 'Access Denied', 
          description: 'You do not have administrator privileges.', 
          variant: 'destructive' 
        });
        await supabase.auth.signOut();
        navigate('/admin/login', { replace: true });
        return false;
      }
      return true;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setSession(session);
      setTimeout(() => {
        checkAdminRole(session.user.id);
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate('/admin/login', { replace: true });
        return;
      }
      const isAdmin = await checkAdminRole(session.user.id);
      if (isAdmin) {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    const [schoolsRes, settingsRes, adminsRes] = await Promise.all([
      supabase.from('schools').select('*').order('created_at', { ascending: false }),
      supabase.from('app_settings').select('value').eq('key', 'submissions_open').maybeSingle(),
      supabase.rpc('get_admin_users'),
    ]);

    if (schoolsRes.data) {
      // Fetch items for all schools
      const ids = schoolsRes.data.map(s => s.id);
      const { data: itemsData } = await supabase.from('items').select('*').in('school_id', ids);

      const enriched: SchoolRow[] = schoolsRes.data.map(s => ({
        ...s,
        items: (itemsData || []).filter(i => i.school_id === s.id),
      }));
      setSchools(enriched);
    }

    if (settingsRes.data) {
      setSubmissionsOpen(settingsRes.data.value === 'true');
    }

    if (adminsRes.data) {
      setAdmins(adminsRes.data);
    }
    
    setLoading(false);
  };

  const addNewAdmin = async () => {
    const result = adminEmailSchema.safeParse({ email: newAdminEmail, password: newAdminPassword });
    if (!result.success) {
      toast({ title: 'Validation Error', description: result.error.issues[0].message, variant: 'destructive' });
      return;
    }

    setAddingAdmin(true);
    try {
      // Create the user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newAdminEmail.trim(),
        password: newAdminPassword,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Failed to create user');

      // Check if this is a repeated signup (user already exists)
      // signUp returns the existing user but with identities array empty for repeated signups
      const isExistingUser = signUpData.user.identities?.length === 0;
      
      if (isExistingUser) {
        // User already exists - check if they already have admin role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', signUpData.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (existingRole) {
          toast({ title: 'Already Admin', description: 'This user is already an administrator.', variant: 'destructive' });
          setAddingAdmin(false);
          return;
        }
        
        // Add admin role to existing user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: signUpData.user.id, role: 'admin' });

        if (roleError) throw roleError;

        toast({ title: 'Admin Added', description: `${newAdminEmail} has been granted admin access. They can login with their existing password.` });
      } else {
        // New user - add admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: signUpData.user.id, role: 'admin' });

        if (roleError) throw roleError;

        toast({ title: 'Admin Added', description: `${newAdminEmail} has been added as an admin. They should check their email to confirm.` });
      }
      
      setNewAdminEmail('');
      setNewAdminPassword('');
      setShowAdminDialog(false);
      fetchData();
    } catch (err: unknown) {
      toast({ title: 'Error', description: logAndSanitizeError(err, 'auth', 'Admin creation error'), variant: 'destructive' });
    } finally {
      setAddingAdmin(false);
    }
  };

  const removeAdmin = async (userId: string) => {
    if (userId === session?.user.id) {
      toast({ title: 'Error', description: 'You cannot remove yourself.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to remove admin.', variant: 'destructive' });
    } else {
      toast({ title: 'Admin Removed' });
      fetchData();
    }
  };

  const changePassword = async () => {
    const result = passwordChangeSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      toast({ title: 'Validation Error', description: result.error.issues[0].message, variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(false);
    } catch (err: unknown) {
      toast({ title: 'Error', description: logAndSanitizeError(err, 'auth', 'Password change error'), variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  const confirmDeleteSchool = async () => {
    if (!deleteSchoolId) return;
    
    // Delete items first (cascade), then school
    const { error: itemsError } = await supabase.from('items').delete().eq('school_id', deleteSchoolId);
    if (itemsError) {
      toast({ title: 'Error', description: 'Failed to delete items.', variant: 'destructive' });
      setDeleteSchoolId(null);
      return;
    }
    
    const { error } = await supabase.from('schools').delete().eq('id', deleteSchoolId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete entry.', variant: 'destructive' });
    } else {
      toast({ title: 'Entry Deleted' });
      setExpandedSchool(null);
      fetchData();
    }
    setDeleteSchoolId(null);
  };

  const toggleSubmissions = async () => {
    const newVal = !submissionsOpen;
    const { error } = await supabase.from('app_settings').update({ value: String(newVal), updated_at: new Date().toISOString() }).eq('key', 'submissions_open');
    if (error) {
      toast({ title: 'Error', description: 'Failed to update setting.', variant: 'destructive' });
    } else {
      setSubmissionsOpen(newVal);
      toast({ title: newVal ? 'Submissions Opened' : 'Submissions Closed' });
    }
  };

  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSchool = s.school_name.toLowerCase().includes(query);
        const matchesTeacher = s.teacher_name.toLowerCase().includes(query);
        if (!matchesSchool && !matchesTeacher) return false;
      }
      if (filterCategory !== 'all' && s.category !== filterCategory) return false;
      if (filterItemType !== 'all' && !s.items.some(i => i.item_type === filterItemType)) return false;
      return true;
    });
  }, [schools, filterCategory, filterItemType, searchQuery]);

  const exportCSV = () => {
    const rows: string[] = ['School Name,Category,Teacher,Phone,Item Type,Language,Item Code,Status,Date'];
    for (const s of filteredSchools) {
      for (const item of s.items) {
        rows.push([
          `"${s.school_name}"`, s.category, `"${s.teacher_name}"`, s.phone_number,
          item.item_type, item.language || '', item.item_code, item.status,
          new Date(s.created_at).toLocaleDateString(),
        ].join(','));
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative-items-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const totalItems = schools.reduce((acc, s) => acc + s.items.length, 0);
  const totalTeachers = new Set(schools.map(s => s.teacher_name.toLowerCase())).size;
  const recentSchools = schools.filter(s => {
    const diff = Date.now() - new Date(s.created_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Category breakdown for bar chart
  const categoryData = useMemo(() => {
    return SCHOOL_CATEGORIES.map(cat => ({
      category: cat,
      schools: schools.filter(s => s.category === cat).length,
      items: schools.filter(s => s.category === cat).reduce((sum, s) => sum + s.items.length, 0),
    }));
  }, [schools]);

  // Item type breakdown (top 6)
  const itemTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    schools.forEach(s => s.items.forEach(i => {
      counts[i.item_type] = (counts[i.item_type] || 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [schools]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7" />
            <h1 className="text-lg sm:text-xl font-heading font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10">
                  <KeyRound className="h-4 w-4 mr-2" /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your new password below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      placeholder="Minimum 6 characters" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input 
                      type="password" 
                      placeholder="Re-enter your password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={changePassword} disabled={changingPassword}>
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Schools</p>
              </div>
              <p className="text-3xl font-heading font-bold text-foreground">{schools.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Items</p>
              </div>
              <p className="text-3xl font-heading font-bold text-foreground">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Teachers</p>
              </div>
              <p className="text-3xl font-heading font-bold text-foreground">{totalTeachers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
              <p className="text-3xl font-heading font-bold text-foreground">{recentSchools}</p>
              <p className="text-xs text-muted-foreground">new schools</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Portal</p>
                </div>
                <p className="text-lg font-heading font-bold text-foreground">
                  {submissionsOpen ? 'Open' : 'Closed'}
                </p>
              </div>
              <Switch checked={submissionsOpen} onCheckedChange={toggleSubmissions} />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Schools & Items by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryData.map(d => (
                  <div key={d.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{d.category}</span>
                      <span className="font-medium text-foreground">{d.schools} schools · {d.items} items</span>
                    </div>
                    <div className="flex gap-1 h-6">
                      <div
                        className="bg-primary rounded-sm transition-all"
                        style={{ width: `${schools.length ? (d.schools / schools.length) * 100 : 0}%`, minWidth: d.schools ? '4px' : '0' }}
                        title={`${d.schools} schools`}
                      />
                      <div
                        className="bg-accent rounded-sm transition-all"
                        style={{ width: `${totalItems ? (d.items / totalItems) * 100 : 0}%`, minWidth: d.items ? '4px' : '0' }}
                        title={`${d.items} items`}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm" /> Schools</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-accent rounded-sm" /> Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Item Types</CardTitle>
            </CardHeader>
            <CardContent>
              {itemTypeData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No items yet</p>
              ) : (
                <div className="space-y-2">
                  {itemTypeData.map(d => {
                    const maxCount = itemTypeData[0]?.count || 1;
                    return (
                      <div key={d.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate mr-2">{d.name}</span>
                          <span className="font-medium text-foreground shrink-0">{d.count}</span>
                        </div>
                        <div className="h-5 bg-secondary rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-primary/80 rounded-sm transition-all"
                            style={{ width: `${(d.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>
              <div className="space-y-1 flex-1 min-w-[200px] max-w-[300px]">
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="School or teacher name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 bg-card"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40 bg-card h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All Categories</SelectItem>
                    {SCHOOL_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Item Type</Label>
                <Select value={filterItemType} onValueChange={setFilterItemType}>
                  <SelectTrigger className="w-44 bg-card h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All Types</SelectItem>
                    {ITEM_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schools Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submissions ({filteredSchools.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No submissions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map(school => (
                      <>
                        <TableRow
                          key={school.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}
                        >
                          <TableCell>
                            {expandedSchool === school.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{school.school_name}</TableCell>
                          <TableCell><Badge variant="outline">{school.category}</Badge></TableCell>
                          <TableCell>{school.teacher_name}</TableCell>
                          <TableCell>{school.phone_number}</TableCell>
                          <TableCell className="text-center">{school.items.length}</TableCell>
                          <TableCell>{new Date(school.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteSchoolId(school.id);
                              }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedSchool === school.id && (
                          <TableRow key={`${school.id}-items`}>
                            <TableCell colSpan={8} className="bg-muted/30 p-4">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered Items</p>
                                {school.items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between bg-card rounded-md border border-border p-3 text-sm">
                                    <div className="flex items-center gap-3">
                                      <span className="font-medium">{item.item_type}</span>
                                      {item.language && <Badge variant="secondary" className="text-xs">{item.language}</Badge>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono font-semibold text-primary">{item.item_code}</code>
                                      <Badge variant={item.status === 'Registered' ? 'outline' : 'default'} className="text-xs">{item.status}</Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Admin Users ({admins.length})
                </CardTitle>
                <CardDescription>Manage administrator access</CardDescription>
              </div>
              <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>
                      Create a new administrator account. They will receive an email to confirm their account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input 
                        type="email" 
                        placeholder="admin@school.edu" 
                        value={newAdminEmail}
                        onChange={e => setNewAdminEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input 
                        type="password" 
                        placeholder="Minimum 6 characters" 
                        value={newAdminPassword}
                        onChange={e => setNewAdminPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addNewAdmin} disabled={addingAdmin}>
                      {addingAdmin ? 'Adding...' : 'Add Admin'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No admins found.</p>
            ) : (
              <div className="space-y-2">
                {admins.map(admin => (
                  <div key={admin.user_id} className="flex items-center justify-between bg-muted/30 rounded-md border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{admin.email || 'No email'}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(admin.created_at!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                        {admin.role === 'super_admin' ? '👑 Super Admin' : admin.role}
                      </Badge>
                      {admin.user_id !== session?.user.id && admin.role !== 'super_admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeAdmin(admin.user_id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteSchoolId} onOpenChange={(open) => !open && setDeleteSchoolId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this submission? This will permanently remove the school entry and all associated items. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSchool} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
