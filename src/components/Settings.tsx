import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Header } from './Header';
import { 
  UserIcon, SettingsIcon, LockIcon, ShieldCheckIcon, AlertCircleIcon, 
  HelpCircleIcon, MessageSquareIcon, InfoIcon, ShieldIcon, FileTextIcon, 
  LogOutIcon, AlertTriangleIcon, UploadCloudIcon, Trash2Icon, LoaderIcon,
  EyeIcon, EyeOffIcon, CheckCircleIcon, XCircleIcon
} from './Icons';

interface SettingsProps {
  userName: string;
  email: string;
  isAdmin?: boolean;
  onProfileUpdate?: (name: string, avatarUrl: string | null) => void;
}

export const Settings: React.FC<SettingsProps> = ({ userName, email, isAdmin = false, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'support' | 'privacy' | 'danger'>('account');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Account State
  const [fullName, setFullName] = useState(userName);
  const [joinedDate, setJoinedDate] = useState('');
  const [courseLevel, setCourseLevel] = useState('Novice');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  // Security Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  
  // Delete Account State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user && isMounted) {
        const date = new Date(user.created_at);
        setJoinedDate(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        setFullName(user.user_metadata?.full_name || userName);

        const { data: progress } = await supabase.from('user_progress').select('active_level').eq('user_id', user.id).single();
        if (progress?.active_level && isMounted) {
          setCourseLevel(progress.active_level);
        }
      }
    };
    fetchUserData();
    return () => { isMounted = false; };
  }, [userName]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      // Also update user_progress table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_progress').update({ user_name: fullName }).eq('user_id', user.id);
      }
      
      if (onProfileUpdate) {
        onProfileUpdate(fullName, avatarUrl);
      }

      if (error) throw error;
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const compressImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to process image file.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      // 1. Generate optimized Data URL for instant, fail-safe rendering & storage
      const dataUrl = await compressImageToDataUrl(file);
      let finalUrl = dataUrl;

      // 2. Try uploading to Supabase Storage avatars bucket if configured
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const filePath = `${user.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            finalUrl = publicUrlData.publicUrl;
          }
        }
      } catch (storageErr) {
        // Silently fallback to Auth metadata image storage if avatars bucket is unconfigured
      }

      // 3. Persist avatar_url in Supabase Auth Metadata (persists across login/refresh/device change)
      await supabase.auth.updateUser({ data: { avatar_url: finalUrl } });
      
      // 4. Update user_progress if available
      try {
        await supabase.from('user_progress').update({ avatar_url: finalUrl }).eq('user_id', user.id);
      } catch (_) {}

      // 5. Update local state & trigger app-wide header update
      setAvatarUrl(finalUrl);
      if (onProfileUpdate) {
        onProfileUpdate(fullName, finalUrl);
      }

      setSuccessMsg('Profile photo updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile photo.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.auth.updateUser({ data: { avatar_url: null } });
      
      if (user) {
        try {
          await supabase.from('user_progress').update({ avatar_url: null }).eq('user_id', user.id);
        } catch (_) {}
      }

      setAvatarUrl(null);
      if (onProfileUpdate) {
        onProfileUpdate(fullName, null);
      }
      setSuccessMsg('Profile photo removed.');
    } catch (err: any) {
      setErrorMsg('Failed to remove photo.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      await supabase.auth.signOut();
      setSuccessMsg('Password changed successfully. Please log in again.');
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };


  const handleLogoutDevice = async () => {
    await supabase.auth.signOut();
    // App.tsx handles the routing
  };

  const isProtectedAdmin =
    isAdmin ||
    ['pakaraswalih@gmail.com', 'admin@syllosphere.com'].includes((email || '').trim().toLowerCase());

  const clearLocalAuthStorage = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('sb-') || k.includes('supabase') || k.includes('syllosphere'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    try {
      sessionStorage.clear();
    } catch (_) {}
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    if (isProtectedAdmin) {
      setErrorMsg('Admin accounts are protected and cannot be deleted.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !session?.access_token) {
        throw new Error('No active authenticated session found. Please log in again.');
      }

      let backendDeleted = false;
      let shouldFallbackToEdgeOrRpc = false;

      // 1. Primary secure backend deletion via /api/delete-account (Supabase Admin API)
      try {
        const resp = await fetch('/api/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const contentType = resp.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await resp.json() : null;

        if (resp.ok && payload?.success) {
          backendDeleted = true;
        } else if (
          resp.status === 404 ||
          resp.status === 501 ||
          !isJson ||
          payload?.code === 'MISSING_SERVICE_ROLE_KEY'
        ) {
          // Server endpoint missing or missing service role key in this runtime -> try Edge/RPC
          shouldFallbackToEdgeOrRpc = true;
        } else {
          throw new Error(payload?.error || `Account deletion failed (${resp.status}).`);
        }
      } catch (networkOrApiErr: any) {
        if (
          networkOrApiErr?.name === 'TypeError' ||
          String(networkOrApiErr?.message || '').includes('Failed to fetch')
        ) {
          shouldFallbackToEdgeOrRpc = true;
        } else {
          throw networkOrApiErr;
        }
      }

      // 2. Fallback to Supabase Edge Function if /api route is unavailable/unconfigured
      if (!backendDeleted && shouldFallbackToEdgeOrRpc) {
        let edgeSucceeded = false;
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('delete-account');
          if (!edgeError && edgeData?.success) {
            edgeSucceeded = true;
            backendDeleted = true;
          } else if (edgeError) {
            const msg = String(edgeError.message || '');
            // Only fall through to RPC if Edge Function isn't deployed (404 / Relay / Failed to send)
            const isNotDeployed =
              msg.includes('404') ||
              msg.includes('NOT_FOUND') ||
              msg.includes('Failed to send a request') ||
              msg.includes('FunctionsFetchError');
            if (!isNotDeployed) {
              throw new Error(msg || 'Account deletion failed.');
            }
          }
        } catch (edgeCatchErr: any) {
          const msg = String(edgeCatchErr?.message || '');
          const isNotDeployed =
            msg.includes('404') ||
            msg.includes('NOT_FOUND') ||
            msg.includes('Failed to send a request') ||
            msg.includes('FunctionsFetchError');
          if (!isNotDeployed) {
            throw edgeCatchErr;
          }
        }

        // 3. Fallback to hardened PostgreSQL SECURITY DEFINER RPC (deletes auth.users + all user data)
        if (!edgeSucceeded) {
          const { error: rpcError } = await supabase.rpc('delete_user_account');
          if (rpcError) {
            if (
              rpcError.message?.includes('Could not find the function') ||
              rpcError.message?.includes('schema cache')
            ) {
              throw new Error(
                'Backend account deletion service is not configured yet. Please configure SUPABASE_SERVICE_ROLE_KEY or deploy the delete-account backend.'
              );
            }
            throw new Error(rpcError.message || 'Backend account deletion failed.');
          }
          backendDeleted = true;
        }
      }

      if (!backendDeleted) {
        throw new Error('Unable to verify backend account deletion. Your account was not deleted.');
      }

      // 4. Only after confirmed backend deletion: clear session & local storage, then redirect to login/signup
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (_) {}
      clearLocalAuthStorage();
      setShowDeleteAccount(false);
      setDeleteConfirmText('');
      window.location.href = window.location.origin + window.location.pathname + '#login';
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => (
    <div 
      className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 border-b md:border-b-0 border-slate-200 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {[
        { id: 'account', icon: <UserIcon className="w-5 h-5"/>, label: 'Account' },
        { id: 'security', icon: <LockIcon className="w-5 h-5"/>, label: 'Security' },
        { id: 'support', icon: <HelpCircleIcon className="w-5 h-5"/>, label: 'Support' },
        { id: 'privacy', icon: <ShieldIcon className="w-5 h-5"/>, label: 'Privacy' },
        { id: 'danger', icon: <AlertTriangleIcon className="w-5 h-5"/>, label: 'Account Actions' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => { setActiveTab(tab.id as any); setErrorMsg(''); setSuccessMsg(''); }}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold text-sm transition-all whitespace-nowrap shrink-0 ${
            activeTab === tab.id 
              ? tab.id === 'danger' 
                ? 'bg-rose-50 text-rose-600 shadow-[0_2px_10px_-4px_rgba(225,29,72,0.1)] border border-rose-100'
                : 'bg-white text-blue-600 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-blue-50' 
              : 'text-slate-500 hover:bg-white hover:text-slate-700 border border-transparent'
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F7FF] font-sans text-slate-900 flex flex-col overflow-x-hidden">
      <Header userName={userName} isAdmin={isAdmin} avatarUrl={avatarUrl} />
      
      <main className="flex-1 px-4 sm:px-6 md:px-12 py-8 max-w-[1200px] mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-2 tracking-tight font-serif">Settings</h1>
          <p className="text-[15px] text-slate-500 font-medium">Manage your account and platform preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            {renderTabs()}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Global Alerts */}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 text-sm font-medium flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
                <CheckCircleIcon className="w-5 h-5 shrink-0" /> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-medium flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
                <XCircleIcon className="w-5 h-5 shrink-0" /> {errorMsg}
              </div>
            )}

            {/* --- ACCOUNT --- */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-sm border border-slate-200 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-xl font-bold text-[#0f172a] mb-8">Account Profile</h3>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 pb-10 border-b border-slate-100">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-serif text-slate-400">{fullName.charAt(0).toUpperCase()}</span>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadCloudIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col gap-2 items-center">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors w-full"
                      >
                        {loading ? 'Uploading...' : 'Change Photo'}
                      </button>
                      {avatarUrl && (
                        <button 
                          onClick={handleRemoveAvatar}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-[#0f172a] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        disabled
                        className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed outline-none"
                      />
                    </div>
                    
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={loading || fullName === userName}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#0f172a] mb-6">Account Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
                    <p className="text-sm font-semibold text-[#0f172a]">{joinedDate || 'Loading...'}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Course Level</p>
                    <p className="text-sm font-semibold text-blue-700">{courseLevel}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm font-semibold text-emerald-700">Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- SECURITY --- */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-[#0f172a] mb-2">Password Settings</h3>
                  <p className="text-sm text-slate-500 font-medium mb-8">Update your password or reset it if forgotten.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setShowChangePassword(true)}
                      className="px-6 py-3.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-sm transition-all text-center"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-[#0f172a] mb-2">Device Management</h3>
                  <p className="text-sm text-slate-500 font-medium mb-8">Sign out of your account on this device.</p>
                  
                  <button 
                    onClick={handleLogoutDevice}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all w-full sm:w-auto"
                  >
                    <LogOutIcon className="w-4 h-4" /> Logout from Current Device
                  </button>
                </div>
              </div>
            )}

            {/* --- SUPPORT --- */}
            {activeTab === 'support' && (
              <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-sm border border-slate-200 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-xl font-bold text-[#0f172a] mb-8">Support & Help</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <a href="#" className="p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <HelpCircleIcon className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-[#0f172a] mb-1">Help & FAQ</h4>
                    <p className="text-sm text-slate-500 font-medium">Find answers to common questions about the platform.</p>
                  </a>
                  
                  <a href="mailto:pakaraswalih@gmail.com?subject=Bug Report — Syllosphere&body=Please describe the bug you encountered:%0D%0A%0D%0A" className="p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <AlertCircleIcon className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-[#0f172a] mb-1">Report a Bug</h4>
                    <p className="text-sm text-slate-500 font-medium">Found an issue? Let us know so we can fix it.</p>
                  </a>
                  
                  <a href="mailto:pakaraswalih@gmail.com?subject=Support Request — Syllosphere&body=How can we help you today?%0D%0A%0D%0A" className="p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <MessageSquareIcon className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-[#0f172a] mb-1">Contact Support</h4>
                    <p className="text-sm text-slate-500 font-medium">Reach out directly to our customer success team.</p>
                  </a>
                  
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <InfoIcon className="w-8 h-8 text-slate-400 mb-4" />
                    <h4 className="font-bold text-[#0f172a] mb-1">About Syllosphere</h4>
                    <p className="text-sm text-slate-500 font-medium mb-4">Learn more about our mission and the team behind the platform.</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold font-mono">
                      v1.0.0
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- PRIVACY --- */}
            {activeTab === 'privacy' && (
              <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-sm border border-slate-200 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-xl font-bold text-[#0f172a] mb-2">Privacy & Terms</h3>
                <p className="text-sm text-slate-500 font-medium mb-8">Review the policies that govern your use of the platform.</p>
                
                <div className="space-y-4">
                  <a href="#" className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <ShieldIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f172a]">Privacy Policy</h4>
                        <p className="text-xs text-slate-500 font-medium">How we handle your data.</p>
                      </div>
                    </div>
                    <div className="text-slate-300 group-hover:text-blue-500 transition-colors">→</div>
                  </a>
                  
                  <a href="#" className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <FileTextIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f172a]">Terms & Conditions</h4>
                        <p className="text-xs text-slate-500 font-medium">Rules for using Syllosphere.</p>
                      </div>
                    </div>
                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">→</div>
                  </a>
                </div>
              </div>
            )}

            {/* --- DANGER ZONE --- */}
            {activeTab === 'danger' && (
              <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-sm border border-rose-100 animate-[fadeIn_0.2s_ease-out] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <h3 className="text-xl font-bold text-[#0f172a] mb-2 relative z-10">Account Actions</h3>
                <p className="text-sm text-slate-500 font-medium mb-10 relative z-10">These actions are permanent and affect your account access.</p>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border border-slate-100 bg-slate-50 gap-4">
                    <div>
                      <h4 className="font-bold text-[#0f172a] mb-1">Logout</h4>
                      <p className="text-xs text-slate-500 font-medium">Sign out of your account on this device.</p>
                    </div>
                    <button 
                      onClick={handleLogoutDevice}
                      className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-white rounded-xl font-bold text-sm transition-all w-full sm:w-auto"
                    >
                      Logout
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border border-rose-100 bg-rose-50/50 gap-4">
                    <div>
                      <h4 className="font-bold text-rose-700 mb-1">Delete Account</h4>
                      <p className="text-xs text-rose-600/70 font-medium max-w-sm">
                        {isProtectedAdmin
                          ? 'Administrator accounts are protected and cannot be deleted.'
                          : 'Permanently delete your account, progress, and all associated data. This action cannot be undone.'}
                      </p>
                    </div>
                    <button 
                      onClick={() => { setErrorMsg(''); setDeleteConfirmText(''); setShowDeleteAccount(true); }}
                      disabled={isProtectedAdmin}
                      className="px-6 py-3 bg-rose-100 hover:bg-rose-200 disabled:opacity-50 disabled:cursor-not-allowed text-rose-700 rounded-xl font-bold text-sm transition-all w-full sm:w-auto shrink-0"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowChangePassword(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <XCircleIcon className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-2">Change Password</h3>
            <p className="text-sm text-slate-500 mb-6">Enter your new password below.</p>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0f172a] block mb-2">New Password</label>
                <div className="relative">
                  <input type={showPwd1 ? "text" : "password"} required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                  <button type="button" onClick={() => setShowPwd1(!showPwd1)} className="absolute right-4 top-3 text-slate-400">
                    {showPwd1 ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#0f172a] block mb-2">Confirm New Password</label>
                <div className="relative">
                  <input type={showPwd2 ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                  <button type="button" onClick={() => setShowPwd2(!showPwd2)} className="absolute right-4 top-3 text-slate-400">
                    {showPwd2 ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                  </button>
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}


      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-2 border-rose-100">
            <button onClick={() => { setShowDeleteAccount(false); setErrorMsg(''); setDeleteConfirmText(''); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <XCircleIcon className="w-6 h-6" />
            </button>
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6 text-rose-600 mx-auto">
              <AlertTriangleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-rose-600 mb-2 text-center">Delete Account?</h3>
            <p className="text-sm text-slate-600 mb-6 text-center">
              This action is <span className="font-bold text-rose-600">permanent</span> and cannot be undone. All your progress, lessons, and certificates will be destroyed.
            </p>
            
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">
              Type "DELETE" to confirm
            </p>
            <input 
              type="text" 
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-center text-[#0f172a] outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 mb-4 transition-all" 
            />

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex items-start gap-2">
                <XCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteAccount(false); setErrorMsg(''); setDeleteConfirmText(''); }} className="flex-1 py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-sm">
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || loading}
                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:bg-rose-400 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center"
              >
                {loading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
