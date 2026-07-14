import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Calendar, MessageSquare, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Application {
  id: number;
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  appliedDate: string;
  feedback: string | null;
  job: {
    id: number;
    title: string;
    location: string;
    employer: {
      name: string;
    };
  };
}

const AppliedJobs: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seeker/applications', {
        params: { page, size: 5 }
      });
      setApplications(response.data.content || []);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page]);

  const getStatusStyle = (status: string) => {
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

  if (loading && page === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading applications list...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-500">Track the status of your submitted job proposals</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm space-y-3">
          <FileText className="h-10 w-10 text-slate-200 mx-auto" />
          <span>You haven't applied to any jobs yet.</span>
          <br />
          <Link
            to="/jobs"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
          >
            Search jobs and apply
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900 hover:text-brand-600 transition-colors">
                    <Link to={`/jobs/${app.job.id}`}>{app.job.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {app.job.employer.name} &bull; {app.job.location}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Detail section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-50 pt-4 text-xs text-slate-500 gap-4">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                  Applied: {new Date(app.appliedDate).toLocaleDateString()}
                </span>
                
                {app.feedback && (
                  <div className="flex items-start bg-slate-50 p-3.5 rounded-2xl border border-slate-100 sm:max-w-md w-full">
                    <MessageSquare className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-700 block">Feedback:</span>
                      <p className="text-slate-500 mt-0.5 leading-relaxed">{app.feedback}</p>
                    </div>
                  </div>
                )}
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
  );
};

export default AppliedJobs;
