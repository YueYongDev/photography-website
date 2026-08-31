"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type AnimationSnapshot = {
  filter: string;
  opacity: number;
  y: number;
};

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: AnimationSnapshot;
  animationTo?: AnimationSnapshot[];
  easing?: (value: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const buildKeyframes = (
  from: AnimationSnapshot,
  steps: AnimationSnapshot[],
) => ({
  filter: [from.filter, ...steps.map((step) => step.filter)],
  opacity: [from.opacity, ...steps.map((step) => step.opacity)],
  y: [from.y, ...steps.map((step) => step.y)],
});

// Adapted from React Bits' official Blur Text component (TS / CSS variant).
const BlurText = ({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (value) => value,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) => {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;

    if (reduceMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduceMotion, rootMargin, threshold]);

  const defaultFrom = useMemo<AnimationSnapshot>(
    () => ({
      filter: "blur(10px)",
      opacity: 0,
      y: direction === "top" ? -24 : 24,
    }),
    [direction],
  );

  const defaultTo = useMemo<AnimationSnapshot[]>(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 4 : -4,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, index) =>
    stepCount === 1 ? 0 : index / (stepCount - 1),
  );
  const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

  return (
    <p ref={ref} className={className}>
      {elements.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          initial={reduceMotion ? false : fromSnapshot}
          animate={
            reduceMotion || inView ? animateKeyframes : fromSnapshot
          }
          transition={{
            duration: reduceMotion ? 0 : totalDuration,
            times,
            delay: reduceMotion ? 0 : (index * delay) / 1000,
            ease: easing,
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
          style={{
            display: "inline-block",
            willChange: "transform, filter, opacity",
          }}
        >
          {segment === " " ? "\u00a0" : segment}
          {animateBy === "words" && index < elements.length - 1
            ? "\u00a0"
            : null}
        </motion.span>
      ))}
    </p>
  );
};

export default BlurText;
