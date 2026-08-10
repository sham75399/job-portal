import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    location: searchParams.get('location') || '',
    experienceLevel: searchParams.get('experienceLevel') || ''
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobs?${params}`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    setSearchParams(params);
    fetchJobs();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Job Listings</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <input
              type="text"
              name="search"
              placeholder="Search by title or company"
              value={filters.search}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <select name="type" value={filters.type} onChange={handleFilterChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading jobs...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No jobs found matching your criteria</div>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="card" style={{ transition: 'transform 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h2 style={{ color: '#1976d2' }}>{job.title}</h2>
                  <span style={{
                    display: 'inline-block',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>{job.type}</span>
                </div>
                <p style={{ fontWeight: '600', color: '#333' }}>{job.company}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', margin: '10px 0' }}>
                  <span style={{ color: '#666' }}>{job.location}</span>
                  {job.salary && <span style={{ color: '#666' }}>{job.salary}</span>}
                  <span style={{ color: '#666' }}>{job.experienceLevel}</span>
                </div>
                <p style={{ color: '#555', margin: '10px 0 15px' }}>{job.description.substring(0, 200)}...</p>
                <Link to={`/jobs/${job._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default JobListings;