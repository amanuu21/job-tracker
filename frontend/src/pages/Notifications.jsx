import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const Header = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;`;
const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text};`;

const NotifItem = styled(motion.div)`
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme, unread }) => unread ? theme.colors.primary + '40' : theme.colors.border};
  background: ${({ theme, unread }) => unread ? theme.colors.primaryLight : theme.colors.bgCard};
  margin-bottom: 10px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover { transform: translateX(4px); }
`;

const NotifIcon = styled.div`
  width: 40px; height: 40px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
`;

const NotifContent = styled.div`flex: 1;`;
const NotifTitle = styled.div`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.text}; margin-bottom: 4px;`;
const NotifMessage = styled.div`font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};`;
const NotifTime = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 4px;`;

const UnreadDot = styled.div`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0; margin-top: 6px;
`;

const typeIcons = { success: '✅', warning: '⚠️', error: '❌', application: '📋', job: '💼', info: 'ℹ️' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { clearUnread } = useSocket() || {};

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    clearUnread?.();
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success('All marked as read');
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/notifications/${id}`).catch(() => {});
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div>
      <Header>
        <Title>Notifications {unreadCount > 0 && <span style={{ fontSize: 16, color: '#667eea' }}>({unreadCount} unread)</span>}</Title>
        {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>}
      </Header>

      {loading ? <LoadingSpinner /> : (
        notifications.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No notifications</h3>
            <p style={{ color: '#718096' }}>You're all caught up!</p>
          </Card>
        ) : (
          notifications.map((n, i) => (
            <NotifItem
              key={n.id}
              unread={!n.is_read}
              onClick={() => !n.is_read && markRead(n.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NotifIcon>{typeIcons[n.type] || 'ℹ️'}</NotifIcon>
              <NotifContent>
                <NotifTitle>{n.title}</NotifTitle>
                <NotifMessage>{n.message}</NotifMessage>
                <NotifTime>{format(new Date(n.created_at), 'MMM d, yyyy • h:mm a')}</NotifTime>
              </NotifContent>
              {!n.is_read && <UnreadDot />}
              <button
                onClick={(e) => deleteNotif(n.id, e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', fontSize: 16, padding: '0 4px' }}
                aria-label="Delete notification"
              >×</button>
            </NotifItem>
          ))
        )
      )}
    </div>
  );
};

export default Notifications;
