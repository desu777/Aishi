import React from "react";

// Simple className utility function
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "50px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <>
        <style jsx>{`
          @keyframes shimmer-slide {
            to {
              transform: translate(calc(100cqw - 100%), 0);
            }
          }
          @keyframes spin-around {
            0% {
              transform: translateZ(0) rotate(0);
            }
            15%,
            35% {
              transform: translateZ(0) rotate(90deg);
            }
            65%,
            85% {
              transform: translateZ(0) rotate(270deg);
            }
            100% {
              transform: translateZ(0) rotate(360deg);
            }
          }
          .shimmer-button {
            --spread: 90deg;
            --shimmer-color: ${shimmerColor};
            --radius: ${borderRadius};
            --speed: ${shimmerDuration};
            --cut: ${shimmerSize};
            --bg: ${background};
          }
          .shimmer-slide {
            animation: shimmer-slide var(--speed) ease-in-out infinite alternate;
          }
          .spin-around {
            animation: spin-around calc(var(--speed) * 2) infinite linear;
          }
        `}</style>
        <button
          ref={ref}
          className={cn("shimmer-button", className)}
          style={{
            position: 'relative',
            zIndex: 0,
            display: 'flex',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '18px 36px',
            color: 'white',
            background: 'var(--bg)',
            borderRadius: 'var(--radius)',
            transformOrigin: 'center',
            transition: 'transform 300ms ease-in-out',
            ...style
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          {...props}
        >
          {/* spark container */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: -30,
              filter: 'blur(2px)',
              overflow: 'visible',
              containerType: 'size'
            }}
          >
            {/* spark */}
            <div 
              className="shimmer-slide"
              style={{
                position: 'absolute',
                inset: 0,
                height: '100cqh',
                aspectRatio: '1',
                borderRadius: 0,
                mask: 'none'
              }}
            >
              {/* spark before */}
              <div 
                className="spin-around"
                style={{
                  position: 'absolute',
                  inset: '-100%',
                  width: 'auto',
                  rotate: '0deg',
                  background: 'conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0, var(--shimmer-color) var(--spread), transparent var(--spread))',
                  transform: 'translate(0, 0)'
                }}
              />
            </div>
          </div>
          
          {children}

          {/* Highlight */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              borderRadius: '32px',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: 'inset 0 -8px 10px rgba(255, 255, 255, 0.12)',
              transition: 'all 300ms ease-in-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 0 -6px 10px rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'inset 0 -8px 10px rgba(255, 255, 255, 0.12)'}
          />

          {/* backdrop */}
          <div
            style={{
              position: 'absolute',
              zIndex: -20,
              background: 'var(--bg)',
              borderRadius: 'var(--radius)',
              inset: 'var(--cut)'
            }}
          />
        </button>
      </>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton"; 