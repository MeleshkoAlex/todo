import { useEffect } from "react";

import { Button } from "@/components/shared/button";
import { FieldInput } from "@/components/shared/form/input";
import { Modal, type ModalProps } from "@/components/shared/modal";
import { FieldTextarea } from "@/components/shared/form/textarea";
import type { TItemValue } from "@/context/types";
import { useForm } from "@/hooks/useForm";

import styles from "./style.module.scss";

interface Props extends ModalProps {
  onSubmit: (task: TItemValue) => void;
  initialData?: TItemValue;
  isEdit?: boolean;
}

export const CreateTaskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isEdit,
}) => {
  const form = useForm({
    initialValues: {
      name: initialData?.name || "",
      context: initialData?.context || "",
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
      title={isEdit ? "Edit task" : "Add a new task"}
    >
      <form className={styles.form} onSubmit={form.handleSubmit}>
        <FieldInput
          autoFocus={isOpen}
          className={styles.form__elem}
          label="Name"
          name="name"
          value={form.values.name}
          error={form.errors.name}
          onChange={form.handleChange}
        />
        <FieldTextarea
          className={styles.form__elem}
          label="Description"
          name="context"
          value={form.values.context}
          error={form.errors.context}
          onChange={form.handleChange}
        />
        <div className={styles.form__footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!form.canSubmit}>
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
