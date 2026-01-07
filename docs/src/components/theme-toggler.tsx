"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, MotionConfig } from "motion/react";

let REACT_TOGGLE_DARK_MODE_GLOBAL_ID = 0;

const defaultProperties = {
  dark: {
    circle: {
      r: 9,
    },
    mask: {
      cx: "50%",
      cy: "23%",
    },
    svg: {
      transform: "rotate(40deg)",
    },
    lines: {
      opacity: 0,
    },
  },
  light: {
    circle: {
      r: 5,
    },
    mask: {
      cx: "100%",
      cy: "0%",
    },
    svg: {
      transform: "rotate(90deg)",
    },
    lines: {
      opacity: 1,
    },
  },
  springConfig: { type: "spring" as const, stiffness: 250, damping: 35, mass: 4 },
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [id, setId] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Update toggled state when theme changes or component mounts
  useEffect(() => {
    if (mounted) {
      setIsToggled(theme === "dark");
    }
  }, [theme, mounted]);

  useEffect(() => {
    REACT_TOGGLE_DARK_MODE_GLOBAL_ID += 1;
    setId(REACT_TOGGLE_DARK_MODE_GLOBAL_ID);
  }, [setId]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const { circle, svg, lines, mask } =
    defaultProperties[isToggled ? "dark" : "light"];

  const uniqueMaskId = `circle-mask-${id}`;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle Theme"
      onClick={toggleTheme}
      className={cn(
        "flex ring-0 shrink-0 md:w-[3.56rem] md:h-14 md:border-l md:text-muted-foreground max-md:-mr-1.5 max-md:hover:bg-transparent relative overflow-hidden"
      )}
    >
      <MotionConfig transition={defaultProperties.springConfig}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          className={"dark:text-white text-black size-5"}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
          animate={{
            transform: svg.transform,
          }}
        >
          <mask id={uniqueMaskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.circle
              animate={{
                cx: mask.cx,
                cy: mask.cy,
              }}
              initial={{
                cx: mask.cx,
                cy: mask.cy,
              }}
              r="9"
              fill="black"
            />
          </mask>

          <motion.circle
            cx="12"
            cy="12"
            animate={{
              r: circle.r,
            }}
            className={"dark:fill-white fill-black"}
            initial={{
              r: circle.r,
            }}
            mask={`url(#${uniqueMaskId})`}
          />
          <motion.g
            stroke="currentColor"
            animate={{
              opacity: lines.opacity,
            }}
            initial={{
              opacity: lines.opacity,
            }}
          >
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </motion.g>
        </motion.svg>
      </MotionConfig>
    </Button>
  );
}
