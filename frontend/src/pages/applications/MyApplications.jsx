import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge, { formatStatus } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text}; margin-bottom: 24px;`;
const Grid = styled.div`display: flex; flex-direction: column; gap: 12px;`;

const AppCard = styled(motion(Card))`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const AppInfo = styled.div`flex: 1;`;
const JobTitle = styled.h3`font-size: 16px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;
const JobMeta = styled.p`font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 4px;`;
const AppDate = styled.span`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1.5px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  background: ${({ active, theme }) => active ? theme.colors.primaryLight : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  div { font-size: 48px; margin-bottom: 12px; }
  h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: ${({ theme }) => theme.colors.text}; }
`;

const FILTERS = ['all', 'submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected'];

const MyApplications = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/applications/my${params}`);
      setApps(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, [filter]);

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await api.patch(`/applications/${id}/withdraw`);
      toast.success('Application withdrawn');
      fetchApps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    }
  };

  return (
    <div>
      <Title>My Applications</Title>

      <FilterBar>
        {FILTERS.map(f => (
          <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : formatStatus(f)}
          </FilterBtn>
        ))}
      </FilterBar>

      {loading ? <LoadingSpinner /> : (
        <Grid>
          {apps.map((app, i) => (
            <AppCard key={app.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <AppInfo>
                <JobTitle>{app.job_title}</JobTitle>
                <JobMeta>{app.department} {app.location && `• ${app.location}`} {app.job_type && `• ${formatStatus(app.job_type)}`}</JobMeta>
                <AppDate>Applied {format(new Date(app.submitted_at), 'MMMM d, yyyy')}</AppDate>
              </AppInfo>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Badge status={app.status}>{formatStatus(app.status)}</Badge>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/jobs/${app.job_id}`)}>View Job</Button>
                {['submitted', 'under_review'].includes(app.status) && (
                  <Button size="sm" variant="danger" onClick={() => handleWithdraw(app.id)}>Withdraw</Button>
                )}
              </div>
            </AppCard>
          ))}
          {apps.length === 0 && (
            <EmptyState>
              <div>📋</div>
              <h3>No applications found</h3>
              <p>Start applying to jobs to see them here</p>
              <Button onClick={() => navigate('/jobs')} style={{ marginTop: 16 }}>Browse Jobs</Button>
            </EmptyState>
          )}
        </Grid>
      )}
    </div>
  );
};

export default MyApplications;
