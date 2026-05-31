import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

const FullScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
  gap: 16px;
`;

const Spinner = styled.div`
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 800;
  background: ${({ theme }) => theme.colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const InlineWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ padding }) => padding || '40px'};
`;

const LoadingSpinner = ({ fullScreen, size, inline }) => {
  if (fullScreen) {
    return (
      <FullScreen>
        <Logo>JobTracker</Logo>
        <Spinner size="48px" />
      </FullScreen>
    );
  }

  if (inline) {
    return <Spinner size={size || '20px'} style={{ display: 'inline-block' }} />;
  }

  return (
    <InlineWrapper>
      <Spinner size={size} />
    </InlineWrapper>
  );
};

export default LoadingSpinner;
