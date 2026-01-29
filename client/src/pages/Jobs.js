import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../api/jobs';
import useDebounce from '../hooks/useDebounce';
import { AuthContext } from '../context/AuthContext';
import './Jobs.css';

const Jobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // Chỉ cho lần đầu load
  const [searching, setSearching] = useState(false); // Loading khi đang search (không block UI)
  
  // Tách search và location ra để debounce riêng
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [type, setType] = useState('');
  
  // Debounce search và location với delay 500ms để user có thời gian gõ
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedLocation = useDebounce(locationInput, 500);

  // Fetch jobs khi debounced values hoặc type thay đổi
  useEffect(() => {
    fetchJobs({
      search: debouncedSearch,
      location: debouncedLocation,
      type: type,
      includeApplicationStatus: user && user.role === 'applicant',
    });
  }, [debouncedSearch, debouncedLocation, type, user]);

  const fetchJobs = async (filters) => {
    // Chỉ set searching = true nếu không phải lần đầu load
    if (!initialLoading) {
      setSearching(true);
    }
    try {
      const response = await getJobs(filters);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setInitialLoading(false);
      setSearching(false);
    }
  };

  const getAppliedLabel = (status) => {
    if (!status) return null;
    if (status === 'pending') return 'PENDING';
    if (status === 'accepted') return 'ACCEPTED';
    if (status === 'rejected') return 'REJECTED';
    return 'APPLIED';
  };

  // Handle search input change - không trigger fetch ngay
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handle location input change - không trigger fetch ngay
  const handleLocationChange = (e) => {
    setLocationInput(e.target.value);
  };

  // Handle type change - fetch ngay vì là select
  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  // Prevent form submission
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  // Chỉ show loading full page cho lần đầu
  if (initialLoading) {
    return (
      <div className="container">
        <div className="loading">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="jobs-header">
        <h1>Find Your Dream Job</h1>
        <form className="filters" onSubmit={handleSubmit}>
          <input
            type="text"
            name="search"
            placeholder="Search jobs..."
            value={searchInput}
            onChange={handleSearchChange}
            className="filter-input"
            autoComplete="off"
          />
          <select
            name="type"
            value={type}
            onChange={handleTypeChange}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
          </select>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={locationInput}
            onChange={handleLocationChange}
            className="filter-input"
            autoComplete="off"
          />
        </form>
        {/* Loading indicator nhỏ khi đang search, không block input */}
        {searching && (
          <div className="search-loading-indicator">
            <span>🔍 Searching...</span>
          </div>
        )}
      </div>

      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <div className="no-jobs">No jobs found</div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="job-card">
              {job.applicationStatus && (
                <span className={`job-applied-badge ${job.applicationStatus}`}>
                  {getAppliedLabel(job.applicationStatus)}
                </span>
              )}
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="job-type">{job.type}</span>
                <span className={`job-open-badge ${job.isOpen ? 'open' : 'closed'}`}>
                  {job.isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <div className="job-company">Conpany: {job.company}</div>
              <div className="job-location">Location: {job.location}</div>
              <div className="job-salary">Salary: ${job.salary}</div>
              <p className="job-description">
                {job.description.substring(0, 150)}...
              </p>
              <Link to={`/jobs/${job._id}`} className="job-link">
                Click to View Details
              </Link>
              <div className="job-apply-window">
                {job.applicationEndDate && (
                  <span className="job-deadline">
                    Apply until: {new Date(job.applicationEndDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;

