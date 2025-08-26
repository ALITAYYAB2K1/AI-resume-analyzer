import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const generateUUID = (): string => {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof (crypto as any).randomUUID === "function"
    ) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  // RFC4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
