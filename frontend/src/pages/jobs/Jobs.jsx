import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge, { formatStatus } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text};`;

const Filters = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 9px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bgCard};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  outline: none;

  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

const JobCard = styled(motion(Card))`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const JobTitle = styled.h3`font-size: 16px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;
const JobDept = styled.p`font-size: 13px; color: ${({ theme }) => theme.colors.primary}; font-weight: 600;`;

const JobMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const JobFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Salary = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
`;

const Deadline = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const PageBtn = styled.button`
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ active, theme }) => active ? theme.colors.gradient : theme.colors.bgCard};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.primary}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};

  div { font-size: 48px; margin-bottom: 12px; }
  h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: ${({ theme }) => theme.colors.text}; }
`;

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const canManage = ['hr_staff', 'admin'].includes(user?.role);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('search', search);
      if (jobType) params.set('job_type', jobType);
      if (status && canManage) params.set('status', status);
      const res = await api.get(`/jobs?${params}`);
      setJobs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, jobType, status, canManage]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) => n >= 1000 ? `$${(n/1000).toFixed(0)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max)}`;
  };

  return (
    <div>
      <PageHeader>
        <Title>Job Vacancies</Title>
        {canManage && (
          <Button onClick={() => navigate('/jobs/create')} icon="➕">Post New Job</Button>
        )}
      </PageHeader>

      <Filters>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            icon="🔍"
          />
        </div>
        <FilterSelect value={jobType} onChange={e => { setJobType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
        </FilterSelect>
        {canManage && (
          <FilterSelect value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </FilterSelect>
        )}
      </Filters>

      {loading ? <LoadingSpinner /> : (
        <>
          <JobsGrid>
            {jobs.map((job, i) => (
              <JobCard
                key={job.id}
                hoverable
                onClick={() => navigate(`/jobs/${job.id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div>
                  <JobDept>{job.department}</JobDept>
                  <JobTitle>{job.title}</JobTitle>
                </div>
                <JobMeta>
                  {job.location && <MetaItem>📍 {job.location}</MetaItem>}
                  <MetaItem><Badge status={job.job_type}>{formatStatus(job.job_type)}</Badge></MetaItem>
                  <MetaItem>👥 {job.positions_available} position{job.positions_available > 1 ? 's' : ''}</MetaItem>
                  <MetaItem>📋 {job.application_count} applied</MetaItem>
                </JobMeta>
                <JobFooter>
                  <div>
                    {formatSalary(job.salary_min, job.salary_max) && (
                      <Salary>{formatSalary(job.salary_min, job.salary_max)}</Salary>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {canManage && <Badge status={job.status}>{formatStatus(job.status)}</Badge>}
                    <Deadline>Due {format(new Date(job.deadline), 'MMM d, yyyy')}</Deadline>
                  </div>
                </JobFooter>
              </JobCard>
            ))}
          </JobsGrid>

          {jobs.length === 0 && (
            <EmptyState>
              <div>💼</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search or filters</p>
            </EmptyState>
          )}

          {pagination.pages > 1 && (
            <Pagination>
              <PageBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</PageBtn>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
              ))}
              <PageBtn onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}>Next →</PageBtn>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;
