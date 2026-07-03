import React, { useRef } from 'react';

interface SpiralBindingProps {
  height: number;
  className?: string;
  pageHeight?: number;
  pageGap?: number;
}

export const SpiralBinding: React.FC<SpiralBindingProps> = ({ height, className = '', pageHeight = 0, pageGap = 0 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
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

  // Calculate number of pages - only count pages that have actual content
  const numPages = pageHeight > 0 ? Math.ceil(height / (pageHeight + pageGap)) : 1;

  const generatePageSegments = () => {
    const segments = [];

    for (let page = 0; page < numPages; page++) {
      const pageTop = page * (pageHeight + pageGap);
      const pageBottom = pageTop + pageHeight;
      const pageHeightActual = Math.min(pageHeight, height - pageTop);

      // Skip if this page is beyond the actual content height
      if (pageHeightActual <= 0) continue;

      // Skip if this is a trailing empty page (last page with minimal content)
      const isLastPage = page === numPages - 1;
      const contentInLastPage = height - pageTop;
      if (isLastPage && contentInLastPage < 100) continue;

      const availableHeight = pageHeightActual - 40;
      const calculatedLoops = Math.floor(availableHeight / config.holeSpacing);
      const loopCount = Math.max(1, calculatedLoops);

      segments.push({
        page,
        top: pageTop,
        height: pageHeightActual,
        loopCount
      });
    }

    return segments;
  };

  const pageSegments = generatePageSegments();

  if (pageSegments.length === 0) return null;

  const generateSpiralPath = (loopCount: number, startY: number) => {
    if (loopCount === 0) return '';

    let path = '';
    const startX = config.bindingWidth / 2;

    for (let i = 0; i < loopCount; i++) {
      const y = startY + i * config.holeSpacing;

      if (i === 0) {
        path += `M ${startX} ${y - config.holeSpacing/2}`;
      }

      path += ` L ${startX - 2} ${y}`;
      path += ` C ${startX - config.loopWidth} ${y - 3}, ${startX - config.loopWidth} ${y + 3}, ${startX - 2} ${y + 2}`;
      path += ` L ${startX + 2} ${y + 2}`;
      path += ` C ${startX + config.loopWidth * 0.6} ${y + 2}, ${startX + config.loopWidth * 0.6} ${y - 2}, ${startX + 2} ${y}`;

      if (i < loopCount - 1) {
        path += ` L ${startX} ${y + config.holeSpacing/2}`;
      }
    }

    return path;
  };

  const generateHoles = (loopCount: number, startY: number) => {
    if (loopCount === 0) return [];

    const holes = [];
    const startX = config.bindingWidth / 2;

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

  return (
    <div className={`absolute left-0 top-0 bottom-0 pointer-events-none z-50 ${className}`} style={{ width: `${config.bindingWidth}px` }}>
      {pageSegments.map((segment) => {
        const startY = 20 + config.holeSpacing / 2;
        const holes = generateHoles(segment.loopCount, startY);
        const spiralPath = generateSpiralPath(segment.loopCount, startY);

        return (
          <div
            key={segment.page}
            className="absolute left-0 overflow-hidden"
            style={{
              top: `${segment.top}px`,
              height: `${segment.height}px`,
              width: `${config.bindingWidth}px`
            }}
          >
            <svg
              width={config.bindingWidth}
              height={segment.height}
              viewBox={`0 0 ${config.bindingWidth} ${segment.height}`}
              preserveAspectRatio="none"
              style={{ display: 'block' }}
            >
              <defs>
                <linearGradient id={`wireGradient-${uniqueId.current}-${segment.page}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={config.wireColor.light} />
                  <stop offset="30%" stopColor={config.wireColor.mid} />
                  <stop offset="50%" stopColor={config.wireColor.light} stopOpacity="0.9" />
                  <stop offset="70%" stopColor={config.wireColor.mid} />
                  <stop offset="100%" stopColor={config.wireColor.dark} />
                </linearGradient>
                <radialGradient id={`holeShadow-${uniqueId.current}-${segment.page}`} cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="#000000" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
                </radialGradient>
                <filter id={`spiralShadow-${uniqueId.current}-${segment.page}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
                </filter>
              </defs>
              <g id="holes">
                {holes.map((hole, index) => (
                  <g key={index}>
                    <circle
                      cx={hole.props.cx}
                      cy={hole.props.cy}
                      r={config.holeDiameter / 2 + 2}
                      fill={`url(#holeShadow-${uniqueId.current}-${segment.page})`}
                    />
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
              <path
                d={spiralPath}
                fill="none"
                stroke={`url(#wireGradient-${uniqueId.current}-${segment.page})`}
                strokeWidth={config.wireThickness}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#spiralShadow-${uniqueId.current}-${segment.page})`}
              />
              <path
                d={spiralPath}
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
      })}
    </div>
  );
};
