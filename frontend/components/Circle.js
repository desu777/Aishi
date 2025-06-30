import React, { forwardRef } from "react";

const Circle = forwardRef(({ className = "", children, size = "64px", style = {}, ...props }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        zIndex: 10,
        display: "flex",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "2px solid rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        padding: "12px",
        boxShadow: "0 0 20px -12px rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        ...style
      }}
      className={className}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
      }}
      {...props}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default Circle; 