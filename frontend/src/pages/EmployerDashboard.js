import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const fetchEmployerData = async () => {
    try {
      const jobsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/jobs/my-jobs`);
      setJobs(jobsResponse.data);
      
      // Fetch applications for each job
      const applicationsData = {};
      for (const job of jobsResponse.data) {
        try {
          const appsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/applications/job/${job._id}`);
          applicationsData[job._id] = appsResponse.data;
        } catch (error) {
          console.error(`Error fetching applications for job ${job._id}:`, error);
          applicationsData[job._id] = [];
        }
      }
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching employer data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, jobId, status) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/applications/${applicationId}/status`,
        { status }
      );
      
      // Update local state
      setApplications(prev => {
        const updated = { ...prev };
        if (updated[jobId]) {
          updated[jobId] = updated[jobId].map(app => 
            app._id === applicationId ? { ...app, status } : app
          );
        }
        return updated;
      });
      
      toast.success('Application status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/jobs/${jobId}`);
        setJobs(jobs.filter(job => job._id !== jobId));
        toast.success('Job deleted successfully');
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fff3e0',
      reviewed: '#e3f2fd',
      shortlisted: '#e8f5e9',
      rejected: '#ffebee',
      hired: '#e8f5e9'
    };
    return colors[status] || '#f5f5f5';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#e65100',
      reviewed: '#0d47a1',
      shortlisted: '#2e7d32',
      rejected: '#c62828',
      hired: '#1b5e20'
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1976d2' }}>Employer Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e0e0e0' }}>
        <button 
          onClick={() => setActiveTab('jobs')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            color: activeTab === 'jobs' ? '#1976d2' : '#666',
            borderBottom: activeTab === 'jobs' ? '3px solid #1976d2' : '3px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          My Jobs ({jobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            color: activeTab === 'applications' ? '#1976d2' : '#666',
            borderBottom: activeTab === 'applications' ? '3px solid #1976d2' : '3px solid transparent',
            transition: 'all 0.3s ease'
          }}
        >
          Applications
        </button>
      </div>

      {activeTab === 'jobs' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <Link to="/post-job" className="btn btn-primary">
              Post New Job
            </Link>
          </div>
          
          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p>You haven't posted any jobs yet.</p>
              <Link to="/post-job" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '15px' }}>
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {jobs.map(job => (
                <div key={job._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: '#1976d2' }}>{job.title}</h3>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      background: job.isActive ? '#e8f5e9' : '#f5f5f5',
                      color: job.isActive ? '#2e7d32' : '#666'
                    }}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ color: '#666' }}>{job.company}</p>
                  <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '0.9rem', margin: '10px 0' }}>
                    <span>Applications: {job.applications?.length || 0}</span>
                    <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary">
                      View
                    </Link>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => deleteJob(job._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div>
          {Object.keys(applications).length === 0 || !Object.values(applications).some(apps => apps.length > 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p>No applications received yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {Object.entries(applications).map(([jobId, apps]) => 
                apps.length > 0 && (
                  <div key={jobId} className="card">
                    <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>
                      {jobs.find(j => j._id === jobId)?.title || 'Job'} 
                      <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '10px' }}>
                        ({apps.length} applications)
                      </span>
                    </h3>
                    {apps.map(app => (
                      <div key={app._id} style={{
                        padding: '15px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        background: '#fafafa'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            {/* Candidate Name */}
                            <h4 style={{ color: '#333', fontSize: '1.1rem', marginBottom: '5px' }}>
                              {app.applicant?.name || 'Unknown Candidate'}
                            </h4>
                            
                            {/* Candidate Details Grid */}
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '8px 20px',
                              marginTop: '10px',
                              padding: '10px',
                              background: 'white',
                              borderRadius: '5px',
                              border: '1px solid #eee'
                            }}>
                              <div>
                                <span style={{ fontWeight: '600', color: '#555' }}>Email:</span>
                                <span style={{ marginLeft: '5px', color: '#333' }}>
                                  {app.applicant?.email || 'Not provided'}
                                </span>
                              </div>
                              <div>
                                <span style={{ fontWeight: '600', color: '#555' }}>Phone:</span>
                                <span style={{ marginLeft: '5px', color: '#333' }}>
                                  {app.applicant?.phone || 'Not provided'}
                                </span>
                              </div>
                              <div>
                                <span style={{ fontWeight: '600', color: '#555' }}>Location:</span>
                                <span style={{ marginLeft: '5px', color: '#333' }}>
                                  {app.applicant?.location || 'Not provided'}
                                </span>
                              </div>
                              <div>
                                <span style={{ fontWeight: '600', color: '#555' }}>Skills:</span>
                                <span style={{ marginLeft: '5px', color: '#333' }}>
                                  {app.applicant?.skills?.length > 0 
                                    ? app.applicant.skills.join(', ') 
                                    : 'Not specified'}
                                </span>
                              </div>
                              {app.applicant?.bio && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <span style={{ fontWeight: '600', color: '#555' }}>Bio:</span>
                                  <span style={{ marginLeft: '5px', color: '#333', display: 'block', marginTop: '3px' }}>
                                    {app.applicant.bio}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Cover Letter */}
                            {app.coverLetter && (
                              <div style={{ marginTop: '10px' }}>
                                <span style={{ fontWeight: '600', color: '#555' }}>Cover Letter:</span>
                                <p style={{ 
                                  color: '#333', 
                                  marginTop: '3px',
                                  padding: '10px',
                                  background: 'white',
                                  borderRadius: '5px',
                                  border: '1px solid #eee',
                                  fontSize: '0.95rem',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {app.coverLetter}
                                </p>
                              </div>
                            )}

                            {/* Application Date */}
                            <div style={{ marginTop: '10px', color: '#999', fontSize: '0.85rem' }}>
                              Applied: {new Date(app.appliedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'flex-end',
                            gap: '10px',
                            minWidth: '150px'
                          }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              background: getStatusColor(app.status),
                              color: getStatusTextColor(app.status),
                              textTransform: 'capitalize'
                            }}>
                              {app.status}
                            </span>
                            
                            <select 
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app._id, jobId, e.target.value)}
                              style={{
                                padding: '5px 10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px',
                                width: '100%'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                            
                            {app.resume && (
                              <a 
                                href={`http://localhost:5000/${app.resume}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  padding: '5px 15px',
                                  background: '#1976d2',
                                  color: 'white',
                                  textDecoration: 'none',
                                  borderRadius: '5px',
                                  fontSize: '0.9rem',
                                  textAlign: 'center',
                                  width: '100%'
                                }}
                              >
                                View Resume
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;