"use client";

import { AnimatePresence as PrimitiveAnimatePresence } from "motion/react";

export const AnimatePresence = (
  props: React.ComponentPropsWithoutRef<typeof PrimitiveAnimatePresence>
) => {
  return <PrimitiveAnimatePresence {...props} />;
};
