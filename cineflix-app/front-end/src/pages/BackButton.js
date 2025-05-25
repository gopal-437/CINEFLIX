import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animation for the arrow
const arrowBounce = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
`;

// Styled button component
const BackButtonContainer = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #4a4a4a;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 24px;
  transition: all 0.3s ease;
  background-color: #f5f5f5;
  
  &:hover {
    color: #2a2a2a;
    background-color: #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .arrow {
      animation: ${arrowBounce} 0.6s ease infinite;
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ArrowIcon = styled.span`
  display: inline-block;
  margin-right: 8px;
  transition: transform 0.2s ease;
  
  &::before {
    content: "←";
    display: inline-block;
    font-size: 18px;
  }
`;

const BackButton = ({ onClick, children = 'Home' }) => {
  return (
    <BackButtonContainer onClick={onClick}>
      <ArrowIcon className="arrow" />
      {children}
    </BackButtonContainer>
  );
};

export default BackButton;