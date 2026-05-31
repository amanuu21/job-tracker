import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge, { formatStatus } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

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
const UserCell = styled.div`display: flex; align-items: center; gap: 10px;`;
const RoleSelect = styled.select`
  padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgCard}; color: ${({ theme }) => theme.colors.text};
  cursor: pointer; outline: none;
`;

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/users/${userId}/role`, { role });
      toast.success('Role updated');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/users/${userId}/toggle-status`);
      toast.success(res.data.message);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <Title>User Management</Title>
      <Filters>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} icon="🔍" />
        </div>
        <FilterSelect value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="applicant">Applicant</option>
          <option value="hr_staff">HR Staff</option>
          <option value="committee_member">Committee Member</option>
          <option value="admin">Admin</option>
        </FilterSelect>
      </Filters>

      <Card padding="0">
        {loading ? <LoadingSpinner /> : (
          <Table>
            <StyledTable>
              <thead>
                <tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th>Last Login</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <Tr key={u.id}>
                    <Td>
                      <UserCell>
                        <Avatar>
                          {u.avatar_url ? <img src={u.avatar_url} alt="" /> : `${u.first_name?.[0]}${u.last_name?.[0]}`}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</div>
                          <div style={{ fontSize: 12, color: '#718096' }}>{u.email}</div>
                        </div>
                      </UserCell>
                    </Td>
                    <Td>
                      {u.id !== currentUser?.id ? (
                        <RoleSelect value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                          <option value="applicant">Applicant</option>
                          <option value="hr_staff">HR Staff</option>
                          <option value="committee_member">Committee Member</option>
                          <option value="admin">Admin</option>
                        </RoleSelect>
                      ) : (
                        <Badge status={u.role}>{formatStatus(u.role)}</Badge>
                      )}
                    </Td>
                    <Td>
                      <span style={{ fontSize: 12, fontWeight: 600, color: u.is_active ? '#48bb78' : '#fc8181' }}>
                        {u.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </Td>
                    <Td style={{ fontSize: 13, color: '#718096' }}>{format(new Date(u.created_at), 'MMM d, yyyy')}</Td>
                    <Td style={{ fontSize: 13, color: '#718096' }}>{u.last_login ? format(new Date(u.last_login), 'MMM d') : 'Never'}</Td>
                    <Td>
                      {u.id !== currentUser?.id && (
                        <Button size="sm" variant={u.is_active ? 'danger' : 'success'} onClick={() => handleToggleStatus(u.id)}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </StyledTable>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default Users;
