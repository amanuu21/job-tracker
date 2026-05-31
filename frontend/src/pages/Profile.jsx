import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Grid = styled.div`display: grid; grid-template-columns: 1fr 2fr; gap: 20px; @media(max-width:900px){grid-template-columns:1fr;}`;
const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text}; margin-bottom: 24px;`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  color: white;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.glow};
  cursor: pointer;
  position: relative;

  img { width: 100%; height: 100%; object-fit: cover; }

  &:hover::after {
    content: '📷';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    border-radius: 50%;
  }
`;

const UserName = styled.h3`font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;
const UserRole = styled.p`font-size: 13px; color: ${({ theme }) => theme.colors.primary}; font-weight: 600; text-transform: capitalize;`;
const UserEmail = styled.p`font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};`;

const Form = styled.form`display: flex; flex-direction: column; gap: 16px;`;
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 12px; @media(max-width:600px){grid-template-columns:1fr;}`;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileRef = useRef();
  const [profileForm, setProfileForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/profile', profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPass(true);
    try {
      await api.put('/users/change-password', { current_password: passForm.current_password, new_password: passForm.new_password });
      toast.success('Password changed!');
      setPassForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPass(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ avatar_url: res.data.data.avatar_url });
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = `${user?.first_name?.[0]}${user?.last_name?.[0]}`.toUpperCase();

  return (
    <div>
      <Title>My Profile</Title>
      <Grid>
        <Card>
          <AvatarSection>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            <Avatar onClick={() => fileRef.current?.click()} title="Click to change avatar">
              {user?.avatar_url ? <img src={user.avatar_url} alt={initials} /> : initials}
            </Avatar>
            {uploadingAvatar && <p style={{ fontSize: 13, color: '#718096' }}>Uploading...</p>}
            <UserName>{user?.first_name} {user?.last_name}</UserName>
            <UserRole>{user?.role?.replace('_', ' ')}</UserRole>
            <UserEmail>{user?.email}</UserEmail>
          </AvatarSection>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <Form onSubmit={handleProfileSave}>
              <Row>
                <Input label="First Name" value={profileForm.first_name} onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))} required />
                <Input label="Last Name" value={profileForm.last_name} onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))} required />
              </Row>
              <Input label="Phone" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} icon="📱" />
              <Input label="Email" value={user?.email || ''} disabled icon="📧" />
              <Button type="submit" loading={savingProfile}>Save Changes</Button>
            </Form>
          </Card>

          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <Form onSubmit={handlePasswordChange}>
              <Input label="Current Password" type="password" value={passForm.current_password} onChange={e => setPassForm(p => ({ ...p, current_password: e.target.value }))} icon="🔒" required />
              <Input label="New Password" type="password" value={passForm.new_password} onChange={e => setPassForm(p => ({ ...p, new_password: e.target.value }))} icon="🔑" required />
              <Input label="Confirm New Password" type="password" value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} icon="🔑" required />
              <Button type="submit" loading={savingPass} variant="secondary">Change Password</Button>
            </Form>
          </Card>
        </div>
      </Grid>
    </div>
  );
};

export default Profile;
