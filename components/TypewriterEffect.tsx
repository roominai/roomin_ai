"use client";

import { useEffect, useState } from "react";

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export default function TypewriterEffect({
  text,
  speed = 50,
  delay = 0,
  className = "",
}: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Delay inicial antes de começar a digitar
    timeout = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, isTyping, speed, text]);

  return <span className={className}>{displayText}</span>;
}