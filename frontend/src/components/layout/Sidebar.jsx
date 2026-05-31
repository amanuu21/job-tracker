import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarWrapper = styled(motion.aside)`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ isOpen }) => isOpen ? '260px' : '70px'};
  background: ${({ theme }) => theme.colors.bgSidebar};
  display: flex;
  flex-direction: column;
  transition: width ${({ theme }) => theme.transitions.normal};
  z-index: 100;
  overflow: hidden;
  box-shadow: 4px 0 20px rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    transform: ${({ isOpen }) => isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 260px;
  }
`;

const Logo = styled.div`
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  min-height: 70px;
`;

const LogoIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: ${({ theme }) => theme.shadows.glow};
`;

const LogoText = styled.span`
  font-size: 16px;
  font-weight: 800;
  color: white;
  white-space: nowrap;
  overflow: hidden;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 16px 8px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const NavSection = styled.div`
  margin-bottom: 8px;
`;

const SectionLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.3);
  padding: 8px 12px 4px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 2px;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.bgSidebarHover};
    color: white;
  }

  &.active {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`;

const NavIcon = styled.span`
  font-size: 18px;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
`;

const NavLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserSection = styled.div`
  padding: 12px 8px;
  border-top: 1px solid rgba(255,255,255,0.08);
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  overflow: hidden;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const UserInfo = styled.div`
  overflow: hidden;
  flex: 1;
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  text-transform: capitalize;
`;

const LogoutBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  font-size: 16px;
  transition: color ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover { color: ${({ theme }) => theme.colors.error}; }
`;

const navConfig = {
  applicant: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/jobs', icon: '💼', label: 'Browse Jobs' },
      { to: '/my-applications', icon: '📋', label: 'My Applications' },
    ]},
    { label: 'Account', items: [
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
      { to: '/profile', icon: '👤', label: 'Profile' },
    ]},
  ],
  hr_staff: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/jobs', icon: '💼', label: 'Job Vacancies' },
      { to: '/applications', icon: '📋', label: 'Applications' },
    ]},
    { label: 'Management', items: [
      { to: '/reports', icon: '📊', label: 'Reports' },
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
      { to: '/profile', icon: '👤', label: 'Profile' },
    ]},
  ],
  committee_member: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/applications', icon: '📋', label: 'Applications' },
      { to: '/evaluations', icon: '⭐', label: 'Evaluations' },
    ]},
    { label: 'Account', items: [
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
      { to: '/profile', icon: '👤', label: 'Profile' },
    ]},
  ],
  admin: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/jobs', icon: '💼', label: 'Job Vacancies' },
      { to: '/applications', icon: '📋', label: 'Applications' },
    ]},
    { label: 'Management', items: [
      { to: '/users', icon: '👥', label: 'Users' },
      { to: '/evaluations', icon: '⭐', label: 'Evaluations' },
      { to: '/reports', icon: '📊', label: 'Reports' },
      { to: '/audit-logs', icon: '🔍', label: 'Audit Logs' },
    ]},
    { label: 'Account', items: [
      { to: '/notifications', icon: '🔔', label: 'Notifications' },
      { to: '/profile', icon: '👤', label: 'Profile' },
    ]},
  ],
};

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = navConfig[user?.role] || navConfig.applicant;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user ? `${user.first_name?.[0]}${user.last_name?.[0]}`.toUpperCase() : 'U';

  return (
    <SidebarWrapper isOpen={isOpen}>
      <Logo>
        <LogoIcon>🎯</LogoIcon>
        {isOpen && <LogoText>JobTracker</LogoText>}
      </Logo>

      <Nav>
        {sections.map((section) => (
          <NavSection key={section.label}>
            {isOpen && <SectionLabel>{section.label}</SectionLabel>}
            {section.items.map((item) => (
              <NavItem key={item.to} to={item.to} end={item.to === '/dashboard'}>
                <NavIcon>{item.icon}</NavIcon>
                {isOpen && <NavLabel>{item.label}</NavLabel>}
              </NavItem>
            ))}
          </NavSection>
        ))}
      </Nav>

      <UserSection>
        <UserCard>
          <Avatar>
            {user?.avatar_url ? <img src={user.avatar_url} alt={initials} /> : initials}
          </Avatar>
          {isOpen && (
            <UserInfo>
              <UserName>{user?.first_name} {user?.last_name}</UserName>
              <UserRole>{user?.role?.replace('_', ' ')}</UserRole>
            </UserInfo>
          )}
          {isOpen && (
            <LogoutBtn onClick={handleLogout} title="Logout" aria-label="Logout">
              🚪
            </LogoutBtn>
          )}
        </UserCard>
      </UserSection>
    </SidebarWrapper>
  );
};

export default Sidebar;
