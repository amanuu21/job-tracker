import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
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
  padding: 40px 24px;
`;

const Card = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.bgCard};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 40px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const LogoArea = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LogoIcon = styled.div`
  font-size: 40px;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-top: 4px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const LoginLink = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 16px;

  a { color: ${({ theme }) => theme.colors.primary}; font-weight: 600; }
  a:hover { text-decoration: underline; }
`;

const PasswordHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: -8px;
`;

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <Page>
      <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <LogoArea>
          <LogoIcon>🎯</LogoIcon>
          <Title>Create your account</Title>
          <Subtitle>Join JobTracker and start your journey</Subtitle>
        </LogoArea>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Input label="First name" type="text" placeholder="John" value={form.first_name} onChange={set('first_name')} required />
            <Input label="Last name" type="text" placeholder="Doe" value={form.last_name} onChange={set('last_name')} required />
          </Row>
          <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} icon="📧" required />
          <Input label="Phone (optional)" type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} icon="📱" />
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={set('password')}
            icon="🔒"
            rightIcon={<span onClick={() => setShowPass(p => !p)} style={{ cursor: 'pointer' }}>{showPass ? '🙈' : '👁️'}</span>}
            required
          />
          <PasswordHint>Must contain uppercase, lowercase, and a number</PasswordHint>
          <Button type="submit" loading={loading} fullWidth size="lg">
            Create Account
          </Button>
        </Form>

        <LoginLink>
          Already have an account? <Link to="/login">Sign in</Link>
        </LoginLink>
      </Card>
    </Page>
  );
};

export default Register;
