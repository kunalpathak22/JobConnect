import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { formatSalary, getCurrencySymbol } from '../../services/currency';
import { Search, MapPin, DollarSign, Briefcase, Filter, ArrowLeft, ArrowRight, Grid } from 'lucide-react';

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

const SearchJobs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');

  useEffect(() => {
    const handleCurrency = () => {
      setCurrency(localStorage.getItem('currency') || 'USD');
    };
    window.addEventListener('currencyChange', handleCurrency);
    return () => window.removeEventListener('currencyChange', handleCurrency);
  }, []);
  
  // Search parameters state mapping URL
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [maxSalary, setMaxSalary] = useState(searchParams.get('maxSalary') || '');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const categories = [
    'Software Engineering',
    'Marketing',
    'Design',
    'Finance',
    'Sales',
    'Customer Support',
    'Human Resources',
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size: 8,
      };

      if (keyword) params.keyword = keyword;
      if (location) params.location = location;
      if (category) params.category = category;
      if (jobType) params.jobType = jobType;
      if (minSalary) params.minSalary = currency === 'INR' ? Math.round(Number(minSalary) / 83) : minSalary;
      if (maxSalary) params.maxSalary = currency === 'INR' ? Math.round(Number(maxSalary) / 83) : maxSalary;

      const response = await api.get('/jobs/public/search', { params });
      setJobs(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to search jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, searchParams]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset page to first
    const params: any = {};
    if (keyword) params.keyword = keyword;
    if (location) params.location = location;
    if (category) params.category = category;
    if (jobType) params.jobType = jobType;
    if (minSalary) params.minSalary = minSalary;
    if (maxSalary) params.maxSalary = maxSalary;

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setCategory('');
    setJobType('');
    setMinSalary('');
    setMaxSalary('');
    setPage(0);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Job Openings</h1>
        <p className="text-sm text-slate-500">Discover and apply to active positions across fields</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel - Left */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-sm flex items-center">
              <Filter className="h-4 w-4 mr-2 text-slate-400" /> Filter Options
            </span>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-4">
            {/* Keyword */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Keywords</label>
              <input
                type="text"
                placeholder="Developer, Writer, etc..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs w-full outline-none transition-all"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
              <input
                type="text"
                placeholder="City, State, Remote"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs w-full outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs w-full outline-none transition-all bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job Type</label>
              <select
                value={jobType}
                onChange={e => setJobType(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs w-full outline-none transition-all bg-white"
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Min Salary ({getCurrencySymbol(currency)})</label>
              <input
                type="number"
                placeholder={currency === 'INR' ? "e.g. 4000000" : "e.g. 50000"}
                value={minSalary}
                onChange={e => setMinSalary(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs w-full outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Max Salary ({getCurrencySymbol(currency)})</label>
              <input
                type="number"
                placeholder={currency === 'INR' ? "e.g. 12000000" : "e.g. 150000"}
                value={maxSalary}
                onChange={e => setMaxSalary(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs w-full outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl shadow-md text-xs transition-colors"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Results List - Right */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>
              Found <strong className="text-slate-800">{totalElements}</strong> job postings
            </span>
            <span>
              Page <strong className="text-slate-800">{page + 1}</strong> of {totalPages || 1}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white p-6 rounded-3xl border border-slate-100 h-32 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm">
              No jobs match your search parameters. Try clearing filters.
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
                      Company: {job.employer.name}
                    </p>
                  </div>
                  
                  <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                    <span className="text-xs text-slate-500 flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" /> {job.location}
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 sm:mt-1">
                      {formatSalary(job.salary, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:block mt-1">
                      Posted: {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

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
      </div>
    </div>
  );
};

export default SearchJobs;
