import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Briefcase, FileText, Plus, Eye, Edit2, Trash2, MapPin, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  salary: number | null;
  jobType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FLAGGED';
  postedDate: string;
}

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchEmployerJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employer/jobs', {
        params: { page, size: 5, sortBy: 'postedDate', sortDir: 'desc' }
      });
      setJobs(response.data.content || []);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to load employer jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, [page]);

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to delete this job listing? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/employer/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setTotalElements(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job listing. Contact support.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'FLAGGED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading && page === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
          <p className="text-sm text-slate-500">Manage and track your active job listings and applicants</p>
        </div>
        <Link
          to="/employer/post-job"
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-5 rounded-xl text-xs shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Post a New Job</span>
        </Link>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalElements}</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Listings</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {jobs.filter(j => j.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Openings</div>
          </div>
        </div>
      </div>

      {/* Listings List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Your Posted Positions</h2>

        {jobs.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm space-y-3">
            <Briefcase className="h-10 w-10 text-slate-200 mx-auto" />
            <span>You haven't posted any jobs yet.</span>
            <br />
            <Link
              to="/employer/post-job"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
            >
              Post your first vacancy details
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-all"
              >
                {/* Meta details */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full uppercase">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 truncate">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1" /> {job.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                      {job.salary ? `$${job.salary.toLocaleString()}/yr` : 'Salary Disclosed'}
                    </span>
                    <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                  <Link
                    to={`/employer/jobs/${job.id}/applicants`}
                    className="flex items-center space-x-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Applicants</span>
                  </Link>

                  <Link
                    to={`/employer/post-job?editId=${job.id}`}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-slate-700 px-4">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
