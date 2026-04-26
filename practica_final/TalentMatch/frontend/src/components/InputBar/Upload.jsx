import React from "react";

function Upload({clicked}){
  const togglePopup = () => {
    if (clicked) {
      clicked();
    }
  };

  return (
    <button 
      type="button" 
      onClick={togglePopup}
      aria-label="Upload files"
      style={{
        padding: '1rem 1.25rem',
        fontSize: '1rem',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: 'white',
        color: 'rgb(147, 51, 234)',
        border: '2px solid rgb(221, 214, 254)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        outline: 'none',
        position: 'relative',
        zIndex: 1,
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'rgb(250, 245, 255)';
        e.target.style.borderColor = 'rgb(196, 181, 253)';
        e.target.style.transform = 'scale(1.05)';
        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'white';
        e.target.style.borderColor = 'rgb(221, 214, 254)';
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
      }}
      onMouseDown={(e) => {
        e.target.style.transform = 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        e.target.style.transform = 'scale(1.05)';
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'rgb(196, 181, 253)';
        e.target.style.boxShadow = '0 0 0 4px rgba(196, 181, 253, 0.3)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'rgb(221, 214, 254)';
        e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
      }}
    >
      Upload
    </button>
  );
}

export default Upload;
