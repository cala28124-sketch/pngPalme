import React from 'react';
import './TextBox.css';

interface TextBoxProps {
  children: React.ReactNode;
}

function TextBox({ children }: TextBoxProps) {
  return (
    <div className="text-box-wrapper">
      <div className="text-box">{children}</div>
    </div>
  );
}

export default TextBox;
