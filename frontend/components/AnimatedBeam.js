import React, { useEffect, useId, useRef, useState } from "react";

export function AnimatedBeam({
  className = "",
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  pathColor = "rgba(255, 255, 255, 0.2)",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#8B5CF6",
  gradientStopColor = "#EC4899",
  delay = 0,
  duration = 2,
  startXOffset = 0,
  endXOffset = 0,
  startYOffset = 0,
  endYOffset = 0,
}) {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  const updatePath = () => {
    if (containerRef.current && fromRef.current && toRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const rectA = fromRef.current.getBoundingClientRect();
      const rectB = toRef.current.getBoundingClientRect();

      const svgWidth = containerRect.width;
      const svgHeight = containerRect.height;
      setSvgDimensions({ width: svgWidth, height: svgHeight });

      const startX =
        rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
      const startY =
        rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
      const endX =
        rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
      const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

      const controlPointX = (startX + endX) / 2;
      const controlPointY = (startY + endY) / 2 - curvature;

      const d = `M ${startX},${startY} Q ${controlPointX},${controlPointY} ${endX},${endY}`;
      setPathD(d);
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updatePath();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updatePath();

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    endXOffset,
    startYOffset,
    endYOffset,
  ]);

  return (
    <svg
      style={{
        position: "absolute",
        pointerEvents: "none",
        top: 0,
        left: 0,
        width: svgDimensions.width,
        height: svgDimensions.height,
        zIndex: 1,
      }}
      className={className}
      width={svgDimensions.width}
      height={svgDimensions.height}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        fill="none"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        fill="none"
        strokeDasharray="5 5"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="strokeDashoffset"
          values={reverse ? "0;-10" : "0;10"}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </path>
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          x2="8%"
          y1="0"
          y2="0"
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
} 