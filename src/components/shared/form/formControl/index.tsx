import { type PropsWithChildren } from "react";

import cn from "classnames";

import styles from "./style.module.scss";

export interface FormControlProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  name?: string;
}

export const FormControl: React.FC<PropsWithChildren<FormControlProps>> = ({
  label,
  error,
  required = false,
  children,
  className,
  name,
}) => (
  <div className={cn(styles.control, className)}>
    {label && (
      <label htmlFor={name} className={styles.control__label}>
        {label}
        {required && <span className={styles.control__required}>*</span>}
      </label>
    )}

    <div className={styles.control__field}>{children}</div>

    {error && <div className={styles.control__error}>{error}</div>}
  </div>
);
