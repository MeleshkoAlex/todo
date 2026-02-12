import type { InputHTMLAttributes } from "react";

import { IconCheck } from "@/components/icons";
import { useId } from "@/hooks/useId";

import { FormControl, type FormControlProps } from "../formControl";

import styles from "./style.module.scss";

interface Props
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "value">,
    FormControlProps {
  value?: boolean;
}
export const FieldCheckbox: React.FC<Props> = ({
  label,
  error,
  required,
  name,
  id,
  value,
  ...props
}) => {
  const generatedId = useId();

  return (
    <FormControl
      name={id || name || generatedId}
      label={label}
      error={error}
      required={required}
    >
      <div className={styles.checkbox}>
        <input
          {...props}
          checked={value}
          id={id || (name && `field-${name}`) || generatedId}
          type="checkbox"
          className={styles.checkbox__input}
        />
        <div data-type="marker" className={styles.checkbox__marker}>
          <div data-type="check" className={styles.checkbox__check}>
            <IconCheck size={16} color="var(--color-white)" />
          </div>
        </div>
      </div>
    </FormControl>
  );
};
