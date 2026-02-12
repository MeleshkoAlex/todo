import React, { useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import styles from "./style.module.scss";

export interface PopoverProps<T extends HTMLElement = HTMLElement> {
  isOpen: boolean;
  anchorRef: React.RefObject<T | null>;
  onClose: () => void;
  children: React.ReactNode;
  offset?: number;
}

const POPOVER_ROOT_ID = "popover-root";

function getPopoverRoot(): HTMLElement {
  let root = document.getElementById(POPOVER_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = POPOVER_ROOT_ID;
    document.body.appendChild(root);
  }
  return root;
}

export const Popover: React.FC<PopoverProps> = ({
  isOpen,
  anchorRef,
  onClose,
  children,
  offset = 8,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const root = getPopoverRoot();

  const [style, setStyle] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();

    setStyle({
      top: rect.bottom + offset + window.scrollY,
      left: rect.left + window.scrollX,
      minWidth: rect.width,
    });
  }, [isOpen, anchorRef, offset]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !style) return null;

  return createPortal(
    <div
      ref={popoverRef}
      className={styles.popover}
      style={style}
      role="dialog"
    >
      {children}
    </div>,
    root,
  );
};
