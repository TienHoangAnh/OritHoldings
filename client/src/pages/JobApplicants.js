import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../api/applications';
import { getJob } from '../api/jobs';
import './JobApplicants.css';

const JobApplicants = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [applicationsRes, jobRes] = await Promise.all([
        getJobApplications(id),
        getJob(id),
      ]);
      setApplications(applicationsRes.data);
      setJob(jobRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusLabel = (status) => {
    if (status === 'accepted') return 'Accepted';
    if (status === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const getStatusClass = (status) => {
    if (status === 'accepted') return 'status-badge accepted';
    if (status === 'rejected') return 'status-badge rejected';
    return 'status-badge pending';
  };

  const handleUpdateStatus = async (applicationId, nextStatus) => {
    // Confirm trước khi reject
    if (nextStatus === 'rejected') {
      const ok = window.confirm('Reject this applicant? This action cannot be changed.');
      if (!ok) return;
    }

    // Optimistic UI: update local state ngay
    const prevApplications = applications;
    setApplications((current) =>
      current.map((a) =>
        a._id === applicationId ? { ...a, status: nextStatus } : a
      )
    );
    setUpdatingId(applicationId);

    try {
      await updateApplicationStatus(applicationId, nextStatus);
    } catch (error) {
      // Rollback nếu fail
      setApplications(prevApplications);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading applicants...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="applicants-header">
        <div>
          <h1>Applicants for "{job?.title}"</h1>
          <p className="applicants-count">
            {applications.length} applicant(s) applied
          </p>
        </div>
        <Link to="/dashboard" className="btn-back">
          ← Back to Dashboard
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="no-applicants">
          <p>No applicants yet for this job.</p>
          <Link to="/dashboard" className="btn-back">
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <div className="applicants-list">
          {applications.map((application) => (
            <div key={application._id} className="applicant-card">
              <div className="applicant-header">
                <div>
                  <Link
                    to={`/profile/${application.applicant._id}`}
                    className="applicant-name-link"
                  >
                    <h3>{application.applicant.name}</h3>
                  </Link>
                  <div className="applicant-email">
                    {application.applicant.email}
                  </div>
                </div>
                <div className="applicant-date">
                  Applied on:{' '}
                  {new Date(application.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="applicant-cover-letter">
                <h4>Cover Letter:</h4>
                <p>{application.coverLetter}</p>
              </div>
              <div className="applicant-actions">
                <Link
                  to={`/profile/${application.applicant._id}`}
                  className="btn-view-profile"
                >
                  View Profile →
                </Link>
                <div className="application-status">
                  {application.status === 'pending' ? (
                    <div className="status-actions">
                      <button
                        className="btn-accept"
                        onClick={() => handleUpdateStatus(application._id, 'accepted')}
                        disabled={updatingId === application._id}
                      >
                        {updatingId === application._id ? 'Updating...' : 'Accept'}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleUpdateStatus(application._id, 'rejected')}
                        disabled={updatingId === application._id}
                      >
                        {updatingId === application._id ? 'Updating...' : 'Reject'}
                      </button>
                    </div>
                  ) : (
                    <span className={getStatusClass(application.status)}>
                      {getStatusLabel(application.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicants;

