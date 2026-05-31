import React from 'react';
import styled, { css } from 'styled-components';
import LoadingSpinner from './LoadingSpinner';

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.gradient};
    color: white;
    border: none;
    &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: ${({ theme }) => theme.shadows.glow}; }
  `,
  secondary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.primary};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryLight}; }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.borderLight}; color: ${({ theme }) => theme.colors.text}; }
  `,
  danger: css`
    background: linear-gradient(135deg, #fc8181, #e53e3e);
    color: white;
    border: none;
    &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  `,
  success: css`
    background: ${({ theme }) => theme.colors.gradientSuccess};
    color: white;
    border: none;
    &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  `,
};

const sizes = {
  sm: css`padding: 6px 14px; font-size: 13px;`,
  md: css`padding: 10px 20px; font-size: 14px;`,
  lg: css`padding: 14px 28px; font-size: 16px;`,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  ${({ variant = 'primary' }) => variants[variant]}
  ${({ size = 'md' }) => sizes[size]}

  ${({ fullWidth }) => fullWidth && css`width: 100%;`}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Button = ({ children, loading, disabled, icon, ...props }) => (
  <StyledButton disabled={disabled || loading} {...props}>
    {loading ? <LoadingSpinner inline size="16px" /> : icon}
    {children}
  </StyledButton>
);

export default Button;
