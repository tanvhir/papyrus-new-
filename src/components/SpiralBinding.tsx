import React, { useRef, useEffect, useState } from 'react';

interface SpiralBindingProps {
  height: number;
  className?: string;
}

export const SpiralBinding: React.FC<SpiralBindingProps> = ({ height, className = '' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loopCount, setLoopCount] = useState(0);
  const uniqueId = useRef(`spiral-${Math.random().toString(36).substr(2, 9)}`);

  // Configuration via CSS variables
  const config = {
    holeSpacing: 26, // pixels between hole centers
    holeDiameter: 9, // pixels
    wireThickness: 3, // pixels
    bindingWidth: 36, // pixels
    loopWidth: 28, // pixels
    loopHeight: 10, // pixels
    wireColor: {
      light: '#c0c0c0',
      mid: '#808080',
      dark: '#505050',
      shadow: '#303030'
    }
  };

  useEffect(() => {
    console.log('[SpiralBinding] height:', height, 'loopCount:', loopCount);
    if (svgRef.current && height > 0) {
      const availableHeight = height - 40; // 20px padding top and bottom
      const calculatedLoops = Math.floor(availableHeight / config.holeSpacing);
      console.log('[SpiralBinding] calculatedLoops:', calculatedLoops);
      setLoopCount(Math.max(calculatedLoops, 1));
    }
  }, [height, config.holeSpacing]);

  const generateSpiralPath = () => {
    if (loopCount === 0) return '';

    let path = '';
    const startX = config.bindingWidth / 2;
    const startY = 20 + config.holeSpacing / 2;

    for (let i = 0; i < loopCount; i++) {
      const y = startY + i * config.holeSpacing;

      if (i === 0) {
        // Start the wire from the top
        path += `M ${startX} ${y - config.holeSpacing/2}`;
      }

      // Wire goes through the hole from back to front
      path += ` L ${startX - 2} ${y}`;

      // Front loop - smooth elliptical curve around the hole
      // Left side of loop
      path += ` C ${startX - config.loopWidth} ${y - 3}, ${startX - config.loopWidth} ${y + 3}, ${startX - 2} ${y + 2}`;

      // Wire goes back through the hole
      path += ` L ${startX + 2} ${y + 2}`;

      // Back loop (behind paper) - smaller curve
      // Right side of loop
      path += ` C ${startX + config.loopWidth * 0.6} ${y + 2}, ${startX + config.loopWidth * 0.6} ${y - 2}, ${startX + 2} ${y}`;

      // Continue to next hole
      if (i < loopCount - 1) {
        path += ` L ${startX} ${y + config.holeSpacing/2}`;
      }
    }

    return path;
  };

  const generateHoles = () => {
    if (loopCount === 0) return [];

    const holes = [];
    const startX = config.bindingWidth / 2;
    const startY = 20 + config.holeSpacing / 2;

    for (let i = 0; i < loopCount; i++) {
      const y = startY + i * config.holeSpacing;
      holes.push(
        <circle
          key={i}
          cx={startX}
          cy={y}
          r={config.holeDiameter / 2}
          fill="transparent"
          stroke="none"
        />
      );
    }

    return holes;
  };

  if (loopCount === 0) {
    console.log('[SpiralBinding] Returning null because loopCount is 0');
    return null;
  }

  console.log('[SpiralBinding] Rendering with loopCount:', loopCount, 'height:', height);

  return (
    <div
      className={`absolute left-0 top-0 bottom-0 pointer-events-none z-50 ${className}`}
      style={{ width: `${config.bindingWidth}px`, backgroundColor: 'rgba(255,0,0,0.1)' }}
    >
      <svg
        ref={svgRef}
        width={config.bindingWidth}
        height={height}
        viewBox={`0 0 ${config.bindingWidth} ${height}`}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Metallic gradient for the wire */}
          <linearGradient id={`wireGradient-${uniqueId.current}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.wireColor.light} />
            <stop offset="30%" stopColor={config.wireColor.mid} />
            <stop offset="50%" stopColor={config.wireColor.light} stopOpacity="0.9" />
            <stop offset="70%" stopColor={config.wireColor.mid} />
            <stop offset="100%" stopColor={config.wireColor.dark} />
          </linearGradient>

          {/* Shadow gradient for depth */}
          <linearGradient id={`shadowGradient-${uniqueId.current}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={config.wireColor.shadow} stopOpacity="0.4" />
            <stop offset="100%" stopColor={config.wireColor.shadow} stopOpacity="0" />
          </linearGradient>

          {/* Inner shadow for punched holes */}
          <radialGradient id={`holeShadow-${uniqueId.current}`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </radialGradient>

          {/* Drop shadow for the entire spiral */}
          <filter id={`spiralShadow-${uniqueId.current}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
          </filter>

        </defs>

        {/* Punched holes (rendered first, behind wire) */}
        <g id="holes">
          {generateHoles().map((hole, index) => (
            <g key={index}>
              {/* Hole shadow */}
              <circle
                cx={hole.props.cx}
                cy={hole.props.cy}
                r={config.holeDiameter / 2 + 2}
                fill={`url(#holeShadow-${uniqueId.current})`}
              />
              {/* Hole - dark to simulate hole */}
              <circle
                cx={hole.props.cx}
                cy={hole.props.cy}
                r={config.holeDiameter / 2}
                fill="#d4d0c8"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="1"
              />
            </g>
          ))}
        </g>

        {/* Main spiral wire */}
        <path
          d={generateSpiralPath()}
          fill="none"
          stroke={`url(#wireGradient-${uniqueId.current})`}
          strokeWidth={config.wireThickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#spiralShadow-${uniqueId.current})`}
        />

        {/* Subtle highlight on top of wire */}
        <path
          d={generateSpiralPath()}
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={config.wireThickness * 0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0, -0.5)"
        />
      </svg>
    </div>
  );
};
