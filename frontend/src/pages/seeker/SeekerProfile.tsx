import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, FileText, Upload, CheckCircle2, AlertCircle, Sparkles, Image } from 'lucide-react';

interface CandidateProfile {
  id: number;
  skills: string;
  experience: string;
  education: string;
  resumeUrl: string | null;
}

const SeekerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

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
        const response = await api.get('/seeker/profile');
        setProfile(response.data);
        setSkills(response.data.skills || '');
        setExperience(response.data.experience || '');
        setEducation(response.data.education || '');
        setResumeUrl(response.data.resumeUrl);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load profile.');
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
      const response = await api.put('/seeker/profile', {
        skills,
        experience,
        education
      });
      setProfile(response.data);
      setSuccess('Profile details updated successfully!');
    } catch (err: any) {
      setError('Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file for your resume.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/seeker/profile/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResumeUrl(response.data.resumeUrl);
      setSuccess('Resume PDF uploaded successfully!');
    } catch (err: any) {
      setError('Failed to upload resume. Ensure size limit matches 10MB.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Candidate Profile</h1>
          <p className="text-sm text-slate-500">Provide details for recruiters to find and evaluate your application</p>
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
        {/* Left Column: Avatar & Resume */}
        <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 h-fit">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-3 pb-6 border-b border-slate-100">
            <div className="relative group">
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
            <div className="text-center">
              <h4 className="font-bold text-slate-850 text-sm">{user?.name}</h4>
              <p className="text-xs text-slate-400 capitalize">{user?.role.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-base">Your Resume</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload your resume in PDF format. Employers will see this document when you apply.
          </p>

          {resumeUrl ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center space-x-3">
              <FileText className="h-8 w-8 text-brand-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">resume.pdf</p>
                <a
                  href={`http://localhost:8080${resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-brand-600 hover:text-brand-700 underline"
                >
                  View Uploaded File
                </a>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 hover:bg-slate-50 transition-colors">
              <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <span className="text-xs">No resume uploaded yet</span>
            </div>
          )}

          <div>
            <label className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl cursor-pointer transition-colors text-xs">
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload PDF Resume'}</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Edit Profile Info */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Skills */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Skills (Comma-separated)</label>
              <input
                type="text"
                placeholder="Java, Spring Boot, React, SQL, AWS"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
              />
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Professional Experience</label>
              <textarea
                placeholder="Summarize your past work history, key achievements, and tools used..."
                value={experience}
                onChange={e => setExperience(e.target.value)}
                rows={5}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all resize-none"
              />
            </div>

            {/* Education */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Education Details</label>
              <textarea
                placeholder="Degree details, colleges/universities attended, and graduation dates..."
                value={education}
                onChange={e => setEducation(e.target.value)}
                rows={4}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 disabled:bg-slate-350 transition-all text-xs"
            >
              {saving ? 'Saving changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SeekerProfile;
