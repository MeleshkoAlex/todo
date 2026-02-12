import { type InputHTMLAttributes } from "react";

import cn from "classnames";

import { useId } from "@/hooks/useId";

import { FormControl, type FormControlProps } from "../formControl";

import styles from "./style.module.scss";

interface Props
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "name">,
    FormControlProps {
  classNameInput?: string;
}

export const FieldInput: React.FC<Props> = ({
  label,
  error,
  required,
  type = "text",
  classNameInput,
  className,
  name,
  id,
  ...props
}) => {
  const generatedId = useId();

  return (
    <FormControl
      name={id || name || generatedId}
      label={label}
      error={error}
      required={required}
      className={className}
    >
      <input
        type={type}
        name={name}
        {...props}
        id={id || (name && `field-${name}`) || generatedId}
        className={cn(classNameInput, styles.input)}
      />
    </FormControl>
  );
};
