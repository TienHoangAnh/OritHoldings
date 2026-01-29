import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUnseenApplications,
  markApplicationSeen,
  getEmployerUnseenApplications,
  markEmployerSeen,
} from '../api/applications';
import { AuthContext } from './AuthContext';
import ToastNotification from '../components/ToastNotification';

export const NotificationContext = createContext();

/**
 * Polling-based notification provider (no websocket)
 * - Poll for applicant status updates OR employer new applicants every 15s (role-based)
 * - Queue notifications and show ONE toast at a time
 * - Dedupe by (type + applicationId)
 */
export const NotificationProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, refreshUnseenCount } = useContext(AuthContext);

  const [queue, setQueue] = useState([]);
  // active item shape:
  // - applicant: { type:'applicant_status', _id, status, job }
  // - employer: { type:'employer_apply', _id, job, applicant }
  const [active, setActive] = useState(null);

  // Remember delivered notifications to avoid duplicates while app runs
  const deliveredRef = useRef(new Set());
  const pollRef = useRef(null);

  const isApplicant = user && user.role === 'applicant';
  const isEmployer = user && user.role === 'employer';

  const buildMessage = (item) => {
    if (!item) return '';
    if (item.type === 'employer_apply') {
      const applicantName = item.applicant?.name || 'Someone';
      const jobTitle = item.job?.title ? `"${item.job.title}"` : 'your job';
      return `👤 ${applicantName} applied for ${jobTitle}`;
    }

    // applicant_status
    const title = item.job?.title ? `"${item.job.title}"` : 'your job';
    if (item.status === 'accepted') return `🎉 Your application for ${title} was ACCEPTED`;
    if (item.status === 'rejected') return `❌ Your application for ${title} was REJECTED`;
    return `Update on ${title}`;
  };

  const variant =
    active?.type === 'employer_apply'
      ? 'info'
      : active?.status === 'accepted'
        ? 'success'
        : active?.status === 'rejected'
          ? 'error'
          : 'info';

  // Whenever queue changes and nothing active, show next
  useEffect(() => {
    if (!active && queue.length > 0) {
      const next = queue[0];
      setQueue((q) => q.slice(1));
      setActive(next);
    }
  }, [queue, active]);

  const pollOnce = async () => {
    try {
      let unseen = [];
      if (isApplicant) {
        const res = await getUnseenApplications();
        unseen = (res.data || []).map((x) => ({ ...x, type: 'applicant_status' }));
      } else if (isEmployer) {
        const res = await getEmployerUnseenApplications();
        unseen = (res.data || []).map((x) => ({ ...x, type: 'employer_apply' }));
      } else {
        return;
      }

      // enqueue newest first but only those not delivered yet
      const newItems = unseen.filter((item) => {
        if (!item || !item._id) return false;
        const key = `${item.type}:${item._id}`;
        return !deliveredRef.current.has(key);
      });

      if (newItems.length > 0) {
        newItems.forEach((item) => deliveredRef.current.add(`${item.type}:${item._id}`));
        setQueue((q) => [...q, ...newItems.reverse()]); // keep oldest-first display
        // keep navbar dot fresh (applicant only)
        if (isApplicant) {
          refreshUnseenCount && refreshUnseenCount();
        }
      }
    } catch (e) {
      // ignore polling errors
    }
  };

  useEffect(() => {
    // clear when logout / role changes
    if (!isApplicant && !isEmployer) {
      setQueue([]);
      setActive(null);
      deliveredRef.current = new Set();
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }

    // initial poll + interval
    pollOnce();
    pollRef.current = setInterval(pollOnce, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApplicant, isEmployer]);

  const handleClose = () => {
    setActive(null);
  };

  const handleClick = async () => {
    if (!active) return;
    if (active.type === 'employer_apply') {
      try {
        await markEmployerSeen(active._id);
      } catch (e) {
        // ignore
      } finally {
        setActive(null);
        if (active.job?._id) {
          navigate(`/jobs/${active.job._id}/applicants`);
        }
      }
      return;
    }

    // applicant_status
    try {
      await markApplicationSeen(active._id);
      refreshUnseenCount && refreshUnseenCount();
    } catch (e) {
      // ignore
    } finally {
      setActive(null);
      navigate('/my-applications');
    }
  };

  const value = useMemo(
    () => ({
      // future extension
    }),
    []
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {(isApplicant || isEmployer) && active && (
        <ToastNotification
          variant={variant}
          message={buildMessage(active)}
          durationMs={10000}
          onClick={handleClick}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
};


