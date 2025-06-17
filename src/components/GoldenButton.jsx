import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  .neumorphic-button {
    touch-action: manipulation;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
    font-family: inherit;
    font-size: 0.9em;
    font-weight: 600;
    box-sizing: border-box;
    border: none;
    border-radius: 16px;
    height: 44px;
    line-height: 1.4;
    text-transform: none;
    letter-spacing: 0.3px;
    padding: 0 1.5em;
    background: #e0e5ec;
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    text-align: center;
    box-shadow: 
      8px 8px 16px rgba(163, 177, 198, 0.4),
      -8px -8px 16px rgba(255, 255, 255, 0.9);
  }

  .neumorphic-button:hover {
    box-shadow: 
      6px 6px 12px rgba(163, 177, 198, 0.4),
      -6px -6px 12px rgba(255, 255, 255, 0.9),
      inset 2px 2px 4px rgba(163, 177, 198, 0.1),
      inset -2px -2px 4px rgba(255, 255, 255, 0.7);
    transform: translateY(-2px);
    background: #e8edf4;
  }

  .neumorphic-button:active {
    box-shadow: 
      inset 6px 6px 12px rgba(163, 177, 198, 0.4),
      inset -6px -6px 12px rgba(255, 255, 255, 0.9);
    transform: translateY(0);
    background: #dce1e8;
  }

  .neumorphic-button.rounded-2xl {
    border-radius: 20px;
  }

  .neumorphic-button.h-16 {
    height: 64px;
    font-size: 1.1em;
  }

  .neumorphic-button.h-20 {
    height: 80px;
    padding: 0.75em;
  }

  .button-text {
    display: block;
    line-height: 1.4;
  }
`;

const NeumorphicButton = ({ children, onClick, className = "", ...props }) => {
  return (
    <StyledWrapper>
      <button
        role="button"
        className={`neumorphic-button ${className}`}
        onClick={onClick}
        {...props}
      >
        <span className="button-text">{children}</span>
      </button>
    </StyledWrapper>
  );
};

NeumorphicButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default NeumorphicButton;