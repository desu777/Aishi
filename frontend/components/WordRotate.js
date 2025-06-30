"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// Simple className utility function
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function WordRotate({
  words,
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
  style,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div style={{ overflow: 'hidden', padding: '8px 0' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={words[index]}
          className={cn(className)}
          style={style}
          {...motionProps}
        >
          {words[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 