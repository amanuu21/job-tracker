import styled, { css } from 'styled-components';

const statusColors = {
  submitted: { bg: '#ebf8ff', color: '#2b6cb0', border: '#bee3f8' },
  under_review: { bg: '#fefcbf', color: '#744210', border: '#faf089' },
  shortlisted: { bg: '#e9d8fd', color: '#553c9a', border: '#d6bcfa' },
  interview_scheduled: { bg: '#feebc8', color: '#7b341e', border: '#fbd38d' },
  interviewed: { bg: '#c6f6d5', color: '#22543d', border: '#9ae6b4' },
  offered: { bg: '#bee3f8', color: '#2a4365', border: '#90cdf4' },
  hired: { bg: '#c6f6d5', color: '#22543d', border: '#68d391' },
  rejected: { bg: '#fed7d7', color: '#742a2a', border: '#fc8181' },
  withdrawn: { bg: '#e2e8f0', color: '#4a5568', border: '#cbd5e0' },
  open: { bg: '#c6f6d5', color: '#22543d', border: '#68d391' },
  closed: { bg: '#fed7d7', color: '#742a2a', border: '#fc8181' },
  draft: { bg: '#e2e8f0', color: '#4a5568', border: '#cbd5e0' },
  full_time: { bg: '#ebf8ff', color: '#2b6cb0', border: '#bee3f8' },
  part_time: { bg: '#fefcbf', color: '#744210', border: '#faf089' },
  contract: { bg: '#e9d8fd', color: '#553c9a', border: '#d6bcfa' },
  remote: { bg: '#c6f6d5', color: '#22543d', border: '#9ae6b4' },
  internship: { bg: '#feebc8', color: '#7b341e', border: '#fbd38d' },
};

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid;

  ${({ status, theme }) => {
    const colors = statusColors[status];
    if (colors) {
      return css`
        background: ${colors.bg};
        color: ${colors.color};
        border-color: ${colors.border};
      `;
    }
    return css`
      background: ${theme.colors.primaryLight};
      color: ${theme.colors.primary};
      border-color: ${theme.colors.primary}33;
    `;
  }}
`;

export const formatStatus = (status) =>
  status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

export default Badge;
