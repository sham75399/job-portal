import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState({ coverLetter: '', resume: null });

  const fetchJob = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Job not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }
    if (user?.role !== 'candidate') {
      toast.error('Only candidates can apply');
      return;
    }
    try {
      setApplying(true);
      const formData = new FormData();
      formData.append('coverLetter', application.coverLetter);
      if (application.resume) {
        formData.append('resume', application.resume);
      }
      await axios.post(`${process.env.REACT_APP_API_URL}/applications/${id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Application submitted successfully!');
      setApplication({ coverLetter: '', resume: null });
      // Refresh job data to update application count
      fetchJob();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
        return;
      }
      setApplication(prev => ({ ...prev, resume: file }));
    }
  };

  if (loading) return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      Loading job details...
    </div>
  );
  
  if (!job) return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <h2>Job not found</h2>
      <p>The job you're looking for doesn't exist or has been removed.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        {/* Main Content */}
        <div>
          {/* Job Title */}
          <h1 style={{ fontSize: '2.5rem', color: '#1976d2', marginBottom: '5px' }}>{job.title}</h1>
          
          {/* Company Name */}
          <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px', fontWeight: '500' }}>
            {job.company}
          </h2>
          
          {/* Job Meta Information */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '15px', 
            marginBottom: '30px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              padding: '5px 15px', 
              background: 'white', 
              borderRadius: '20px', 
              fontSize: '0.95rem',
              color: '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              📍 {job.location}
            </span>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              padding: '5px 15px', 
              background: 'white', 
              borderRadius: '20px', 
              fontSize: '0.95rem',
              color: '#1976d2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              💼 {job.type}
            </span>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              padding: '5px 15px', 
              background: 'white', 
              borderRadius: '20px', 
              fontSize: '0.95rem',
              color: '#ff6b35',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              📊 {job.experienceLevel}
            </span>
            {job.salary && (
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                padding: '5px 15px', 
                background: 'white', 
                borderRadius: '20px', 
                fontSize: '0.95rem',
                color: '#2e7d32',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                💰 {job.salary}
              </span>
            )}
          </div>

          {/* Description Section */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: '#333', 
              marginBottom: '15px', 
              fontSize: '1.3rem',
              borderBottom: '2px solid #1976d2',
              paddingBottom: '10px'
            }}>
              📝 Description
            </h3>
            <p style={{ 
              color: '#555', 
              lineHeight: '1.8',
              fontSize: '1.05rem',
              whiteSpace: 'pre-wrap'
            }}>
              {job.description}
            </p>
          </div>

          {/* Requirements Section */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: '#333', 
              marginBottom: '15px', 
              fontSize: '1.3rem',
              borderBottom: '2px solid #1976d2',
              paddingBottom: '10px'
            }}>
              🎯 Requirements
            </h3>
            <p style={{ 
              color: '#555', 
              lineHeight: '1.8',
              fontSize: '1.05rem',
              whiteSpace: 'pre-wrap'
            }}>
              {job.requirements}
            </p>
          </div>

          {/* Responsibilities Section */}
          {job.responsibilities && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '15px', 
                fontSize: '1.3rem',
                borderBottom: '2px solid #1976d2',
                paddingBottom: '10px'
              }}>
                ✅ Responsibilities
              </h3>
              <p style={{ 
                color: '#555', 
                lineHeight: '1.8',
                fontSize: '1.05rem',
                whiteSpace: 'pre-wrap'
              }}>
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div style={{ 
            marginTop: '30px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            <p>📅 Posted: {new Date(job.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p>🏢 Company: {job.company}</p>
            <p>📋 Category: {job.category}</p>
            <p>📊 Applications: {job.applications?.length || 0}</p>
          </div>
        </div>

        {/* Sidebar - Apply Section */}
        <div>
          {isAuthenticated && user?.role === 'candidate' ? (
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ 
                marginBottom: '20px', 
                color: '#1976d2',
                fontSize: '1.5rem',
                borderBottom: '2px solid #1976d2',
                paddingBottom: '10px'
              }}>
                📝 Apply Now
              </h3>
              <form onSubmit={handleApply}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>
                    Cover Letter
                  </label>
                  <textarea
                    value={application.coverLetter}
                    onChange={(e) => setApplication(prev => ({ ...prev, coverLetter: e.target.value }))}
                    placeholder="Tell us why you're a good fit for this position..."
                    rows="5"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>
                    Resume
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    Accepted formats: PDF, DOC, DOCX, TXT (Max 5MB)
                  </small>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={applying}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    fontSize: '1.1rem',
                    marginTop: '10px'
                  }}
                >
                  {applying ? '⏳ Submitting...' : '📤 Apply Now'}
                </button>
              </form>
            </div>
          ) : isAuthenticated && user?.role === 'employer' ? (
            <div className="card">
              <h3 style={{ marginBottom: '15px', color: '#333' }}>👀 You're viewing as Employer</h3>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                You cannot apply for jobs as an employer. Switch to a candidate account to apply.
              </p>
              <button 
                onClick={() => navigate('/candidate-dashboard')} 
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Go to Candidate Dashboard
              </button>
            </div>
          ) : (
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ 
                marginBottom: '15px', 
                color: '#1976d2',
                fontSize: '1.3rem'
              }}>
                🔑 Ready to Apply?
              </h3>
              <p style={{ marginBottom: '15px', color: '#666', lineHeight: '1.6' }}>
                Please login or register as a candidate to apply for this job.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={() => navigate('/login')} 
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Register as Candidate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;