import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateProfile } from '../api/users';
import { AuthContext } from '../context/AuthContext';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    avatar: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCurrentProfile = useCallback(async () => {
    try {
      const response = await getUserProfile(user.id);
      const profile = response.data.profile || {};
      setFormData({
        avatar: profile.avatar || '',
        bio: profile.bio || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        experience: profile.experience || '',
        education: profile.education || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchCurrentProfile();
  }, [fetchCurrentProfile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Convert skills string to array
      const skillsArray = formData.skills
        ? formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
        : [];

      await updateProfile({
        avatar: formData.avatar,
        bio: formData.bio,
        skills: skillsArray,
        experience: formData.experience,
        education: formData.education,
      });

      navigate(`/profile/${user.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="edit-profile-container">
        <h1>Edit Profile</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Avatar URL</label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
            />
            {formData.avatar && (
              <div className="avatar-preview">
                <img src={formData.avatar} alt="Avatar preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="5"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="JavaScript, React, Node.js"
            />
            <small>Separate skills with commas</small>
          </div>

          <div className="form-group">
            <label>Experience</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="6"
              placeholder="Describe your work experience..."
            />
          </div>

          <div className="form-group">
            <label>Education</label>
            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              rows="4"
              placeholder="Your educational background..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/profile/${user.id}`)}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;

