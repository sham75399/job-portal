import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CandidateDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    skills: []
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'candidate') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      // Fetch applications
      const appsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/applications/my-applications`);
      setApplications(appsResponse.data);
      
      // Fetch profile
      const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/auth/profile`);
      setProfile(profileResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 403) {
        toast.error('Please login as a candidate to view this page');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/auth/profile`, profile);
      setProfile(data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      setProfile(prev => ({ ...prev, skills: value.split(',').map(s => s.trim()) }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <h2>Please Login</h2>
        <p>You need to be logged in to view this page.</p>
      </div>
    );
  }

  if (user?.role !== 'candidate') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This page is only for candidates.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1976d2' }}>Candidate Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Profile Card */}
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '1.3rem' }}>Profile</h2>
          {editing ? (
            <form onSubmit={updateProfile}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={profile.phone || ''} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={profile.location || ''} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={profile.bio || ''} onChange={handleProfileChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input type="text" name="skills" value={profile.skills?.join(', ') || ''} onChange={handleProfileChange} />
              </div>
              <button type="submit" className="btn btn-primary">Save Profile</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} style={{ marginLeft: '10px' }}>
                Cancel
              </button>
            </form>
          ) : (
            <div>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
              <p><strong>Location:</strong> {profile.location || 'Not set'}</p>
              <p><strong>Bio:</strong> {profile.bio || 'Not set'}</p>
              <p><strong>Skills:</strong> {profile.skills?.join(', ') || 'None'}</p>
              <button className="btn btn-primary" onClick={() => setEditing(true)} style={{ marginTop: '10px' }}>
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Applications Card */}
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '1.3rem' }}>
            My Applications ({applications.length})
          </h2>
          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p>You haven't applied to any jobs yet.</p>
              <a href="/jobs" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '15px' }}>
                Browse Jobs
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {applications.map(app => (
                <div key={app._id} style={{ 
                  padding: '15px', 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '8px',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: '#1976d2', marginBottom: '5px' }}>{app.job?.title}</h3>
                    <span className={`status ${app.status}`} style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      background: app.status === 'pending' ? '#fff3e0' : 
                                 app.status === 'reviewed' ? '#e3f2fd' :
                                 app.status === 'shortlisted' ? '#e8f5e9' :
                                 app.status === 'rejected' ? '#ffebee' : '#e8f5e9',
                      color: app.status === 'pending' ? '#e65100' :
                             app.status === 'reviewed' ? '#0d47a1' :
                             app.status === 'shortlisted' ? '#2e7d32' :
                             app.status === 'rejected' ? '#c62828' : '#1b5e20'
                    }}>
                      {app.status}
                    </span>
                  </div>
                  <p style={{ color: '#666' }}>{app.job?.company}</p>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>{app.job?.location}</p>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '5px' }}>
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;