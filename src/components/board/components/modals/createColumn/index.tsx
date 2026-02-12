import { useEffect } from "react";

import { Button } from "@/components/shared/button";
import { FieldInput } from "@/components/shared/form/input";
import { Modal, type ModalProps } from "@/components/shared/modal";
import type { TColumnValue } from "@/context/types";
import { useForm } from "@/hooks/useForm";

import styles from "./style.module.scss";

interface Props extends ModalProps {
  onSubmit: (task: TColumnValue) => void;
  initialData?: { name: string };
  isEdit?: boolean;
}

export const CreateColumnModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isEdit,
}) => {
  const form = useForm({
    initialValues: {
      name: initialData?.name || "",
    },
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
    validate: (values) => {
      if (!values.name) {
        return {
          name: "Name is required",
        };
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.resetForm();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit the column" : "Add a new column"}
    >
      <form className={styles.form} onSubmit={(e) => form.handleSubmit(e)}>
        <FieldInput
          className={styles.form__elem}
          autoFocus={isOpen}
          label="Name"
          name="name"
          value={form.values.name}
          onChange={form.handleChange}
        />
        <div className={styles.form__footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
};
