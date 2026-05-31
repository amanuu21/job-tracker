import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text}; margin-bottom: 24px;`;
const Filters = styled.div`display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;`;
const Table = styled.div`overflow-x: auto;`;
const StyledTable = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`
  text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`;
const Tr = styled.tr`&:hover { background: ${({ theme }) => theme.colors.borderLight}; }`;
const Td = styled.td`
  padding: 12px 16px; font-size: 13px; color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  vertical-align: middle; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;
const ActionBadge = styled.span`
  padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
`;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 50 });
    if (search) params.set('action', search);
    api.get(`/reports/audit-logs?${params}`)
      .then(r => { setLogs(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <Title>Audit Logs</Title>
      <Filters>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="Filter by action..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} icon="🔍" />
        </div>
      </Filters>

      <Card padding="0">
        {loading ? <LoadingSpinner /> : (
          <Table>
            <StyledTable>
              <thead>
                <tr>
                  <Th>User</Th>
                  <Th>Action</Th>
                  <Th>Entity</Th>
                  <Th>IP Address</Th>
                  <Th>Timestamp</Th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <Tr key={log.id}>
                    <Td>
                      <div style={{ fontWeight: 600 }}>{log.user_name || 'System'}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{log.user_email}</div>
                    </Td>
                    <Td><ActionBadge>{log.action}</ActionBadge></Td>
                    <Td style={{ color: '#718096' }}>{log.entity_type || '—'}</Td>
                    <Td style={{ color: '#718096', fontFamily: 'monospace' }}>{log.ip_address || '—'}</Td>
                    <Td style={{ color: '#718096' }}>{format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}</Td>
                  </Tr>
                ))}
                {logs.length === 0 && (
                  <tr><Td colSpan={5} style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>No audit logs found</Td></tr>
                )}
              </tbody>
            </StyledTable>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AuditLogs;
