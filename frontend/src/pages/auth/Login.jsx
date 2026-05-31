import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.bg};
`;

const Left = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: white;

  @media (max-width: 768px) { display: none; }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
`;

const FormCard = styled(motion.div)`
  width: 100%;
  max-width: 420px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 32px;
  font-size: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ForgotLink = styled(Link)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
  text-align: right;
  display: block;
  margin-top: -8px;

  &:hover { text-decoration: underline; }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 16px;

  a { color: ${({ theme }) => theme.colors.primary}; font-weight: 600; }
  a:hover { text-decoration: underline; }
`;

const HeroTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.2;
`;

const HeroText = styled.p`
  font-size: 16px;
  opacity: 0.85;
  line-height: 1.6;
  max-width: 400px;
`;

const Features = styled.ul`
  list-style: none;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  opacity: 0.9;
`;

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Left>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <HeroTitle>Track Every Application, Land Your Dream Job</HeroTitle>
          <HeroText>A powerful platform connecting talented applicants with great opportunities.</HeroText>
          <Features>
            {['Real-time application tracking', 'Smart notifications & updates', 'Committee evaluation system', 'Comprehensive analytics'].map(f => (
              <Feature key={f}><span>✅</span> {f}</Feature>
            ))}
          </Features>
        </motion.div>
      </Left>

      <Right>
        <FormCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Title>Welcome back</Title>
          <Subtitle>Sign in to your account to continue</Subtitle>

          <Form onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              id="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              icon="📧"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              icon="🔒"
              rightIcon={
                <span onClick={() => setShowPass(p => !p)} style={{ cursor: 'pointer' }}>
                  {showPass ? '🙈' : '👁️'}
                </span>
              }
              required
              autoComplete="current-password"
            />
            <ForgotLink to="/forgot-password">Forgot password?</ForgotLink>
            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign In
            </Button>
          </Form>

          <Divider>or</Divider>

          <div style={{ background: 'rgba(102,126,234,0.08)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#667eea' }}>
            <strong>Demo accounts:</strong><br />
            Admin: admin@jobtracker.com / Admin@123<br />
            HR: hr@jobtracker.com / Hr@123456<br />
            Applicant: applicant@jobtracker.com / App@123456
          </div>

          <RegisterLink>
            Don't have an account? <Link to="/register">Create one</Link>
          </RegisterLink>
        </FormCard>
      </Right>
    </Page>
  );
};

export default Login;
