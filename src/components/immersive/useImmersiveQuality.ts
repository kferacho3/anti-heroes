"use client";

import { useEffect, useState } from "react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

export type ImmersiveQuality = "low" | "medium" | "high";

export function useImmersiveQuality() {
  const reduceMotion = useReducedMotionSafe();
  const [quality, setQuality] = useState<ImmersiveQuality>("medium");

  useEffect(() => {
    const detect = () => {
      const width = window.innerWidth;
      const dpr = window.devicePixelRatio || 1;
      const coarse = window.matchMedia("(pointer: coarse)").matches;

      if (reduceMotion || width < 740 || coarse) {
        setQuality("low");
        return;
      }

      if (width > 1280 && dpr <= 2) {
        setQuality("high");
        return;
      }

      setQuality("medium");
    };

    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, [reduceMotion]);

  return { quality, reduceMotion };
}
