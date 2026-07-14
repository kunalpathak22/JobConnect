import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatSalary } from '../../services/currency';
import { MapPin, DollarSign, Briefcase, Calendar, Bookmark, FileText, Upload, AlertCircle, ArrowLeft, Building, Globe } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  salary: number | null;
  jobType: string;
  postedDate: string;
  requiredSkills: string;
  employer: {
    id: number;
    name: string;
  };
}

interface CompanyProfile {
  companyName: string;
  companyDescription: string;
  website: string;
  logoUrl: string | null;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');

  useEffect(() => {
    const handleCurrency = () => {
      setCurrency(localStorage.getItem('currency') || 'USD');
    };
    window.addEventListener('currencyChange', handleCurrency);
    return () => window.removeEventListener('currencyChange', handleCurrency);
  }, []);

  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchJobDetails = async () => {
    try {
      const jobRes = await api.get(`/jobs/public/${id}`);
      setJob(jobRes.data);
      
      // Load company profile publicly
      try {
        const compRes = await api.get(`/jobs/public/employer-profile/${jobRes.data.employer.id}`);
        setCompany(compRes.data);
      } catch (err) {
        console.error('Failed to load company profile:', err);
      }

      // Check if logged in user is a Job Seeker and check status
      if (user?.role === 'JOB_SEEKER') {
        // Check bookmarked status
        const bookmarkedRes = await api.get(`/seeker/jobs/saved/${id}/check`);
        setBookmarked(bookmarkedRes.data.bookmarked);

        // Check if candidate has already applied
        const appRes = await api.get('/seeker/applications?size=100');
        const appliedList = appRes.data.content || [];
        const match = appliedList.some((app: any) => app.job.id === Number(id));
        setHasApplied(match);
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'JOB_SEEKER') return;

    try {
      if (bookmarked) {
        await api.delete(`/seeker/jobs/saved/${id}`);
        setBookmarked(false);
      } else {
        await api.post(`/seeker/jobs/saved?jobId=${id}`);
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append('jobId', String(id));
    if (!useProfileResume && customFile) {
      formData.append('file', customFile);
    }

    try {
      await api.post('/seeker/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMsg('Your application was submitted successfully!');
      setHasApplied(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setSubmitError(err.response.data.message);
      } else {
        setSubmitError('Failed to apply. Make sure your profile has a default resume or upload a custom PDF.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-rose-500 font-semibold">
        Job listing not found or has been removed.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Job List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Job details - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded-full uppercase">
                  {job.jobType.replace('_', ' ')}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {job.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium flex items-center">
                  <Building className="h-4 w-4 mr-1 text-slate-400" /> {job.employer.name}
                </p>
              </div>

              {user?.role === 'JOB_SEEKER' && (
                <button
                  onClick={toggleBookmark}
                  className={`p-2.5 rounded-full border transition-all ${
                    bookmarked
                      ? 'bg-brand-50 border-brand-200 text-brand-600'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Quick Metadata Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-slate-50 py-4 text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-800">
                  {formatSalary(job.salary, currency)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 col-span-2 sm:col-span-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Job Description</h3>
              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Required Skills */}
            {job.requiredSkills && (
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              {!user ? (
                <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl w-full text-center">
                  <span>Log in as a Job Seeker to apply. </span>
                  <Link to="/login" className="font-bold text-brand-600 hover:underline">
                    Login here
                  </Link>
                </div>
              ) : user.role === 'JOB_SEEKER' ? (
                hasApplied ? (
                  <button
                    disabled
                    className="w-full bg-slate-100 text-slate-400 font-semibold py-3.5 rounded-xl text-sm cursor-not-allowed"
                  >
                    Application Submitted
                  </button>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-brand-500/20 transition-colors"
                  >
                    Apply for Position
                  </button>
                )
              ) : (
                <div className="text-xs text-slate-400 text-center w-full italic">
                  Recruiter/Admin view: Candidate actions hidden.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company card details - Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-base">About the Employer</h3>
            
            {company ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-brand-700 uppercase">
                    {company.companyName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{company.companyName}</h4>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-brand-600 hover:underline flex items-center mt-0.5"
                      >
                        <Globe className="h-3 w-3 mr-0.5" /> Visit website
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {company.companyDescription || 'No description provided by the company.'}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Company profile is currently unavailable.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 max-w-md w-full relative space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Submit Application</h3>
              <p className="text-xs text-slate-500">Apply to: {job.title}</p>
            </div>

            {submitError && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-rose-700 font-medium">{submitError}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-emerald-700 font-medium">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                  <input
                    type="radio"
                    checked={useProfileResume}
                    onChange={() => setUseProfileResume(true)}
                    className="h-4 w-4 text-brand-600"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">Use Profile Resume</span>
                    <p className="text-slate-400 mt-0.5">Apply using the PDF loaded in your profile.</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useProfileResume}
                    onChange={() => setUseProfileResume(false)}
                    className="h-4 w-4 text-brand-600"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">Upload Custom Resume</span>
                    <p className="text-slate-400 mt-0.5">Upload a specific PDF resume for this job.</p>
                  </div>
                </label>
              </div>

              {!useProfileResume && (
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center">
                  <Upload className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                  <label className="cursor-pointer text-[10px] font-bold text-brand-600 hover:text-brand-700 underline block">
                    Choose PDF File
                    <input
                      type="file"
                      accept=".pdf"
                      required
                      onChange={e => setCustomFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {customFile && (
                    <span className="text-[10px] text-slate-500 mt-1 block truncate">
                      {customFile.name}
                    </span>
                  )}
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
