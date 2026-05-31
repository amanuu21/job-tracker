import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge, { formatStatus } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text}; margin-bottom: 24px;`;
const Filters = styled.div`display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;`;
const FilterSelect = styled.select`
  padding: 9px 14px; border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bgCard}; color: ${({ theme }) => theme.colors.text};
  font-size: 14px; cursor: pointer; outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const Table = styled.div`overflow-x: auto;`;
const StyledTable = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`
  text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`;
const Tr = styled.tr`
  transition: background ${({ theme }) => theme.transitions.fast};
  &:hover { background: ${({ theme }) => theme.colors.borderLight}; }
`;
const Td = styled.td`
  padding: 14px 16px; font-size: 14px; color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  vertical-align: middle;
`;

const Avatar = styled.div`
  width: 36px; height: 36px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: white; font-size: 13px; flex-shrink: 0;
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const ApplicantCell = styled.div`display: flex; align-items: center; gap: 10px;`;
const ApplicantName = styled.div`font-weight: 600;`;
const ApplicantEmail = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;

const StatusSelect = styled.select`
  padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgCard}; color: ${({ theme }) => theme.colors.text};
  cursor: pointer; outline: none;
`;

const Applications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const canUpdateStatus = ['hr_staff', 'admin'].includes(user?.role);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/applications?${params}`);
      setApps(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      toast.success('Status updated');
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = apps.filter(a =>
    !search || `${a.first_name} ${a.last_name} ${a.email} ${a.job_title}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Title>All Applications</Title>
      <Filters>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="Search applicants..." value={search} onChange={e => setSearch(e.target.value)} icon="🔍" />
        </div>
        <FilterSelect value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {['submitted','under_review','shortlisted','interview_scheduled','interviewed','offered','hired','rejected','withdrawn'].map(s => (
            <option key={s} value={s}>{formatStatus(s)}</option>
          ))}
        </FilterSelect>
      </Filters>

      <Card padding="0">
        {loading ? <LoadingSpinner /> : (
          <Table>
            <StyledTable>
              <thead>
                <tr>
                  <Th>Applicant</Th>
                  <Th>Job</Th>
                  <Th>Status</Th>
                  <Th>Applied</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <Tr key={app.id}>
                    <Td>
                      <ApplicantCell>
                        <Avatar>
                          {app.avatar_url ? <img src={app.avatar_url} alt="" /> : `${app.first_name?.[0]}${app.last_name?.[0]}`}
                        </Avatar>
                        <div>
                          <ApplicantName>{app.first_name} {app.last_name}</ApplicantName>
                          <ApplicantEmail>{app.email}</ApplicantEmail>
                        </div>
                      </ApplicantCell>
                    </Td>
                    <Td>
                      <div style={{ fontWeight: 600 }}>{app.job_title}</div>
                      <div style={{ fontSize: 12, color: '#718096' }}>{app.department}</div>
                    </Td>
                    <Td>
                      {canUpdateStatus ? (
                        <StatusSelect value={app.status} onChange={e => handleStatusChange(app.id, e.target.value)}>
                          {['submitted','under_review','shortlisted','interview_scheduled','interviewed','offered','hired','rejected'].map(s => (
                            <option key={s} value={s}>{formatStatus(s)}</option>
                          ))}
                        </StatusSelect>
                      ) : (
                        <Badge status={app.status}>{formatStatus(app.status)}</Badge>
                      )}
                    </Td>
                    <Td style={{ color: '#718096', fontSize: 13 }}>{format(new Date(app.submitted_at), 'MMM d, yyyy')}</Td>
                    <Td>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/applications/${app.id}`)}>View</Button>
                    </Td>
                  </Tr>
                ))}
                {filtered.length === 0 && (
                  <tr><Td colSpan={5} style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>No applications found</Td></tr>
                )}
              </tbody>
            </StyledTable>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default Applications;
