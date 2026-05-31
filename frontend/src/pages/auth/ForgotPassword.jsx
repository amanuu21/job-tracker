import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
const BackLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  &:hover { text-decoration: underline; }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <Page><Card>
      <Icon>📬</Icon>
      <Title>Check your email</Title>
      <Subtitle>We sent a password reset link to <strong>{email}</strong>. Check your inbox and spam folder.</Subtitle>
      <BackLink to="/login">← Back to login</BackLink>
    </Card></Page>
  );

  return (
    <Page><Card>
      <Icon>🔑</Icon>
      <Title>Forgot password?</Title>
      <Subtitle>Enter your email and we'll send you a reset link.</Subtitle>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} icon="📧" required />
        <Button type="submit" loading={loading} fullWidth>Send Reset Link</Button>
      </form>
      <BackLink to="/login">← Back to login</BackLink>
    </Card></Page>
  );
};

export default ForgotPassword;
