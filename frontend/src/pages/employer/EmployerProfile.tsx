import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Building, Upload, CheckCircle2, AlertCircle, Globe, Shield, User } from 'lucide-react';

interface EmployerProfile {
  id: number;
  companyName: string;
  companyDescription: string;
  website: string;
  logoUrl: string | null;
  user: {
    name: string;
  };
}

const EmployerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [recruiterName, setRecruiterName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pfpUploading, setPfpUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePfpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG/JPG).');
      return;
    }

    setPfpUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/profile/pfp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const newPfpUrl = response.data.profilePictureUrl;
      if (user) {
        updateUser({ ...user, profilePictureUrl: newPfpUrl });
      }
      setSuccess('Profile picture updated successfully!');
    } catch (err: any) {
      setError('Failed to upload profile picture.');
    } finally {
      setPfpUploading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/employer/profile');
        setProfile(response.data);
        setCompanyName(response.data.companyName || '');
        setCompanyDescription(response.data.companyDescription || '');
        setWebsite(response.data.website || '');
        setLogoUrl(response.data.logoUrl);
        setRecruiterName(response.data.user?.name || '');
      } catch (err: any) {
        console.error(err);
        setError('Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put('/employer/profile', {
        companyName,
        companyDescription,
        website,
        user: { name: recruiterName } // Sync name changes
      });
      setProfile(response.data);
      setSuccess('Company profile details updated successfully!');
    } catch (err: any) {
      setError('Failed to update company profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate if it is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for your company logo.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/employer/profile/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setLogoUrl(response.data.logoUrl);
      setSuccess('Company logo uploaded successfully!');
    } catch (err: any) {
      setError('Failed to upload company logo.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading company profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Profile</h1>
          <p className="text-sm text-slate-500">Manage your organization's public branding details</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-rose-700 font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-emerald-700 font-medium">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Branding Logo */}
        <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 h-fit text-center">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-3 pb-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base text-left self-start">Recruiter Photo</h3>
            <div className="relative group mt-2">
              {user?.profilePictureUrl ? (
                <img
                  src={`http://localhost:8080${user.profilePictureUrl}`}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover border-2 border-brand-500/20"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold uppercase">
                  {user?.name.charAt(0)}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[10px] font-bold rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePfpUpload}
                  className="hidden"
                  disabled={pfpUploading}
                />
              </label>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-base text-left">Company Logo</h3>

          <div className="relative inline-block mt-4">
            {logoUrl ? (
              <img
                src={`http://localhost:8080${logoUrl}`}
                alt="Logo"
                className="h-28 w-28 mx-auto rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="h-28 w-28 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-brand-700 uppercase text-3xl border border-slate-200">
                {companyName.charAt(0)}
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 leading-normal max-w-[180px] mx-auto">
            Upload images (JPEG, PNG). Recommends 1:1 aspect ratio square.
          </p>

          <div>
            <label className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl cursor-pointer transition-colors text-xs">
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Logo Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Recruiter Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Recruiter Contact Name</label>
                <input
                  type="text"
                  required
                  value={recruiterName}
                  onChange={e => setRecruiterName(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
                />
              </div>

              {/* Website URL */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-600">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
                  />
                </div>
              </div>

              {/* Company Description */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-600">Company Description</label>
                <textarea
                  placeholder="Describe your organization, history, vision, and core products..."
                  value={companyDescription}
                  onChange={e => setCompanyDescription(e.target.value)}
                  rows={6}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md disabled:bg-slate-350 transition-all text-xs"
            >
              {saving ? 'Saving changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
