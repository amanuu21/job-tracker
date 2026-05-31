import React from 'react';
import styled, { css } from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  padding-left: ${({ hasIcon }) => hasIcon ? '40px' : '14px'};
  padding-right: ${({ hasRightIcon }) => hasRightIcon ? '40px' : '14px'};
  background: ${({ theme }) => theme.colors.bg};
  border: 1.5px solid ${({ theme, error }) => error ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  transition: all ${({ theme }) => theme.transitions.fast};
  outline: none;

  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }

  &:focus {
    border-color: ${({ theme, error }) => error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, error }) => error ? theme.colors.error + '20' : theme.colors.primary + '20'};
    background: ${({ theme }) => theme.colors.bgCard};
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const StyledTextarea = styled(StyledInput).attrs({ as: 'textarea' })`
  resize: vertical;
  min-height: 100px;
  padding-left: 14px;
`;

const IconLeft = styled.span`
  position: absolute;
  left: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const IconRight = styled.span`
  position: absolute;
  right: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;

const Input = ({ label, error, icon, rightIcon, textarea, ...props }) => (
  <Wrapper>
    {label && <Label htmlFor={props.id || props.name}>{label}</Label>}
    <InputWrapper>
      {icon && <IconLeft>{icon}</IconLeft>}
      {textarea
        ? <StyledTextarea hasIcon={!!icon} error={error} {...props} />
        : <StyledInput hasIcon={!!icon} hasRightIcon={!!rightIcon} error={error} {...props} />
      }
      {rightIcon && <IconRight>{rightIcon}</IconRight>}
    </InputWrapper>
    {error && <ErrorText role="alert">{error}</ErrorText>}
  </Wrapper>
);

export default Input;
