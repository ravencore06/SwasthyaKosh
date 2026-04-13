import React from 'react';

const CircularText = ({ 
  text = "SWASTHYAKOSH • SECURE RECORDS • SWASTHYAKOSH • SECURE RECORDS • ", 
  size = 180, 
  radius = 125,
  color = "currentColor" 
}) => {
  const cx = 125.25;
  const cy = 125.25;
  const startX = cx - radius;
  const startY = cy;
  const pathData = `M ${startX}, ${startY} A ${radius}, ${radius} 0 1,1 ${cx + radius}, ${startY} A ${radius}, ${radius} 0 1,1 ${startX}, ${startY}`;

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>
        {`
          @keyframes spin-circle {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 250.5 250.5"
        style={{ 
          animation: 'spin-circle 25s linear infinite', 
          color: color, 
          overflow: 'visible' 
        }}
      >
        <path 
          d={pathData} 
          id="custom-circular-path" 
          fill="none"
        ></path>
        <text 
          style={{ 
            fontSize: '19px', 
            fontWeight: '600', 
            letterSpacing: '5px', 
            fill: 'currentColor', 
            fontFamily: 'inherit' 
          }}
        >
          <textPath href="#custom-circular-path" startOffset="0%">
            {text.split(/(swasthyakosh)/i).map((part, index) => 
               part.toLowerCase() === 'swasthyakosh' ? 
                 <tspan key={index} style={{ fill: 'brown', fontWeight: '800' }}>{part}</tspan> : 
                 part
            )}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default CircularText;
