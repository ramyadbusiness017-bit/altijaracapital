"use client";

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  User,
  ShieldCheck,
  SignOut,
  CaretRight,
  MonitorPlay,
  EnvelopeSimple,
  Megaphone,
  X,
  Camera,
  CheckCircle,
  Question
} from '@phosphor-icons/react/dist/ssr';
import { updateProfile, updatePassword, updateAvatar, uploadAvatarFile, updateNotificationPrefs } from '@/app/actions/settings';

interface SettingsOverviewProps {
  fullName: string;
  userId: string;
  email: string;
  joinDate: string;
  avatarUrl: string;
  initialEmailNotifs: boolean;
  initialPushNotifs: boolean;
  initialMarketingNotifs: boolean;
}

export default function SettingsOverview({ 
  fullName, 
  userId,
  email,
  joinDate,
  avatarUrl,
  initialEmailNotifs,
  initialPushNotifs,
  initialMarketingNotifs
}: SettingsOverviewProps) {
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Optimistic UI State
  const [currentFullName, setCurrentFullName] = useState(fullName);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);

  // Modals state
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isRemoveAvatarModalOpen, setRemoveAvatarModalOpen] = useState(false);
  
  // Form states
  const [firstNameInput, setFirstNameInput] = useState(currentFullName.split(' ')[0] || '');
  const [lastNameInput, setLastNameInput] = useState(currentFullName.split(' ').slice(1).join(' ') || '');
  const [newPassword, setNewPassword] = useState('');
  
  // File input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Toggles state
  const [emailNotifs, setEmailNotifs] = useState(initialEmailNotifs);
  const [pushNotifs, setPushNotifs] = useState(initialPushNotifs);
  const [marketing, setMarketing] = useState(initialMarketingNotifs);

  // Sync state if server props change unexpectedly (though we rely on optimistic updates)
  useEffect(() => {
    setCurrentFullName(fullName);
    setCurrentAvatarUrl(avatarUrl);
  }, [fullName, avatarUrl]);

  // Custom Toggle Switch Component
  const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${enabled ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-[#1C2128]'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating profile...');
    
    // Optimistic Update
    const newFullName = `${firstNameInput} ${lastNameInput}`.trim();
    setCurrentFullName(newFullName);
    
    const res = await updateProfile(firstNameInput, lastNameInput);
    if (res.success) {
      toast.success('Profile updated successfully!', { id: loadingToast });
      setProfileModalOpen(false);
      router.refresh(); // Sync server state
    } else {
      toast.error(res.error || 'Failed to update profile', { id: loadingToast });
      setCurrentFullName(fullName); // Revert
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    const loadingToast = toast.loading('Updating password...');
    const res = await updatePassword(newPassword);
    if (res.success) {
      toast.success('Password updated successfully!', { id: loadingToast });
      setPasswordModalOpen(false);
      setNewPassword('');
    } else {
      toast.error(res.error || 'Failed to update password', { id: loadingToast });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const loadingToast = toast.loading('Uploading photo...');
      
      // Optimistic preview
      const previewUrl = URL.createObjectURL(file);
      setCurrentAvatarUrl(previewUrl);

      const res = await uploadAvatarFile(formData);
      
      if (res.success && res.url) {
        toast.success('Photo updated successfully!', { id: loadingToast });
        setCurrentAvatarUrl(res.url); // Set actual public url
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to upload photo', { id: loadingToast });
        setCurrentAvatarUrl(avatarUrl); // Revert
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleRemovePhoto = async () => {
    const loadingToast = toast.loading('Removing photo...');
    setCurrentAvatarUrl(''); // Optimistic update
    
    const res = await updateAvatar('');
    if (res.success) {
      toast.success('Photo removed!', { id: loadingToast });
      setRemoveAvatarModalOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || 'Failed to remove photo', { id: loadingToast });
      setCurrentAvatarUrl(avatarUrl); // Revert
    }
  };

  const toggleNotification = async (type: 'email' | 'push' | 'marketing') => {
    let newEmail = emailNotifs;
    let newPush = pushNotifs;
    let newMarketing = marketing;

    if (type === 'email') { newEmail = !emailNotifs; setEmailNotifs(newEmail); }
    if (type === 'push') { newPush = !pushNotifs; setPushNotifs(newPush); }
    if (type === 'marketing') { newMarketing = !marketing; setMarketing(newMarketing); }

    const res = await updateNotificationPrefs({ email: newEmail, push: newPush, marketing: newMarketing });
    if (!res.success) {
      toast.error('Failed to update preferences');
      if (type === 'email') setEmailNotifs(!newEmail);
      if (type === 'push') setPushNotifs(!newPush);
      if (type === 'marketing') setMarketing(!newMarketing);
    } else {
      toast.success('Preferences saved');
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile & Account', subtitle: 'Manage your personal info', icon: User },
    { id: 'security', label: 'Security', subtitle: 'Password and 2FA', icon: ShieldCheck },
    { id: 'notifications', label: 'Notification Preferences', subtitle: 'Email and push settings', icon: Bell },
    { id: 'support', label: 'Help & Support', subtitle: 'Get help and send queries', icon: Question, action: () => router.push('/dashboard/support') },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pt-8 pb-32 px-4 sm:px-8 lg:px-10 gap-8 min-h-screen">
      

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Left Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full md:w-80 flex flex-col gap-2 order-1"
        >
          <div className="hidden md:flex flex-col gap-2 bg-[#0D1117]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-3 shadow-2xl">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={item.action ? item.action : () => setActiveTab(item.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 shadow-[inset_4px_0_0_#D4AF37]' 
                    : 'border border-transparent hover:bg-white/5'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37] rounded-r-full" />
                )}
                
                <div className={`p-2 rounded-xl transition-colors ${activeTab === item.id ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#1C2128] text-[#8B949E] group-hover:bg-[#30363D] group-hover:text-white'}`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" weight={activeTab === item.id ? "fill" : "regular"} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold mb-0.5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-[#8B949E] group-hover:text-white'}`}>{item.label}</h3>
                  <p className={`text-xs transition-colors ${activeTab === item.id ? 'text-[#D4AF37]/70' : 'text-[#8B949E]/60'}`}>{item.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile Nav List */}
          <div className="md:hidden flex flex-col mb-4 bg-[#0D1117]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            {navItems.map((item, idx) => (
              <button 
                key={item.id}
                onClick={item.action ? item.action : () => setActiveTab(item.id)}
                className={`flex items-center justify-between p-5 text-left active:bg-white/5 transition-colors ${idx !== navItems.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#1C2128] text-[#8B949E]'}`}>
                    <item.icon className="w-5 h-5 flex-shrink-0" weight={activeTab === item.id ? "fill" : "regular"} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{item.label}</h3>
                    <p className="text-xs text-[#8B949E]">{item.subtitle}</p>
                  </div>
                </div>
                <CaretRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'rotate-90 text-[#D4AF37]' : 'text-[#30363D]'}`} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col gap-6 order-2 relative">
          <AnimatePresence mode="wait">
            
            {/* Profile Information Block */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl overflow-hidden relative"
              >
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <h2 className="hidden md:block text-xl font-extrabold text-white mb-8">Profile Information</h2>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                        {currentAvatarUrl ? (
                          <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          currentFullName.split(' ').map(n => n[0]).join('').substring(0,2)
                        )}
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-[#D4AF37] text-[#070A0D] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Camera weight="fill" className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">{currentFullName}</h3>
                      <p className="text-sm font-medium text-[#8B949E] flex items-center gap-2">
                        {email}
                        <CheckCircle weight="fill" className="text-[#22C55E] w-4 h-4" />
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp, image/gif" />
                    <button onClick={() => setProfileModalOpen(true)} className="px-6 py-2.5 bg-white hover:bg-gray-100 text-black font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl active:scale-95">
                      Edit Profile
                    </button>
                    {currentAvatarUrl && (
                      <button onClick={() => setRemoveAvatarModalOpen(true)} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl text-sm transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-t border-white/5 relative z-10">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-[#8B949E] mb-1 font-medium">Full Name</p>
                    <p className="text-sm font-bold text-white truncate">{currentFullName}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-[#8B949E] mb-1 font-medium">User ID</p>
                    <p className="text-sm font-bold text-white font-mono">{userId}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-[#8B949E] mb-1 font-medium">Member Since</p>
                    <p className="text-sm font-bold text-white">{joinDate}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                    <p className="text-xs text-[#8B949E] mb-1 font-medium">Account Status</p>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]"></span>
                      </span>
                      <p className="text-sm font-bold text-white">Active</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#22C55E]/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <h2 className="text-xl font-extrabold text-white mb-8">Security & Access</h2>
                
                <div className="flex flex-col gap-4">
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                    <div className="flex items-center gap-5 mb-4 sm:mb-0">
                      <div className="p-3 bg-[#1C2128] rounded-xl group-hover:bg-[#D4AF37]/10 transition-colors">
                        <ShieldCheck weight="fill" className="w-6 h-6 text-[#8B949E] group-hover:text-[#D4AF37] transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white mb-1">Password</h3>
                        <p className="text-xs text-[#8B949E] font-medium">Last updated recently</p>
                      </div>
                    </div>
                    <button onClick={() => setPasswordModalOpen(true)} className="w-full sm:w-auto px-5 py-2.5 bg-[#1C2128] hover:bg-[#30363D] border border-[#30363D] text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                      Change Password
                    </button>
                  </div>

                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#22C55E]/30 transition-colors">
                    <div className="flex items-center gap-5 mb-4 sm:mb-0">
                      <div className="p-3 bg-[#1C2128] rounded-xl group-hover:bg-[#22C55E]/10 transition-colors">
                        <MonitorPlay weight="fill" className="w-6 h-6 text-[#8B949E] group-hover:text-[#22C55E] transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white mb-1">Two-Factor Auth (2FA)</h3>
                        <p className="text-xs text-[#22C55E] font-bold">Enabled & Secured</p>
                      </div>
                    </div>
                    <button onClick={() => toast('Coming in v2!', { icon: '🚀' })} className="w-full sm:w-auto px-5 py-2.5 bg-transparent border border-white/10 hover:border-white/20 text-white font-bold rounded-xl text-sm transition-colors">
                      Manage 2FA
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notification Preferences */}
            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl"
              >
                <h2 className="text-xl font-extrabold text-white mb-8">Notification Preferences</h2>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-[#1C2128] rounded-xl">
                        <EnvelopeSimple weight="fill" className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white mb-1">Email Notifications</h3>
                        <p className="text-xs text-[#8B949E] font-medium">Important updates and alerts</p>
                      </div>
                    </div>
                    <Toggle enabled={emailNotifs} onChange={() => toggleNotification('email')} />
                  </div>

                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-[#1C2128] rounded-xl">
                        <Bell weight="fill" className="w-6 h-6 text-[#22C55E]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white mb-1">Push Notifications</h3>
                        <p className="text-xs text-[#8B949E] font-medium">Real-time alerts on your device</p>
                      </div>
                    </div>
                    <Toggle enabled={pushNotifs} onChange={() => toggleNotification('push')} />
                  </div>

                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-[#1C2128] rounded-xl">
                        <Megaphone weight="fill" className="w-6 h-6 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white mb-1">Marketing & News</h3>
                        <p className="text-xs text-[#8B949E] font-medium">Promotions and platform news</p>
                      </div>
                    </div>
                    <Toggle enabled={marketing} onChange={() => toggleNotification('marketing')} />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Modals using Framer Motion */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0D]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0D1117] border border-white/10 shadow-2xl rounded-3xl p-8 w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#22C55E]" />
              <button onClick={() => setProfileModalOpen(false)} className="absolute top-6 right-6 text-[#8B949E] hover:text-white bg-[#1C2128] p-2 rounded-full transition-colors">
                <X className="w-4 h-4" weight="bold" />
              </button>
              <h2 className="text-2xl font-extrabold text-white mb-6">Edit Profile</h2>
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={firstNameInput}
                    onChange={e => setFirstNameInput(e.target.value)}
                    className="w-full bg-[#161B22] border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={lastNameInput}
                    onChange={e => setLastNameInput(e.target.value)}
                    className="w-full bg-[#161B22] border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-3.5 bg-white text-black font-extrabold rounded-xl mt-4 hover:bg-gray-100 transition-colors shadow-lg active:scale-[0.98]">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0D]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0D1117] border border-white/10 shadow-2xl rounded-3xl p-8 w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <button onClick={() => setPasswordModalOpen(false)} className="absolute top-6 right-6 text-[#8B949E] hover:text-white bg-[#1C2128] p-2 rounded-full transition-colors">
                <X className="w-4 h-4" weight="bold" />
              </button>
              <h2 className="text-2xl font-extrabold text-white mb-6">Change Password</h2>
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-[#161B22] border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-3.5 bg-white text-black font-extrabold rounded-xl mt-4 hover:bg-gray-100 transition-colors shadow-lg active:scale-[0.98]">
                  Update Password
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isRemoveAvatarModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0D]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0D1117] border border-white/10 shadow-2xl rounded-3xl p-8 w-full max-w-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-800" />
              <h2 className="text-xl font-extrabold text-white mb-3 text-center mt-2">Remove Photo?</h2>
              <p className="text-sm text-[#8B949E] mb-8 text-center font-medium">This action cannot be undone. Are you sure you want to proceed?</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleRemovePhoto} className="w-full py-3.5 bg-red-500/10 border border-red-500/30 text-red-500 font-extrabold rounded-xl hover:bg-red-500/20 transition-colors active:scale-[0.98]">
                  Yes, Remove
                </button>
                <button onClick={() => setRemoveAvatarModalOpen(false)} className="w-full py-3.5 bg-[#1C2128] text-white font-extrabold rounded-xl hover:bg-[#30363D] transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
