import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../api/jobs';
import './JobForm.css';

const CreateJob = () => {
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

  const MAX_DESCRIPTION_LENGTH = 1000;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Giới hạn description ở 1000 ký tự
    if (name === 'description' && value.length > MAX_DESCRIPTION_LENGTH) {
      return; // Không cho phép nhập thêm
    }
    
    setFormData({
      ...formData,
      [name]: value,
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
      await createJob(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  // Character counter logic
  const descriptionLength = formData.description.length;
  const remainingChars = MAX_DESCRIPTION_LENGTH - descriptionLength;
  const isNearLimit = remainingChars <= 100;
  const isAtLimit = remainingChars === 0;
  const counterState = isAtLimit ? 'error' : isNearLimit ? 'warning' : '';

  return (
    <div className="container">
      <div className="job-form-container">
        <h1>Post a New Job</h1>
        <p>Fill in the details below to create a new job posting</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label>
              Job Title
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Company Name
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Tech Company Inc."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Location
                <span className="required">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Ho Chi Minh City"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Job Type
                <span className="required">*</span>
              </label>
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
            <label>
              Salary
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. $50,000 - $70,000"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Application Start Date
                <span className="required">*</span>
              </label>
              <input
                type="date"
                name="applicationStartDate"
                value={formData.applicationStartDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>
                Application End Date
                <span className="required">*</span>
              </label>
              <input
                type="date"
                name="applicationEndDate"
                value={formData.applicationEndDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={`form-group has-counter ${counterState}`}>
            <label>
              Job Description
              <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job responsibilities, requirements, and benefits..."
              required
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            
            {/* Character Counter */}
            <div className={`char-count ${counterState}`}>
              {descriptionLength} / {MAX_DESCRIPTION_LENGTH} characters
              {remainingChars <= 50 && remainingChars > 0 && ` (${remainingChars} remaining)`}
              {isAtLimit && ' (Maximum reached)'}
            </div>
            
            <div className="helper-text">
              Provide detailed information about the position, responsibilities, and requirements.
            </div>
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
              {loading ? 'Creating...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;