import type { TextareaHTMLAttributes } from "react";

import cn from "classnames";

import { FormControl, type FormControlProps } from "../formControl";

import styles from "./style.module.scss";

interface Props
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">,
    FormControlProps {
  classNameInput?: string;
}

export const FieldTextarea: React.FC<Props> = ({
  label,
  error,
  required,
  classNameInput,
  className,
  rows = 10,
  name,
  value,
  id,
  ...props
}) => (
  <FormControl
    name={id || name}
    label={label}
    error={error}
    required={required}
    className={className}
  >
    <textarea
      {...props}
      name={name}
      rows={rows}
      id={id || `field-${name}`}
      className={cn(classNameInput, styles.textarea)}
      value={value}
    />
  </FormControl>
);
