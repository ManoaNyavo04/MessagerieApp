import styled from '@emotion/styled';
import React, { ReactNode } from 'react';


interface StyledBoxProps {
  isActive: boolean;
  bgActive: string;
  bgColor: string;
}
const StyledBox = styled.div<StyledBoxProps>`
  cursor: pointer;
  outline: none;
  background-color: ${(props) => (props.isActive ? props.bgActive : props.bgColor)};
  &:focus {
    border: 1px solid green;
  }
`;

interface SelectableBoxProps {
//   isActive: boolean;
  onClick: () => void;
  bgActive?: string;
  bgColor?: string;
  children?: ReactNode;
}

const SelectBox: React.FC<SelectableBoxProps> = ({ onClick, bgActive='#acb2d5', bgColor = 'inherit', children = 'blue' }) => {
  return (
    <StyledBox
          //   isActive={isActive}
          onClick={onClick}
          onKeyDown={(e) => {
              if (e.key === 'Enter') onClick();
          } }
          tabIndex={0}
          role="button" bgActive={bgActive} bgColor={bgColor} isActive={false}>
      {children}
    </StyledBox>
  );
};
export default SelectBox;
