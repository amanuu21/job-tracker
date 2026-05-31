import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${({ sidebarOpen }) => sidebarOpen ? '260px' : '70px'};
  transition: margin-left ${({ theme }) => theme.transitions.normal};
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Layout>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />
      <Main sidebarOpen={sidebarOpen}>
        <Header onMenuClick={() => setSidebarOpen(p => !p)} />
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Layout>
  );
};

export default DashboardLayout;
