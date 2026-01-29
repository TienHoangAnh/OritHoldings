import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob } from '../api/jobs';
import { createApplication } from '../api/applications';
import { AuthContext } from '../context/AuthContext';
import './JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const response = await getJob(id);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!coverLetter.trim()) {
      setError('Please provide a cover letter');
      return;
    }

    setSubmitting(true);
    try {
      await createApplication(id, coverLetter);
      setSuccess('Application submitted successfully!');
      setCoverLetter('');
      setShowApplyForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container">
        <div className="error-message">Job not found</div>
      </div>
    );
  }

  const isOwner = user && user.id === job.createdBy._id;
  const isApplicant = user && user.role === 'applicant';
  const isOpen = job.isOpen === true;

  return (
    <div className="container">
      <div className="job-detail">
        <div className="job-detail-header">
          <div>
            <h1>{job.title}</h1>
            <div className="job-meta">
              <span className="job-company">{job.company}</span>
              <span className="job-location">{job.location}</span>
              <span className="job-type">{job.type}</span>
            </div>
            <div className="job-salary">{job.salary}</div>
            <div className="job-apply-info">
              <span className={`job-open-badge ${isOpen ? 'open' : 'closed'}`}>
                {isOpen ? 'OPEN' : 'CLOSED'}
              </span>
              {job.applicationEndDate && (
                <span className="job-deadline">
                  Apply until: {new Date(job.applicationEndDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="job-actions">
              <Link to={`/jobs/edit/${job._id}`} className="btn-edit">
                Edit Job
              </Link>
              <Link to={`/jobs/${job._id}/applicants`} className="btn-applicants">
                View Applicants
              </Link>
            </div>
          )}
        </div>

        <div className="job-description">
          <h2>Job Description</h2>
          <p>{job.description}</p>
        </div>

        {user && isApplicant && !isOwner && (
          <div className="apply-section">
            {!showApplyForm ? (
              <button
                onClick={() => setShowApplyForm(true)}
                className="btn-apply"
                disabled={!isOpen}
              >
                {isOpen ? 'Apply for this Job' : 'Applications Closed'}
              </button>
            ) : (
              <form onSubmit={handleApply} className="apply-form">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <div className="form-group">
                  <label>Cover Letter</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows="6"
                    placeholder="Tell us why you're a good fit for this position..."
                    required
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyForm(false);
                      setCoverLetter('');
                      setError('');
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!user && (
          <div className="login-prompt">
            <p>Please login to apply for this job</p>
            <Link to="/login" className="btn-login">
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;

