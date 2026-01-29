import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile } from '../api/users';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getUserProfile(id);
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="error-message">Profile not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === profile.id;
  const hasFullProfile = profile.profile && profile.profile.bio;

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.profile?.avatar ? (
              <img src={profile.profile.avatar} alt={profile.name} />
            ) : (
              <div className="avatar-placeholder">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{profile.name}</h1>
            {profile.email && <p className="profile-email">{profile.email}</p>}
            {profile.role === 'applicant' && (
              <span className="profile-role">Job Seeker</span>
            )}
          </div>
          {isOwnProfile && (
            <Link to="/profile/edit" className="btn-edit-profile">
              Edit Profile
            </Link>
          )}
        </div>

        {hasFullProfile ? (
          <div className="profile-content">
            {profile.profile.bio && (
              <div className="profile-section">
                <h2>About</h2>
                <p>{profile.profile.bio}</p>
              </div>
            )}

            {profile.profile.skills && profile.profile.skills.length > 0 && (
              <div className="profile-section">
                <h2>Skills</h2>
                <div className="skills-list">
                  {profile.profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.profile.experience && (
              <div className="profile-section">
                <h2>Experience</h2>
                <p className="profile-text">{profile.profile.experience}</p>
              </div>
            )}

            {profile.profile.education && (
              <div className="profile-section">
                <h2>Education</h2>
                <p className="profile-text">{profile.profile.education}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-empty">
            {isOwnProfile ? (
              <>
                <p>You haven't set up your profile yet.</p>
                <Link to="/profile/edit" className="btn-setup-profile">
                  Set Up Profile
                </Link>
              </>
            ) : (
              <p>This user hasn't set up their profile yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

