import React, { useState, useRef, useEffect, useMemo } from "react";

import cn from "classnames";

import { IconArrowRight } from "@/components/icons";

import { DropdownItem } from "../dropdownItem";

import styles from "./style.module.scss";

interface DropdownItemSubmenuProps {
  icon?: React.ReactNode;
  text: string;
  children: React.ReactNode;
}

export const DropdownItemSubmenu: React.FC<DropdownItemSubmenuProps> = ({
  icon,
  text,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const canHover = useMemo(
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    [],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onMouseEnter = () => {
    if (!canHover) return;
    setOpen(true);
  };
  const onMouseLeave = () => {
    if (!canHover) return;
    setOpen(false);
  };
  const onClick = () => {
    if (canHover) return;
    setOpen((v) => !v);
  };

  return (
    <div
      ref={itemRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={styles.wrapper}
    >
      <DropdownItem
        icon={icon}
        text={text}
        iconEnd={<IconArrowRight size={18} />}
      />

      <div
        className={cn(styles.inner, {
          [styles["inner--open"]]: open,
        })}
      >
        {children}
      </div>
    </div>
  );
};
