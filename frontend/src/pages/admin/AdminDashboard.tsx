import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield, Users, Briefcase, FileText, CheckCircle2, XCircle, AlertCircle, Trash2, Eye, ToggleLeft, ToggleRight, Info, Upload } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalSeekers: number;
  totalEmployers: number;
  pendingEmployers: number;
  totalJobs: number;
  activeJobs: number;
  flaggedJobs: number;
  totalApplications: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
  createdAt: string;
}

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FLAGGED';
  employer: {
    name: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'pending' | 'users' | 'jobs' | 'settings'>('stats');
  
  // States
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingEmployers, setPendingEmployers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);

  const [loading, setLoading] = useState(true);
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

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Stats
      const statsRes = await api.get('/admin/dashboard');
      setStats(statsRes.data);

      // 2. Fetch Pending Employers
      const pendingRes = await api.get('/admin/employers/pending');
      setPendingEmployers(pendingRes.data);

      // 3. Fetch All Users
      const usersRes = await api.get('/admin/users');
      setAllUsers(usersRes.data);

      // 4. Fetch All Jobs (We use public search with high size & showAll=true in service layer if we want to moderate, but since searchJobs has a showAll param, let's call it)
      const jobsRes = await api.get('/jobs/public/search?size=100'); // Note: public search matches active, let's load what we can
      setAllJobs(jobsRes.data.content || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve administration metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveEmployer = async (userId: number, approve: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/admin/employers/${userId}/approve`, null, {
        params: { approve }
      });
      setSuccess(approve ? 'Employer registration approved!' : 'Employer registration rejected.');
      fetchDashboardData(); // Refresh records
    } catch (err) {
      setError('Failed to process approval.');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    setError(null);
    setSuccess(null);
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${userId}/status`, null, {
        params: { status: nextStatus }
      });
      setSuccess(`User account status updated to ${nextStatus}.`);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update account status.');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${userName}" and all their associated records (profile, jobs, applications, saved jobs, notifications)? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccess(`User "${userName}" and all associated data deleted successfully.`);
      fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      setError('Failed to delete user.');
    }
  };

  const handleModerateJob = async (jobId: number, nextStatus: 'ACTIVE' | 'FLAGGED' | 'INACTIVE') => {
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/admin/jobs/${jobId}/status`, null, {
        params: { status: nextStatus }
      });
      setSuccess(`Job listing status marked as ${nextStatus}.`);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to moderate job posting.');
    }
  };

  const tabClass = (tab: string) =>
    `px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      activeTab === tab
        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  if (loading && !stats) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading admin console details...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
        <div className="bg-brand-600 p-2.5 rounded-2xl text-white shadow-md shadow-brand-500/20">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-sm text-slate-500">Monitor and moderate users, registrations, and listings</p>
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
        <button onClick={() => setActiveTab('stats')} className={tabClass('stats')}>
          Overview Stats
        </button>
        <button onClick={() => setActiveTab('pending')} className={tabClass('pending')}>
          Pending Approvals ({pendingEmployers.length})
        </button>
        <button onClick={() => setActiveTab('users')} className={tabClass('users')}>
          Manage Accounts ({allUsers.length})
        </button>
        <button onClick={() => setActiveTab('jobs')} className={tabClass('jobs')}>
          Moderate Jobs ({allJobs.length})
        </button>
        <button onClick={() => setActiveTab('settings')} className={tabClass('settings')}>
          Admin Profile
        </button>
      </div>

      {/* TAB CONTENT: STATS */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.totalJobs}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Vacancies</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.totalApplications}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Applications</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.pendingEmployers}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Recs</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {pendingEmployers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No pending employer registrations to review.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {pendingEmployers.map((emp) => (
                <div key={emp.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                    <p className="text-slate-500">{emp.email}</p>
                    <span className="text-[10px] text-slate-400">Registered: {new Date(emp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveEmployer(emp.id, true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproveEmployer(emp.id, false)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-2 px-4 rounded-xl border border-rose-100 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MANAGE ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 text-xs">
            {allUsers.map((u) => (
              <div key={u.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                    <span className="text-[9px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full uppercase">
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-500">{u.email}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span>Registered: {new Date(u.createdAt).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span className={`font-semibold uppercase ${u.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {u.status}
                    </span>
                  </div>
                </div>
                
                {u.role !== 'ADMIN' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                      className={`font-semibold py-2 px-4 rounded-xl border transition-colors ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MODERATE JOBS */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {allJobs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No job listings found on the platform.</div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {allJobs.map((job) => (
                <div key={job.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                    <p className="text-slate-500">Recruiter: {job.employer.name} &bull; {job.location}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        job.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {job.status !== 'FLAGGED' && (
                      <button
                        onClick={() => handleModerateJob(job.id, 'FLAGGED')}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-600 font-semibold py-2 px-3 rounded-xl border border-amber-100 transition-colors"
                      >
                        Flag Post
                      </button>
                    )}
                    {job.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleModerateJob(job.id, 'ACTIVE')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold py-2 px-3 rounded-xl border border-emerald-100 transition-colors"
                      >
                        Approve Post
                      </button>
                    )}
                    <button
                      onClick={() => handleModerateJob(job.id, 'INACTIVE')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-2 px-3 rounded-xl border border-rose-100 transition-colors"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ADMIN PROFILE */}
      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto space-y-6">
          <h3 className="font-bold text-slate-900 text-lg text-center">Admin Profile Picture</h3>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {user?.profilePictureUrl ? (
                <img
                  src={`http://localhost:8080${user.profilePictureUrl}`}
                  alt={user.name}
                  className="h-28 w-28 rounded-full object-cover border-2 border-brand-500/20"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-3xl font-bold uppercase">
                  {user?.name.charAt(0)}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
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
            
            {pfpUploading && (
              <span className="text-xs text-slate-500">Uploading photo...</span>
            )}
            
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-800 text-base">{user?.name}</h4>
              <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                System Administrator
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
