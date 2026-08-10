import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobs?limit=6`);
      setFeaturedJobs(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Find Your Dream Job</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
            Discover thousands of job opportunities from top companies
          </p>
          <Link to="/jobs" style={{
            padding: '15px 40px',
            backgroundColor: 'white',
            color: '#1976d2',
            textDecoration: 'none',
            borderRadius: '5px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            Browse Jobs
          </Link>
        </div>
      </div>

      {/* Featured Jobs */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem' }}>Featured Jobs</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading featured jobs...</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {featuredJobs.map(job => (
              <div key={job._id} style={{
                background: 'white',
                borderRadius: '8px',
                padding: '25px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease'
              }}>
                <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>{job.title}</h3>
                <p style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>{job.company}</p>
                <p style={{ color: '#666', marginBottom: '5px' }}>{job.location}</p>
                <span style={{
                  display: 'inline-block',
                  background: '#e3f2fd',
                  color: '#1976d2',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  marginBottom: '15px'
                }}>{job.type}</span>
                <br />
                <Link to={`/jobs/${job._id}`} style={{
                  padding: '10px 20px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  display: 'inline-block'
                }}>
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div style={{
        background: '#f5f7fa',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Are you an Employer?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#666' }}>
            Post your job openings and find the perfect candidates
          </p>
          <Link to="/register" style={{
            padding: '15px 40px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontSize: '1.2rem',
            display: 'inline-block'
          }}>
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;