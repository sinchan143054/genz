"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ImagePlus, Key, Settings2, Sparkles } from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  theme: string;
  accent_color: string;
  language: string;
  share_insights: boolean;
}

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'ur', label: 'Urdu' },
];

const localeCopy = {
  en: {
    pageTitle: 'The place to personalize your comforting experience.',
    pageSubtitle: 'Manage your profile, appearance, language, security, and privacy in one serene dashboard.',
    profileSettings: 'Profile settings',
    displayName: 'Display name',
    bio: 'Bio',
    theme: 'Theme',
    accentColor: 'Accent color',
    language: 'Language',
    shareInsights: 'Share insights with community',
    saveProfile: 'Save profile',
    security: 'Security',
    currentPassword: 'Current password',
    newPassword: 'New password',
    changePassword: 'Change password',
    appearance: 'Appearance preview',
    signOut: 'Sign out',
  },
  hi: {
    pageTitle: 'अपनी आरामदायक अनुभव को निजीकृत करने का स्थान।',
    pageSubtitle: 'अपने प्रोफ़ाइल, रूप, भाषा, सुरक्षा और गोपनीयता को एक शांत डैशबोर्ड में प्रबंधित करें।',
    profileSettings: 'प्रोफ़ाइल सेटिंग्स',
    displayName: 'प्रदर्शन नाम',
    bio: 'बायो',
    theme: 'थीम',
    accentColor: 'एक्सेंट रंग',
    language: 'भाषा',
    shareInsights: 'समुदाय के साथ इंसाइट्स साझा करें',
    saveProfile: 'प्रोफ़ाइल सेव करें',
    security: 'सुरक्षा',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नया पासवर्ड',
    changePassword: 'पासवर्ड बदलें',
    appearance: 'देखने का पूर्वावलोकन',
    signOut: 'साइन आउट',
  },
  bn: {
    pageTitle: 'আপনার আরামদায়ক অভিজ্ঞতা ব্যক্তিগত করার জায়গা।',
    pageSubtitle: 'একটি নিরিবিলি ড্যাশবোর্ডে আপনার প্রোফাইল, চেহারা, ভাষা, নিরাপত্তা এবং গোপনীয়তা পরিচালনা করুন।',
    profileSettings: 'প্রোফাইল সেটিংস',
    displayName: 'প্রদর্শন নাম',
    bio: 'বায়ো',
    theme: 'থিম',
    accentColor: 'একসেন্ট রঙ',
    language: 'ভাষা',
    shareInsights: 'কমিউনিটিতে ইন্সাইট শেয়ার করুন',
    saveProfile: 'প্রোফাইল সেভ করুন',
    security: 'নিরাপত্তা',
    currentPassword: 'বর্তমান পাসওয়ার্ড',
    newPassword: 'নতুন পাসওয়ার্ড',
    changePassword: 'পাসওয়ার্ড বদলান',
    appearance: 'দেখার প্রিভিউ',
    signOut: 'সাইন আউট',
  },
  ta: {
    pageTitle: 'உங்கள் மன அமைதியான அனுபவத்தை தனிப்பயனாக்கும் இடம்.',
    pageSubtitle: 'ஒரே அமைதியான டாஷ்போர்டில் உங்கள் சுயவிவரம், தோற்றம், மொழி, பாதுகாப்பு மற்றும் தனியுரிமையை நிர்வகிக்கவும்.',
    profileSettings: 'சுயவிவர அமைப்புகள்',
    displayName: 'காட்சி பெயர்',
    bio: 'சுயசரிதை',
    theme: 'தீம்',
    accentColor: 'அச்சு நிறம்',
    language: 'மொழி',
    shareInsights: 'சமூகத்துடன் நுண்ணறிவுகளைப் பகிரவும்',
    saveProfile: 'சுயவிவரத்தை சேமி',
    security: 'பாதுகாப்பு',
    currentPassword: 'தற்போதைய கடவுச்சொல்',
    newPassword: 'புதிய கடவுச்சொல்',
    changePassword: 'கடவுச்சொல்லை மாற்றவும்',
    appearance: 'தோற்ற முன்னோட்டம்',
    signOut: 'வெளியேறு',
  },
  te: {
    pageTitle: 'మీ sofisticated అనుభవాన్ని వ్యక్తిగతీకరించడానికి స్థలం.',
    pageSubtitle: 'ఒక ప్రశాంత డాష్బోర్డ్లో మీ ప్రొఫైల్, రూపం, భాష, భద్రత మరియు గోప్యతను నిర్వహించండి.',
    profileSettings: 'ప్రొఫైల్ సెట్టింగ్స్',
    displayName: 'డిస్‌ప్లే పేరు',
    bio: 'బయో',
    theme: 'థీమ్',
    accentColor: 'అక్సెంట్ రంగు',
    language: 'భాష',
    shareInsights: 'సమాజంతో ఇన్‌సైట్స్ పంచుకోండి',
    saveProfile: 'ప్రొఫైల్ సేవ్ చేయండి',
    security: 'భద్రత',
    currentPassword: 'ప్రస్తుత పాస్‌వర్డ్',
    newPassword: 'కొత్త పాస్‌వర్డ్',
    changePassword: 'పాస్‌వర్డ్ మార్చండి',
    appearance: 'రూపం ప్రివ్యూ',
    signOut: 'సైన్ అవుట్',
  },
  ur: {
    pageTitle: 'آپ کا آرام دہ تجربہ اپنے مطابق بنانے کا مقام۔',
    pageSubtitle: 'ایک پرسکون ڈیش بُرد میں اپنی پروفائل، منظر، زبان، سیکورٹی اور رازداری کا نظم کریں۔',
    profileSettings: 'پروفائل سیٹنگز',
    displayName: 'ڈسپلے نام',
    bio: 'بایو',
    theme: 'تھیم',
    accentColor: 'ایکسیٹ رنگ',
    language: 'زبان',
    shareInsights: 'انسیٹس کو کمیونٹی کے ساتھ شیئر کریں',
    saveProfile: 'پروفائل محفوظ کریں',
    security: 'سیکورٹی',
    currentPassword: 'موجودہ پاس ورڈ',
    newPassword: 'نیا پاس ورڈ',
    changePassword: 'پاس ورڈ تبدیل کریں',
    appearance: 'ظاہری شکل کا پیش منظر',
    signOut: 'سائن آؤٹ',
  },
} as const;

