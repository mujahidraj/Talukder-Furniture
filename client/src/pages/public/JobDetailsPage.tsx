import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowLeft, Send } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../components/ui/Loader';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
      } catch (err) {
        // Handle mock jobs if we hit the fallback
        if (id?.startsWith('mock')) {
           const mockJobs = [
             { id: 'mock1', title: 'Senior Interior Designer', department: 'Design', location: 'Dhaka, BD', type: 'Full-time', description: 'We are looking for a Senior Interior Designer...', requirements: '5+ years experience\nStrong portfolio', applyInstructions: 'Send your resume to careers@talukder-furniture.com' },
             { id: 'mock2', title: 'Showroom Manager', department: 'Retail', location: 'Chattogram, BD', type: 'Full-time', description: 'Manage our flagship showroom...', requirements: 'Prior retail management experience', applyInstructions: 'Send your resume to careers@talukder-furniture.com' },
             { id: 'mock3', title: 'Master Craftsman / Carpenter', department: 'Manufacturing', location: 'Gazipur, BD', type: 'Full-time', description: 'Join our factory team to build premium furniture...', requirements: 'Woodworking expertise', applyInstructions: 'Send your resume to careers@talukder-furniture.com' },
             { id: 'mock4', title: 'E-commerce Specialist', department: 'Marketing', location: 'Remote', type: 'Contract', description: 'Manage online sales channels...', requirements: 'E-commerce experience', applyInstructions: 'Send your resume to careers@talukder-furniture.com' },
           ];
           const mock = mockJobs.find(j => j.id === id);
           if (mock) {
             setJob(mock);
             return;
           }
        }
        setError('Job not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <Loader text="Loading Job Details..." />;

  if (error || !job) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Job not found'}</h2>
        <Link to="/career" className="btn btn-primary flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Careers
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        <Link to="/career" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Open Positions
        </Link>

        <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">{job.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-100">
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full font-medium"><Briefcase size={16} className="text-primary"/> {job.department || 'General'}</span>
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full font-medium"><MapPin size={16} className="text-primary"/> {job.location || 'Not Specified'}</span>
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full font-medium"><Clock size={16} className="text-primary"/> {job.type || 'Full-time'}</span>
          </div>

          <div className="prose prose-blue max-w-none">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description</h3>
            <div className="text-gray-700 whitespace-pre-wrap mb-8">
              {job.description || 'No description provided.'}
            </div>

            {job.requirements && (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                <div className="text-gray-700 whitespace-pre-wrap mb-8">
                  {job.requirements}
                </div>
              </>
            )}

            {job.applyInstructions && (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
                  <Send size={20} /> How to Apply
                </h3>
                <div className="text-blue-800 whitespace-pre-wrap">
                  {job.applyInstructions}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
