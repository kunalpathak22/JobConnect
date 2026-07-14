import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bookmark, MapPin, DollarSign, Calendar, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  salary: number | null;
  jobType: string;
  postedDate: string;
  employer: {
    name: string;
  };
}

const SavedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seeker/jobs/saved', {
        params: { page, size: 5 }
      });
      setJobs(response.data.content || []);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [page]);

  const handleUnsave = async (jobId: number) => {
    try {
      await api.delete(`/seeker/jobs/saved/${jobId}`);
      // Remove from UI list or re-fetch
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (error) {
      console.error('Failed to unsave job:', error);
    }
  };

  if (loading && page === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading bookmarked jobs...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
        <p className="text-sm text-slate-500">Manage and track your bookmarked career listings</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm space-y-3">
          <Bookmark className="h-10 w-10 text-slate-200 mx-auto" />
          <span>You haven't bookmarked any jobs yet.</span>
          <br />
          <Link
            to="/jobs"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
          >
            Search jobs and add bookmarks
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full uppercase">
                    {job.jobType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {job.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 hover:text-brand-600 transition-colors">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {job.employer.name}
                </p>
              </div>

              <div className="flex sm:flex-row items-center justify-between border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0 gap-6">
                <div className="flex flex-col sm:items-end text-xs text-slate-500">
                  <span className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" /> {job.location}
                  </span>
                  <span className="font-bold text-slate-800 sm:mt-1">
                    {job.salary ? `$${job.salary.toLocaleString()}/yr` : 'Salary Disclosed'}
                  </span>
                </div>
                <button
                  onClick={() => handleUnsave(job.id)}
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
  );
};

export default SavedJobs;
