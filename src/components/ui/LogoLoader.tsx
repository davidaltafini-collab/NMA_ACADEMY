import React from 'react';

interface LogoLoaderProps {
  className?: string;
  size?: number | string;
  minHeight?: number | string;
}

const LogoLoader: React.FC<LogoLoaderProps> = ({
  className = '',
  size = 280,
  minHeight = 200,
}) => {
  const cssSize = typeof size === "number" ? `${size}px` : size;
  const cssMinHeight = typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  return (
    <div
      className={`nma-loader-wrapper ${className}`.trim()}
      style={{
        "--nma-loader-size": cssSize,
        "--nma-loader-min-height": cssMinHeight,
      } as React.CSSProperties}
    >
      <style>{`
        .nma-loader-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: var(--nma-loader-min-height, 200px);
        }

        .nma-animated-svg {
          width: var(--nma-loader-size, 280px); 
          height: auto;
          animation: popPulse 2s ease-in-out infinite; 
          /* Forțăm randarea pe placa video (GPU) pentru 60 de cadre pe secundă */
          transform: translateZ(0);
        }

        .nma-draw-path {
          fill: transparent;
          stroke: #79738c;
          stroke-width: 100px;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          will-change: stroke-dashoffset, fill; 
          
          /* AICI E SCHIMBAREA: 0.6s pentru desenare + 0.3s umplerea care începe la secunda 0.6 */
          animation: drawContour 0.4s linear forwards, fillIn 0.3s ease-in-out 0.4s forwards;
        }

        @keyframes popPulse {
          0% { transform: scale(0.97) translateZ(0); }
          50% { transform: scale(1.03) translateZ(0); }
          100% { transform: scale(0.97) translateZ(0); }
        }

        @keyframes drawContour {
          to { stroke-dashoffset: 0; }
        }

        @keyframes fillIn {
          to {
            fill: #79738c;
            stroke-width: 0;
          }
        }
      `}</style>

      <svg 
        className="nma-animated-svg"
        viewBox="0 0 9294 9018" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
      >
        <g>
          {/* Am adăugat pathLength="1" pe fiecare literă. Asta rezolvă tot! */}
          <path className="nma-draw-path" pathLength="1" d="M3179.064,2892.245l0,3302.826l-1652.911,-1541.317l0,1321.128l-734.628,0l0,-3302.823l1652.911,1651.41l0,-1211.035l-183.655,-220.189l918.283,0Z" />
          <path className="nma-draw-path" pathLength="1" d="M4894.417,6415.26l-734.625,-1902.428l0,1462.05l-734.628,0l0,-3082.637l-183.658,-220.186l1014.003,308.124l638.908,1824.33l620.531,-1824.33l984.837,-308.124l-178.375,220.186l0,3082.637l-713.498,0l0,-1462.05l-713.495,1902.428Z" />
          <path className="nma-draw-path" pathLength="1" d="M7869.658,2892.245l918.283,3082.637l-734.625,0l-60.608,-220.186l-865.024,0l279.16,-880.756l339.765,0l-244.263,-880.753l-646.472,1981.695l-988.074,880.756l1217.645,-3811.462l-126.723,-151.931l910.937,0Z" />
        </g>
      </svg>
    </div>
  );
};

export default LogoLoader;
