import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isEqual } from "@/utils/helper";

type Errors<T> = Partial<Record<keyof T, string>>;
type Touched<T> = Partial<Record<keyof T, boolean>>;

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Errors<T> | undefined;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const initialValuesRef = useRef(initialValues);
  const validateRef = useRef(validate);

  const [countSubmit, setCountSubmit] = useState(0);
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [touched, setTouched] = useState<Touched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  validateRef.current = validate;

  const dirty = useMemo(
    () => !isEqual(initialValuesRef.current, values),
    [values],
  );

  useEffect(() => {
    if (!isEqual(initialValuesRef.current, initialValues)) {
      initialValuesRef.current = initialValues;
      setValues(initialValues);
      setErrors({});
      setTouched({});
    }
  }, [initialValues]);

  const runValidate = useCallback((vals: T) => {
    const validationErrors = validateRef.current?.(vals) ?? {};
    setErrors(validationErrors);

    return validationErrors;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target;
      const { name, value } = target;

      let val: string | boolean = value;

      if (target instanceof HTMLInputElement) {
        val = target.type === "checkbox" ? target.checked : value;
      }

      setValues((prev) => {
        const newState = {
          ...prev,
          [name]: val,
        };

        if (countSubmit) {
          runValidate(newState);
        }

        return newState;
      });
    },
    [setValues, countSubmit, runValidate],
  );
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    [],
  );

  const setFieldValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const setFieldError = useCallback(
    <K extends keyof T>(name: K, error?: string) => {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [],
  );

  const setErrorsManually = useCallback((errors: Errors<T>) => {
    setErrors(errors);
  }, []);

  const resetForm = useCallback(
    (nextValues?: T) => {
      const vals = nextValues ?? initialValuesRef.current;
      initialValuesRef.current = vals;
      setValues(vals);
      setErrors({});
      setTouched({});
      setCountSubmit(0);
    },
    [setValues, setErrors, setTouched],
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setCountSubmit((prev) => prev + 1);

    const validationErrors = runValidate(values);
    if (Object.keys(validationErrors).length > 0) {
      setTouched(
        Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Touched<T>,
        ),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = useMemo(() => !Object.keys(errors).length, [errors]);

  const canSubmit = dirty && !isSubmitting && isValid;

  return {
    dirty,
    values,
    errors,
    touched,
    isSubmitting,
    canSubmit,
    isValid,
    countSubmit,

    handleChange,
    handleBlur,
    handleSubmit,

    setFieldValue,
    setFieldError,
    setErrors: setErrorsManually,
    setValues,
    resetForm,
  };
}
