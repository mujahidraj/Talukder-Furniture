import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../components/ui/Loader';
import SEO from '../../components/seo/SEO';

export default function CareerPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        const activeJobs = data.filter((j: any) => j.isActive);
        if (activeJobs.length > 0) {
          setJobs(activeJobs);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch jobs, falling back to mock data.', err);
      }

      // Mock jobs fallback
      setJobs([
        { id: 'mock1', title: 'Senior Interior Designer', department: 'Design', location: 'Dhaka, BD', type: 'Full-time' },
        { id: 'mock2', title: 'Showroom Manager', department: 'Retail', location: 'Chattogram, BD', type: 'Full-time' },
        { id: 'mock3', title: 'Master Craftsman / Carpenter', department: 'Manufacturing', location: 'Gazipur, BD', type: 'Full-time' },
        { id: 'mock4', title: 'E-commerce Specialist', department: 'Marketing', location: 'Remote', type: 'Contract' },
      ]);
    };

    fetchJobs().finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-secondary min-h-screen pt-28 pb-20 font-sans">
      <SEO 
        title="Careers"
        description="Join the Talukder Furniture team. Explore our open positions and build a rewarding career with Bangladesh's premium furniture brand."
        url="/careers"
      />
      {/* Banner */}
      <div className="relative py-20 px-4 md:px-8 xl:px-12 overflow-hidden mb-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80" 
            alt="Careers Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <h1 className="text-4xl md:text-5xl text-white font-serif mb-3 drop-shadow-md">Careers</h1>
          <div className="text-white/90 text-sm font-medium drop-shadow-md">
            <Link to="/" className="hover:text-white">Homepage</Link> <span className="mx-2">&gt;</span> Careers
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <Briefcase size={48} className="text-[#003580] mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] mb-4">Join Our Team</h2>
          <p className="text-gray-500 text-lg">
            We're always looking for passionate, talented individuals to help us build the future of home furnishings.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 mb-12">
          <h2 className="text-2xl font-serif font-bold text-primary mb-6">Why work with us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ArrowRight size={16} className="text-primary" /> Creative Environment</h3>
              <p>Work alongside industry-leading designers and craftsmen in an environment that fosters innovation and creativity.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ArrowRight size={16} className="text-primary" /> Comprehensive Benefits</h3>
              <p>We offer competitive salaries, health insurance, 401(k) matching, and generous employee discounts.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ArrowRight size={16} className="text-primary" /> Growth Opportunities</h3>
              <p>We believe in promoting from within and provide continuous training and professional development.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ArrowRight size={16} className="text-primary" /> Work-Life Balance</h3>
              <p>Flexible scheduling and generous paid time off to ensure our team stays refreshed and inspired.</p>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-serif font-bold text-primary mb-8">Open Positions</h2>

        {loading ? (
          <Loader text="Loading Job Posts..." />
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary transition-colors shadow-sm hover:shadow-md">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-3">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full"><Briefcase size={14} /> {job.department}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                  </div>
                </div>
                <Link to={`/career/${job.id}`} className="btn btn-outline whitespace-nowrap">View Details & Apply</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
