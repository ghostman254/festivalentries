import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, Download, Filter, ChevronDown, ChevronUp, UserPlus, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterItemType, setFilterItemType] = useState<string>('all');
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  
  // Admin management state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

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

      // Add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: signUpData.user.id, role: 'admin' });

      if (roleError) throw roleError;

      toast({ title: 'Admin Added', description: `${newAdminEmail} has been added as an admin. They should check their email to confirm.` });
      setNewAdminEmail('');
      setNewAdminPassword('');
      setShowAdminDialog(false);
      fetchData();
    } catch (err: any) {
      const msg = err.message?.includes('already registered')
        ? 'This email is already registered.'
        : err.message || 'Failed to add admin.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
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
      if (filterCategory !== 'all' && s.category !== filterCategory) return false;
      if (filterItemType !== 'all' && !s.items.some(i => i.item_type === filterItemType)) return false;
      return true;
    });
  }, [schools, filterCategory, filterItemType]);

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
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const totalItems = schools.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7" />
            <h1 className="text-lg sm:text-xl font-heading font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Total Schools</p>
              <p className="text-3xl font-heading font-bold text-foreground">{schools.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-3xl font-heading font-bold text-foreground">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submissions</p>
                <p className="text-lg font-heading font-bold text-foreground">
                  {submissionsOpen ? 'Open' : 'Closed'}
                </p>
              </div>
              <Switch checked={submissionsOpen} onCheckedChange={toggleSubmissions} />
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                        </TableRow>
                        {expandedSchool === school.id && (
                          <TableRow key={`${school.id}-items`}>
                            <TableCell colSpan={7} className="bg-muted/30 p-4">
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
                      <Badge variant="secondary">{admin.role}</Badge>
                      {admin.user_id !== session?.user.id && (
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
      </main>
    </div>
  );
}
