import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function TiltedCard({
  children,
  containerHeight = "100%",
  containerWidth = "100%",
  scaleOnHover = 1.05,
  rotateAmplitude = 8,
  showMobileWarning = false,
  showTooltip = false,
  className = "",
  style = {},
  ...props
}) {
  const ref = useRef(null);

  const x = useMotionValue();
  const y = useMotionValue();
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);

  const [lastY, setLastY] = useState(0);

  function handleMouse(e) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight,
        perspective: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {showMobileWarning && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          display: window.innerWidth <= 640 ? 'block' : 'none'
        }}>
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <motion.div
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
          rotateX,
          rotateY,
          scale,
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
} 