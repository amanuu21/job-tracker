import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const HeaderWrapper = styled.header`
  height: 70px;
  background: ${({ theme }) => theme.colors.bgCard};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MenuBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 6px;
  border-radius: 8px;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;

  &:hover { background: ${({ theme }) => theme.colors.borderLight}; color: ${({ theme }) => theme.colors.text}; }
`;

const PageTitle = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 480px) { display: none; }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconBtn = styled.button`
  position: relative;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.bgCard};
`;

const Greeting = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 640px) { display: none; }
`;

const Header = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useSocket() || {};
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <HeaderWrapper>
      <Left>
        <MenuBtn onClick={onMenuClick} aria-label="Toggle sidebar">☰</MenuBtn>
        <Greeting>{getGreeting()}, {user?.first_name} 👋</Greeting>
      </Left>
      <Right>
        <IconBtn onClick={toggleTheme} aria-label="Toggle theme" title={isDark ? 'Light mode' : 'Dark mode'}>
          {isDark ? '☀️' : '🌙'}
        </IconBtn>
        <IconBtn onClick={() => navigate('/notifications')} aria-label="Notifications">
          🔔
          {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
        </IconBtn>
        <IconBtn onClick={() => navigate('/profile')} aria-label="Profile">
          👤
        </IconBtn>
      </Right>
    </HeaderWrapper>
  );
};

export default Header;
