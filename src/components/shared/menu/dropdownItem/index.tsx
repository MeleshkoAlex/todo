import React, { type ReactNode } from "react";

import cn from "classnames";

import styles from "./style.module.scss";

interface DropdownItemProps {
  onClick?: () => void;
  text: ReactNode;
  icon?: ReactNode;
  iconEnd?: React.ReactNode;
  isActive?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  text,
  icon,
  iconEnd,
  isActive,
}) => (
  <button
    type="button"
    className={cn(styles.dropdown_item, {
      [styles["dropdown_item--active"]]: isActive,
    })}
    onClick={onClick}
  >
    {icon && <span className={styles.dropdown_item__icon}>{icon}</span>}
    <span className={styles.dropdown_item__text}>{text}</span>
    {iconEnd && (
      <span className={styles.dropdown_item__icon_end}>{iconEnd}</span>
    )}
  </button>
);
