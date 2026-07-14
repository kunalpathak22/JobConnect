import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { formatSalary } from '../services/currency';
import { Search, MapPin, Briefcase, ChevronRight, TrendingUp, Users, Building } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  salary: number;
  jobType: string;
  postedDate: string;
  employer: {
    name: string;
  };
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');

  useEffect(() => {
    const handleCurrency = () => {
      setCurrency(localStorage.getItem('currency') || 'USD');
    };
    window.addEventListener('currencyChange', handleCurrency);
    return () => window.removeEventListener('currencyChange', handleCurrency);
  }, []);

  const [stats, setStats] = useState({
    activeJobs: 0,
    candidates: 0,
    employers: 0,
    softwareJobs: 0,
    marketingJobs: 0,
    designJobs: 0,
    financeJobs: 0,
  });

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          api.get('/jobs/public/search?size=4'),
          api.get('/jobs/public/stats')
        ]);
        setFeaturedJobs(jobsRes.data.content || []);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to load landing data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
  };

  const categories = [
    { name: 'Software Engineering', count: `${stats.softwareJobs} Jobs`, color: 'from-blue-500 to-indigo-500' },
    { name: 'Marketing', count: `${stats.marketingJobs} Jobs`, color: 'from-pink-500 to-rose-500' },
    { name: 'Design', count: `${stats.designJobs} Jobs`, color: 'from-purple-500 to-violet-500' },
    { name: 'Finance', count: `${stats.financeJobs} Jobs`, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-24 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(14,146,233,0.15),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Discover Your <span className="bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">Next Career</span> Chapter
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            JobConnect unites ambitious developers, creative specialists, and industry experts with recruiters setting the pace of modern tech.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white/10 backdrop-blur p-2 rounded-2xl sm:rounded-full border border-white/10 max-w-4xl mx-auto flex flex-col sm:flex-row gap-2 shadow-2xl"
          >
            <div className="flex-1 flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-white/10 text-slate-800">
              <Search className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 w-full text-white placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-2 text-slate-800">
              <MapPin className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="City, state, or remote..."
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 w-full text-white placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl sm:rounded-full text-sm shadow-lg shadow-brand-500/20 transition-all"
            >
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="flex justify-center text-brand-600 mb-2">
              <Briefcase className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.activeJobs}</div>
            <div className="text-sm text-slate-500">Live Job Openings</div>
          </div>
          <div className="space-y-2 border-y sm:border-y-0 sm:border-x border-slate-100 py-6 sm:py-0">
            <div className="flex justify-center text-brand-600 mb-2">
              <Users className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.candidates}</div>
            <div className="text-sm text-slate-500">Talented Candidates</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-center text-brand-600 mb-2">
              <Building className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.employers}</div>
            <div className="text-sm text-slate-500">Partner Companies</div>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Browse by Category</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Browse job listings grouped by specialized industry tracks.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.name)}`)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group flex flex-col justify-between h-40"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white font-semibold text-lg`}>
                {cat.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center">
                  {cat.name}
                  <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                </h3>
                <span className="text-xs text-slate-400">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900">Featured Job Postings</h2>
            <p className="text-slate-500">Explore recently published active career positions.</p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center"
          >
            Explore All Jobs <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-100 h-44 animate-pulse" />
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No active jobs found. Recruiters are currently updating details.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded-full uppercase">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mt-2 hover:text-brand-600 cursor-pointer transition-colors">
                    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Building className="h-3.5 w-3.5 mr-1" /> {job.employer.name}
                  </p>
                </div>
                <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-2">
                  <span className="text-xs text-slate-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-slate-400" /> {job.location}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatSalary(job.salary, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
