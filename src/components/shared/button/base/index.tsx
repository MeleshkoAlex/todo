import React from "react";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import cn from "classnames";

import styles from "./style.module.scss";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "border";

interface BaseButtonProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  icon?: React.ReactNode;
}

export type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & BaseButtonProps
>;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  className,
  type = "button",
  ...props
}) => {
  const classes = cn(styles.button, className, {
    [styles[`button--${variant}`]]: variant,
    [styles["button--full"]]: fullWidth,
  });

  return (
    <button type={type} className={classes} {...props}>
      {props.icon && <span className={styles.button__icon}>{props.icon}</span>}
      {children}
    </button>
  );
};
