import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell } from 'recharts';
import api from '../../services/api';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatStatus } from '../../components/ui/Badge';

const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text}; margin-bottom: 24px;`;
const Grid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 20px; @media(max-width:900px){grid-template-columns:1fr;}`;
const ExportBar = styled.div`display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;`;
const DateInput = styled.input`
  padding: 9px 14px; border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bgCard}; color: ${({ theme }) => theme.colors.text};
  font-size: 14px; outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const FunnelItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;
const FunnelBar = styled.div`
  height: 28px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.gradient};
  min-width: 4px;
  transition: width 0.5s ease;
`;
const FunnelLabel = styled.div`font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; min-width: 120px;`;
const FunnelValue = styled.div`font-size: 16px; font-weight: 700; color: ${({ theme }) => theme.colors.text}; min-width: 40px;`;

const COLORS = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#fc8181', '#63b3ed', '#f093fb', '#fbd38d'];

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports/hiring-funnel'),
    ]).then(([statsRes, funnelRes]) => {
      setStats(statsRes.data.data);
      setFunnel(funnelRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({ format });
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
      const res = await api.get(`/reports/applications?${params}`, { responseType: format === 'csv' ? 'blob' : 'json' });
      if (format === 'csv') {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url; a.download = 'applications-report.csv'; a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'applications-report.json'; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  const appData = stats ? Object.entries(stats.applications)
    .filter(([k]) => k !== 'total')
    .map(([name, value]) => ({ name: formatStatus(name), value })) : [];

  const funnelStages = funnel ? [
    { label: 'Total Applied', value: parseInt(funnel.total) },
    { label: 'Under Review', value: parseInt(funnel.under_review) },
    { label: 'Shortlisted', value: parseInt(funnel.shortlisted) },
    { label: 'Interviewed', value: parseInt(funnel.interviewed) },
    { label: 'Offered', value: parseInt(funnel.offered) },
    { label: 'Hired', value: parseInt(funnel.hired) },
  ] : [];

  const maxFunnel = funnelStages[0]?.value || 1;

  return (
    <div>
      <Title>Reports & Analytics</Title>

      <ExportBar>
        <DateInput type="date" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start date" />
        <DateInput type="date" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End date" />
        <Button variant="ghost" size="sm" onClick={() => handleExport('csv')}>📥 Export CSV</Button>
        <Button variant="ghost" size="sm" onClick={() => handleExport('json')}>📥 Export JSON</Button>
      </ExportBar>

      <Grid>
        <Card>
          <CardHeader><CardTitle>Applications by Status</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {appData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hiring Funnel</CardTitle></CardHeader>
          {funnelStages.map((stage, i) => (
            <FunnelItem key={stage.label}>
              <FunnelLabel>{stage.label}</FunnelLabel>
              <FunnelBar style={{ width: `${(stage.value / maxFunnel) * 100}%` }} />
              <FunnelValue>{stage.value}</FunnelValue>
            </FunnelItem>
          ))}
        </Card>

        <Card>
          <CardHeader><CardTitle>Job Statistics</CardTitle></CardHeader>
          {stats && Object.entries(stats.jobs).filter(([k]) => k !== 'total').map(([status, count]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: 14 }}>
              <span style={{ color: '#718096' }}>{formatStatus(status)}</span>
              <span style={{ fontWeight: 700 }}>{count}</span>
            </div>
          ))}
        </Card>

        <Card>
          <CardHeader><CardTitle>User Distribution</CardTitle></CardHeader>
          {stats && Object.entries(stats.users).filter(([k]) => k !== 'total').map(([role, count]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: 14 }}>
              <span style={{ color: '#718096' }}>{formatStatus(role)}</span>
              <span style={{ fontWeight: 700 }}>{count}</span>
            </div>
          ))}
        </Card>
      </Grid>
    </div>
  );
};

export default Reports;