export default function SettingsPage() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [accentColor, setAccentColor] = useState('#7c3aed');
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [shareInsights, setShareInsights] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const copy = localeCopy[language as keyof typeof localeCopy] ?? localeCopy.en;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    async function loadProfile() {
      if (!token) return;
      try {
        const response = await api.get('/api/auth/me', { headers: authHeaders(token) });
        setProfile(response.data);
        setName(response.data.name);
        setBio(response.data.bio || '');
        setAccentColor(response.data.accent_color || '#7c3aed');
        setTheme(response.data.theme || 'system');
        setLanguage(response.data.language || 'en');
        setShareInsights(response.data.share_insights);
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, [token]);

  const updateProfile = async () => {
    if (!token) return;
    try {
      const response = await api.put('/api/settings', {
        name,
        bio,
        avatar_url: profile?.avatar_url ?? '',
        accent_color: accentColor,
        theme,
        language,
        share_insights: shareInsights,
      }, { headers: authHeaders(token) });
      setProfile(response.data);
      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Unable to save settings.');
      console.error(err);
    }
  };

  const changePassword = async () => {
    if (!token || !currentPassword || !newPassword) {
      setPasswordMessage('Please provide current and new passwords.');
      return;
    }
    try {
      await api.put('/api/settings/password', { current_password: currentPassword, new_password: newPassword }, { headers: authHeaders(token) });
      setPasswordMessage('Password changed securely.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      setPasswordMessage('Unable to change password. Check the current password.');
      console.error(err);
    }
  };

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card rounded-[32px] border border-white/10 p-8 shadow-glow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Settings</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">{copy.pageTitle}</h1>
                <p className="mt-3 max-w-2xl text-slate-300">{copy.pageSubtitle}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Account</p>
                <p className="mt-2 text-2xl font-semibold text-white">{profile?.email ?? '—'}</p>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
            <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
              <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-violet-300" />
                <h2 className="text-lg font-semibold text-white">{copy.profileSettings}</h2>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">{copy.displayName}</label>
                  <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">{copy.bio}</label>
                  <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} className="w-full rounded-[28px] border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">{copy.theme}</label>
                    <select value={theme} onChange={(event) => setTheme(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">{copy.accentColor}</label>
                    <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-12 w-full cursor-pointer rounded-3xl border border-white/10 bg-slate-950/70 p-2" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">{copy.language}</label>
                    <select value={language} onChange={(event) => setLanguage(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20">
                      {languageOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3">
                    <input id="shareInsights" type="checkbox" checked={shareInsights} onChange={(event) => setShareInsights(event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-900 text-violet-500 focus:ring-violet-400" />
                    <label htmlFor="shareInsights" className="text-sm text-slate-200">{copy.shareInsights}</label>
                  </div>
                </div>
                <button type="button" onClick={updateProfile} className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {copy.saveProfile}
                </button>
                {message && <p className="text-sm text-emerald-300">{message}</p>}
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-lg font-semibold text-white">{copy.security}</h2>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">{copy.currentPassword}</label>
                    <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">{copy.newPassword}</label>
                    <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" />
                  </div>
                  <button type="button" onClick={changePassword} className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400">
                    {copy.changePassword}
                  </button>
                  {passwordMessage && <p className="text-sm text-emerald-300">{passwordMessage}</p>}
                </div>
              </div>
              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-violet-300" />
                  <h2 className="text-lg font-semibold text-white">{copy.appearance}</h2>
                </div>
                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Theme sample</p>
                  <div className="mt-4 rounded-3xl bg-slate-900/80 p-5 text-slate-200">
                    <p className="font-semibold text-white">{profile?.name ?? 'Avery'}</p>
                    <p className="mt-2 text-sm text-slate-400">{bio || 'Crafting emotional wellness through daily rhythm.'}</p>
                  </div>
                </div>
                <button type="button" onClick={logout} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
                  {copy.signOut}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}
