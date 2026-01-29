import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../api/applications';
import { AuthContext } from '../context/AuthContext';
import './Applications.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | accepted | rejected
  const { refreshUnseenCount } = useContext(AuthContext);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await getMyApplications();
      // Prefer unread first, then newest first
      const sorted = [...response.data].sort((a, b) => {
        const aUnseen = a.status !== 'pending' && a.isSeenByApplicant === false ? 0 : 1;
        const bUnseen = b.status !== 'pending' && b.isSeenByApplicant === false ? 0 : 1;
        if (aUnseen !== bUnseen) return aUnseen - bUnseen;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setApplications(sorted);
      // Backend auto-marks as seen on /my, so refresh navbar dot
      if (refreshUnseenCount) {
        refreshUnseenCount();
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshUnseenCount]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusLabel = (status) => {
    if (status === 'accepted') return 'ACCEPTED';
    if (status === 'rejected') return 'REJECTED';
    return 'PENDING';
  };

  const getStatusClass = (status) => {
    if (status === 'accepted') return 'app-status-badge accepted';
    if (status === 'rejected') return 'app-status-badge rejected';
    return 'app-status-badge pending';
  };

  // Derived counts per status (for labels)
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  // Filtered list based on current statusFilter
  const filteredApplications = applications.filter((application) => {
    if (statusFilter === 'all') return true;
    return application.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>You have applied for {applications.length} job(s)</p>
      </div>

      {applications.length > 0 && (
        <div className="applications-filters">
          <button
            className={`app-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({applications.length})
          </button>
          <button
            className={`app-filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`app-filter-btn ${statusFilter === 'accepted' ? 'active' : ''}`}
            onClick={() => setStatusFilter('accepted')}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            className={`app-filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="no-applications">
          <p>You haven't applied for any jobs yet.</p>
          <Link to="/jobs" className="btn-browse">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <>
          {filteredApplications.length === 0 ? (
            <div className="no-applications status-empty">
              <p>No applications with this status.</p>
            </div>
          ) : (
            <div className="applications-list">
              {filteredApplications.map((application) => (
                <div key={application._id} className="application-card">
                  <div className="application-header">
                    <div>
                      <h3>Position: {application.job.title}</h3>
                      <div className="application-company">
                        Company: {application.job.company}
                      </div>
                      <div className="application-status-row">
                        <span className={getStatusClass(application.status)}>
                          {getStatusLabel(application.status)}
                        </span>
                      </div>
                      <div className="application-meta">
                        <span>{application.job.location}</span>
                        <span>|</span>
                        <span>{application.job.type}</span>
                        <span>|</span>
                        <span>${application.job.salary}</span>
                      </div>
                    </div>
                    <Link
                      to={`/jobs/${application.job._id}`}
                      className="btn-view-job"
                    >
                      View Job
                    </Link>
                  </div>
                  <div className="application-cover-letter">
                    <h4>Cover Letter: {application.coverLetter}</h4>
                  </div>
                  <div className="application-date">
                    Applied on:{' '}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                  {application.status !== 'pending' && application.statusUpdatedAt && (
                    <div
                      className={`application-result-date ${application.status === 'accepted' ? 'accepted' : 'rejected'}`}
                    >
                      Result updated on:{' '}
                      {new Date(application.statusUpdatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Applications;  