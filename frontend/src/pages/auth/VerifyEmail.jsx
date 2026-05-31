import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.bg};
  padding: 24px;
`;

const Card = styled.div`
  text-align: center;
  background: ${({ theme }) => theme.colors.bgCard};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 48px 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Icon = styled.div`font-size: 64px; margin-bottom: 16px;`;
const Title = styled.h2`font-size: 24px; font-weight: 700; color: ${({ theme }) => theme.colors.text}; margin-bottom: 8px;`;
const Text = styled.p`color: ${({ theme }) => theme.colors.textSecondary}; margin-bottom: 24px;`;
const StyledLink = styled(Link)`
  display: inline-block;
  padding: 12px 28px;
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  text-decoration: none;
`;

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const token = params.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') return (
    <Page><Card><Icon>⏳</Icon><Title>Verifying...</Title><Text>Please wait while we verify your email.</Text></Card></Page>
  );

  if (status === 'success') return (
    <Page><Card>
      <Icon>✅</Icon>
      <Title>Email Verified!</Title>
      <Text>Your account is now active. You can sign in.</Text>
      <StyledLink to="/login">Go to Login</StyledLink>
    </Card></Page>
  );

  return (
    <Page><Card>
      <Icon>❌</Icon>
      <Title>Verification Failed</Title>
      <Text>The link is invalid or has expired. Please register again.</Text>
      <StyledLink to="/register">Register Again</StyledLink>
    </Card></Page>
  );
};

export default VerifyEmail;
