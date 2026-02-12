import type { IDragDirection } from "@/types/common";

export const isEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;

  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isEqual(objA[key], objB[key])) return false;
  }

  return true;
};

export const getHash = () => Math.random().toString(36);

export const getEdgeHorizontal = (value: IDragDirection | null) => {
  if (value === "left") return "left";
  if (value === "right") return "right";
  return "right";
};

export const getEdgeVertical = (value: IDragDirection | null) => {
  if (value === "top") return "top";
  if (value === "bottom") return "bottom";
  return "bottom";
};
