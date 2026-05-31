import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import Badge, { formatStatus } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const Grid = styled.div`
  display: grid;
  gap: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover { transform: translateY(-2px); box-shadow: ${({ theme }) => theme.shadows.md}; }
`;

const StatIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ gradient }) => gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const StatInfo = styled.div``;
const StatValue = styled.div`font-size: 28px; font-weight: 800; color: ${({ theme }) => theme.colors.text};`;
const StatLabel = styled.div`font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 2px;`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const PageTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-bottom: 24px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Td = styled.td`
  padding: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const COLORS = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#fc8181', '#63b3ed', '#f093fb', '#fbd38d'];

const ApplicantDashboard = ({ user }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/my?limit=5').then(r => setApps(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusCounts = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name: formatStatus(name), value }));

  return (
    <Grid>
      <div>
        <PageTitle>My Dashboard</PageTitle>
        <PageSubtitle>Track your job applications and progress</PageSubtitle>
      </div>

      <StatsGrid>
        {[
          { label: 'Total Applied', value: apps.length, icon: '📋', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
          { label: 'Under Review', value: statusCounts.under_review || 0, icon: '🔍', gradient: 'linear-gradient(135deg,#f6d365,#fda085)' },
          { label: 'Shortlisted', value: statusCounts.shortlisted || 0, icon: '⭐', gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
          { label: 'Interviews', value: (statusCounts.interview_scheduled || 0) + (statusCounts.interviewed || 0), icon: '🎤', gradient: 'linear-gradient(135deg,#48bb78,#38a169)' },
        ].map((s, i) => (
          <StatCard key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatIcon gradient={s.gradient}>{s.icon}</StatIcon>
            <StatInfo><StatValue>{s.value}</StatValue><StatLabel>{s.label}</StatLabel></StatInfo>
          </StatCard>
        ))}
      </StatsGrid>

      <ChartsGrid>
        <Card>
          <CardHeader><CardTitle>Application Status</CardTitle></CardHeader>
          {loading ? <LoadingSpinner /> : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ textAlign: 'center', color: '#718096', padding: '40px 0' }}>No applications yet</p>}
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
          {loading ? <LoadingSpinner /> : (
            <Table>
              <thead><tr><Th>Job</Th><Th>Status</Th><Th>Date</Th></tr></thead>
              <tbody>
                {apps.slice(0, 5).map(a => (
                  <tr key={a.id}>
                    <Td style={{ fontWeight: 600 }}>{a.job_title}</Td>
                    <Td><Badge status={a.status}>{formatStatus(a.status)}</Badge></Td>
                    <Td style={{ color: '#718096', fontSize: 12 }}>{format(new Date(a.submitted_at), 'MMM d')}</Td>
                  </tr>
                ))}
                {apps.length === 0 && <tr><Td colSpan={3} style={{ textAlign: 'center', color: '#718096' }}>No applications yet</Td></tr>}
              </tbody>
            </Table>
          )}
        </Card>
      </ChartsGrid>
    </Grid>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard').then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const appData = stats ? Object.entries(stats.applications)
    .filter(([k]) => k !== 'total')
    .map(([name, value]) => ({ name: formatStatus(name), value })) : [];

  return (
    <Grid>
      <div>
        <PageTitle>Admin Dashboard</PageTitle>
        <PageSubtitle>System overview and analytics</PageSubtitle>
      </div>

      <StatsGrid>
        {[
          { label: 'Total Jobs', value: stats?.jobs?.total || 0, icon: '💼', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
          { label: 'Open Jobs', value: stats?.jobs?.open || 0, icon: '🟢', gradient: 'linear-gradient(135deg,#48bb78,#38a169)' },
          { label: 'Total Applications', value: stats?.applications?.total || 0, icon: '📋', gradient: 'linear-gradient(135deg,#f6d365,#fda085)' },
          { label: 'Total Users', value: stats?.users?.total || 0, icon: '👥', gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
          { label: 'Hired', value: stats?.applications?.hired || 0, icon: '🎉', gradient: 'linear-gradient(135deg,#48bb78,#38a169)' },
          { label: 'Pending Review', value: stats?.applications?.submitted || 0, icon: '⏳', gradient: 'linear-gradient(135deg,#fc8181,#e53e3e)' },
        ].map((s, i) => (
          <StatCard key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatIcon gradient={s.gradient}>{s.icon}</StatIcon>
            <StatInfo><StatValue>{s.value}</StatValue><StatLabel>{s.label}</StatLabel></StatInfo>
          </StatCard>
        ))}
      </StatsGrid>

      <ChartsGrid>
        <Card>
          <CardHeader><CardTitle>Applications by Status</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={appData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#667eea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
          <Table>
            <thead><tr><Th>Applicant</Th><Th>Job</Th><Th>Status</Th></tr></thead>
            <tbody>
              {stats?.recent_applications?.map(a => (
                <tr key={a.id}>
                  <Td style={{ fontWeight: 600 }}>{a.applicant_name}</Td>
                  <Td style={{ color: '#718096' }}>{a.job_title}</Td>
                  <Td><Badge status={a.status}>{formatStatus(a.status)}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </ChartsGrid>
    </Grid>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'applicant') return <ApplicantDashboard user={user} />;
  return <AdminDashboard />;
};

export default Dashboard;
