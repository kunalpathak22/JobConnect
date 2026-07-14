import React from 'react';
import { Briefcase } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Pitch */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="bg-brand-500 p-2 rounded-xl">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">JobConnect</span>
            </div>
            <p className="text-sm max-w-sm">
              Connecting talented candidates with leading employers in real time. Build your profile, post jobs, manage applications, and accelerate your career.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>support@jobconnect.com</li>
              <li>+1 (555) 019-2834</li>
              <li>100 Tech Highway, Suite 400</li>
              <li>San Francisco, CA</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} JobConnect Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
