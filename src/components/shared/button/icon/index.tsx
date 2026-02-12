import React from "react";

import cn from "classnames";

import { Button, type ButtonProps } from "../base";

import styles from "./style.module.scss";

export type ButtonIconProps = Omit<ButtonProps, "variant" | "fullWidth">;

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  children,
  className,
  type = "button",
  ...props
}) => (
  <Button
    variant="ghost"
    type={type}
    className={cn(styles.button_icon, className)}
    {...props}
  >
    {children}
  </Button>
);
