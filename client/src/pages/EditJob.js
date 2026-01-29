import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, updateJob } from '../api/jobs';
import './JobForm.css';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    applicationStartDate: '',
    applicationEndDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchJob = useCallback(async () => {
    try {
      const response = await getJob(id);
      const job = response.data;
      setFormData({
        title: job.title,
        description: job.description,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        applicationStartDate: job.applicationStartDate
          ? new Date(job.applicationStartDate).toISOString().slice(0, 10)
          : '',
        applicationEndDate: job.applicationEndDate
          ? new Date(job.applicationEndDate).toISOString().slice(0, 10)
          : '',
      });
    } catch (error) {
      setError('Failed to load job');
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (
      !formData.title ||
      !formData.description ||
      !formData.company ||
      !formData.location ||
      !formData.salary ||
      !formData.applicationStartDate ||
      !formData.applicationEndDate
    ) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (new Date(formData.applicationStartDate) > new Date(formData.applicationEndDate)) {
      setError('Application start date must be before end date');
      setLoading(false);
      return;
    }

    try {
      await updateJob(id, formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container">
        <div className="loading">Loading job...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="job-form-container">
        <h1>Edit Job</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Job Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Salary *</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Application Start Date *</label>
              <input
                type="date"
                name="applicationStartDate"
                value={formData.applicationStartDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Application End Date *</label>
              <input
                type="date"
                name="applicationEndDate"
                value={formData.applicationEndDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="10"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;

