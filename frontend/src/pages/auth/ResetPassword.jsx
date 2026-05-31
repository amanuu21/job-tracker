import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.bg};
  padding: 24px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.bgCard};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 40px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Icon = styled.div`font-size: 48px; text-align: center; margin-bottom: 16px;`;
const Title = styled.h2`font-size: 24px; font-weight: 700; color: ${({ theme }) => theme.colors.text}; text-align: center; margin-bottom: 8px;`;
const Subtitle = styled.p`color: ${({ theme }) => theme.colors.textSecondary}; text-align: center; margin-bottom: 28px; font-size: 14px;`;

const ResetPassword = () => {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page><Card>
      <Icon>🔐</Icon>
      <Title>Set new password</Title>
      <Subtitle>Choose a strong password for your account.</Subtitle>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="New password" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} icon="🔒" required />
        <Input label="Confirm password" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} icon="🔒" required />
        <Button type="submit" loading={loading} fullWidth>Reset Password</Button>
      </form>
      <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 14, color: '#667eea' }}>← Back to login</Link>
    </Card></Page>
  );
};

export default ResetPassword;
