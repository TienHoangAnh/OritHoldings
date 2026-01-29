import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobs, reopenJob } from '../api/jobs';
import { deleteJob } from '../api/jobs';
import './Dashboard.css';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // active | expired
  const [repostingJob, setRepostingJob] = useState(null);
  const [repostDates, setRepostDates] = useState({ start: '', end: '' });
  const [repostLoading, setRepostLoading] = useState(false);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const response = await getMyJobs(true);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    setDeleting(jobId);
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeleting(null);
    }
  };

  const openRepostModal = (job) => {
    setRepostingJob(job);
    setRepostDates({
      start: '',
      end: '',
    });
  };

  const closeRepostModal = () => {
    setRepostingJob(null);
    setRepostDates({ start: '', end: '' });
  };

  const handleRepost = async (e) => {
    e.preventDefault();
    if (!repostingJob) return;
    if (!repostDates.start || !repostDates.end) return;
    if (new Date(repostDates.start) > new Date(repostDates.end)) {
      alert('Start date must be before end date');
      return;
    }

    setRepostLoading(true);
    try {
      await reopenJob(repostingJob._id, repostDates.start, repostDates.end);
      closeRepostModal();
      await fetchMyJobs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to repost job');
    } finally {
      setRepostLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const now = new Date();
  const activeJobs = jobs.filter((j) => (j.applicationEndDate ? new Date(j.applicationEndDate) >= now : true));
  const expiredJobs = jobs.filter((j) => (j.applicationEndDate ? new Date(j.applicationEndDate) < now : false));
  const visibleJobs = activeTab === 'active' ? activeJobs : expiredJobs;

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>My Jobs Dashboard</h1>
        <Link to="/jobs/create" className="btn-create-job">
          Post New Job
        </Link>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Jobs ({activeJobs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'expired' ? 'active' : ''}`}
          onClick={() => setActiveTab('expired')}
        >
          Expired Jobs ({expiredJobs.length})
        </button>
      </div>

      {visibleJobs.length === 0 ? (
        <div className="no-jobs">
          <p>
            {activeTab === 'active'
              ? "You don't have any active jobs."
              : "You don't have any expired jobs yet."}
          </p>
          {activeTab === 'active' && (
            <Link to="/jobs/create" className="btn-create-job">
              Post Your First Job
            </Link>
          )}
        </div>
      ) : (
        <div className="dashboard-jobs">
          {visibleJobs.map((job) => (
            <div key={job._id} className="dashboard-job-card">
              <div className="dashboard-job-header">
                <div>
                  <h3>{job.title}</h3>
                  <div className="dashboard-job-meta">
                    <span>{job.company}</span>
                    <span>|</span>
                    <span>{job.location}</span>
                    <span>|</span>
                    <span className="job-type-badge">{job.type}</span>
                    {job.applicationEndDate && (
                      <>
                        <span className="job-deadline">
                          Apply until: {new Date(job.applicationEndDate).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="dashboard-job-actions">
                  <Link
                    to={`/jobs/${job._id}/applicants`}
                    className="btn-applicants"
                  >
                    View Applicants ({job.applicationsCount || 0})
                  </Link>
                  {activeTab === 'expired' ? (
                    <button
                      onClick={() => openRepostModal(job)}
                      className="btn-repost"
                    >
                      Repost Job
                    </button>
                  ) : (
                    <Link to={`/jobs/edit/${job._id}`} className="btn-edit">
                      Edit
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="btn-delete"
                    disabled={deleting === job._id}
                  >
                    {deleting === job._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              <div className="dashboard-job-description">
                {job.description.substring(0, 200)}...
              </div>
              <Link to={`/jobs/${job._id}`} className="dashboard-job-link">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {repostingJob && (
        <div className="modal-backdrop" onClick={closeRepostModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Repost Job</h2>
            <p className="modal-subtitle">{repostingJob.title}</p>
            <form onSubmit={handleRepost} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>New Start Date</label>
                  <input
                    type="date"
                    value={repostDates.start}
                    onChange={(e) =>
                      setRepostDates((s) => ({ ...s, start: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New End Date</label>
                  <input
                    type="date"
                    value={repostDates.end}
                    onChange={(e) =>
                      setRepostDates((s) => ({ ...s, end: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeRepostModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={repostLoading}>
                  {repostLoading ? 'Reposting...' : 'Repost'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

