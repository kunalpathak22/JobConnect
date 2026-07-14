import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Briefcase, Sparkles, AlertCircle } from 'lucide-react';

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [requiredSkills, setRequiredSkills] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Software Engineering',
    'Marketing',
    'Design',
    'Finance',
    'Sales',
    'Customer Support',
    'Human Resources',
  ];

  useEffect(() => {
    if (editId) {
      const fetchJobDetails = async () => {
        setFetching(true);
        try {
          const response = await api.get(`/jobs/public/${editId}`);
          const job = response.data;
          setTitle(job.title);
          setDescription(job.description);
          setCategory(job.category);
          setLocation(job.location);
          setSalary(job.salary ? String(job.salary) : '');
          setJobType(job.jobType);
          setRequiredSkills(job.requiredSkills || '');
        } catch (err: any) {
          console.error(err);
          setError('Failed to load job listing details for editing.');
        } finally {
          setFetching(false);
        }
      };
      fetchJobDetails();
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      category,
      location,
      salary: salary ? Number(salary) : null,
      jobType,
      requiredSkills
    };

    try {
      if (editId) {
        await api.put(`/employer/jobs/${editId}`, payload);
      } else {
        await api.post('/employer/jobs', payload);
      }
      navigate('/employer/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save job listing. Verify fields and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading job listing details...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to="/employer/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {editId ? 'Edit Job Posting' : 'Post a New Job Opportunity'}
          </h1>
          <p className="text-sm text-slate-500">Provide details for prospective candidate matches</p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-rose-700 font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600">Job Title</label>
              <input
                type="text"
                required
                placeholder="Senior React Developer"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Category</label>
              <select
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all bg-white"
              >
                <option value="">Select a Category</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Job Type</label>
              <select
                required
                value={jobType}
                onChange={e => setJobType(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all bg-white"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Location</label>
              <input
                type="text"
                required
                placeholder="San Francisco, CA (Remote)"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
              />
            </div>

            {/* Salary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Annual Salary (USD)</label>
              <input
                type="number"
                placeholder="e.g. 95000"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
              />
            </div>

            {/* Required Skills */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600">Required Skills (Comma-separated)</label>
              <input
                type="text"
                placeholder="React, TypeScript, Redux, Tailwind"
                value={requiredSkills}
                onChange={e => setRequiredSkills(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600">Detailed Job Description</label>
              <textarea
                required
                placeholder="Describe role responsibilities, team structures, day-to-day items, and perks..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={8}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm w-full outline-none transition-all resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl shadow-lg transition-colors text-xs"
          >
            {loading ? 'Saving Listing details...' : editId ? 'Save Changes' : 'Publish Job Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
