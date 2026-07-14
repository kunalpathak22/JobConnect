import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, User, FileText, Check, X, Shield, Calendar, AlertCircle, MessageSquare, Briefcase } from 'lucide-react';

interface Application {
  id: number;
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  appliedDate: string;
  feedback: string | null;
  resumeUrl: string;
  candidate: {
    id: number;
    name: string;
    email: string;
  };
}

interface SeekerProfile {
  skills: string;
  experience: string;
  education: string;
}

const JobApplicants: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change Modal State
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<'SHORTLISTED' | 'REJECTED' | 'HIRED'>('SHORTLISTED');
  const [feedback, setFeedback] = useState('');
  const [updating, setUpdating] = useState(false);

  // Seeker Detail Overlay State
  const [activeProfile, setActiveProfile] = useState<SeekerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get(`/employer/jobs/${jobId}/applications`, { params });
      setApplications(response.data.content || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch applicants for this listing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, statusFilter]);

  const handleOpenStatusModal = (app: Application, status: 'SHORTLISTED' | 'REJECTED' | 'HIRED') => {
    setActiveApp(app);
    setNewStatus(status);
    setFeedback(app.feedback || '');
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;
    setUpdating(true);

    try {
      const response = await api.put(`/employer/applications/${activeApp.id}/status`, null, {
        params: {
          status: newStatus,
          feedback: feedback
        }
      });

      // Update state list
      setApplications(prev =>
        prev.map(app => (app.id === activeApp.id ? response.data : app))
      );
      setActiveApp(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update candidate application status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenProfileDrawer = async (userId: number) => {
    setProfileLoading(true);
    setShowProfileDrawer(true);
    try {
      const response = await api.get(`/employer/seeker-profile/${userId}`);
      setActiveProfile(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch candidate profile information.');
      setShowProfileDrawer(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIRED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'SHORTLISTED':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading applicants list...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 relative">
      {/* Back Button */}
      <div>
        <Link
          to="/employer/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Applicant Roster</h1>
          <p className="text-sm text-slate-500">Track and shortlist job proposals submitted for this listing</p>
        </div>

        {/* Filters */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:border-brand-500 text-xs outline-none bg-white font-semibold text-slate-700 self-start sm:self-auto"
        >
          <option value="">All Statuses</option>
          <option value="APPLIED">Applied</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="REJECTED">Rejected</option>
          <option value="HIRED">Hired</option>
        </select>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-rose-700 font-medium">{error}</span>
        </div>
      )}

      {/* Applicant Cards List */}
      {applications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm">
          No candidates have applied under this selection yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-all"
            >
              {/* Profile Brief */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Calendar className="h-3 w-3 mr-0.5" />
                    Applied: {new Date(app.appliedDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {app.candidate.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{app.candidate.email}</p>

                {app.feedback && (
                  <p className="text-[11px] text-slate-400 max-w-md italic mt-1">
                    Feedback note: "{app.feedback}"
                  </p>
                )}
              </div>

              {/* Actions & Profile view buttons */}
              <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                <button
                  onClick={() => handleOpenProfileDrawer(app.candidate.id)}
                  className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Candidate Info</span>
                </button>

                <a
                  href={`http://localhost:8080${app.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Resume PDF</span>
                </a>

                {/* Status Trigger Buttons */}
                {app.status === 'APPLIED' && (
                  <>
                    <button
                      onClick={() => handleOpenStatusModal(app, 'SHORTLISTED')}
                      className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-colors border border-amber-100"
                      title="Shortlist Candidate"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(app, 'REJECTED')}
                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors border border-rose-100"
                      title="Reject Candidate"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}

                {app.status === 'SHORTLISTED' && (
                  <>
                    <button
                      onClick={() => handleOpenStatusModal(app, 'HIRED')}
                      className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100"
                      title="Hire Candidate"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(app, 'REJECTED')}
                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors border border-rose-100"
                      title="Reject Candidate"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Change Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 max-w-md w-full relative space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Update Application Status</h3>
              <p className="text-xs text-slate-500">
                Update status for: <strong className="text-slate-700">{activeApp.candidate.name}</strong>
              </p>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as any)}
                  className="px-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all bg-white"
                >
                  <option value="SHORTLISTED">Shortlist Candidate</option>
                  <option value="REJECTED">Reject Candidate</option>
                  <option value="HIRED">Hire Candidate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Recruiter Feedback Note</label>
                <textarea
                  placeholder="Provide feedback on the candidate's portfolio/interview status..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={4}
                  className="px-4 py-3 rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveApp(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-colors"
                >
                  {updating ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Profile Info Modal Drawer (Right overlay) */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end p-0 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white h-full w-full sm:max-w-md shadow-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-y-auto animate-in slide-in-from-right duration-350">
            <button
              onClick={() => {
                setShowProfileDrawer(false);
                setActiveProfile(null);
              }}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>

            {profileLoading ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Fetching candidate details...
              </div>
            ) : activeProfile ? (
              <div className="flex-1 space-y-6 pt-10">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                  <div className="h-12 w-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-700 font-bold">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Candidate Profile</h3>
                    <p className="text-[10px] text-slate-400">Detailed Candidate Summary</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProfile.skills ? (
                      activeProfile.skills.split(',').map((skill, index) => (
                        <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience Summary</span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {activeProfile.experience || 'No experience details specified.'}
                  </p>
                </div>

                {/* Education */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education</span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {activeProfile.education || 'No educational details specified.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">Failed to load profile.</div>
            )}

            <button
              onClick={() => {
                setShowProfileDrawer(false);
                setActiveProfile(null);
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-xs transition-colors mt-6"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
