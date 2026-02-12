import { Button } from "@/components/shared/button";

import styles from "./style.module.scss";

interface ConfirmDialogProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <div className={styles.confirm}>
    <div className={styles.confirm__backdrop} onClick={onCancel} />

    <div className={styles.confirm__box}>
      {title && <h3 className={styles.confirm__title}>{title}</h3>}
      <p className={styles.confirm__message}>{message}</p>

      <div className={styles.confirm__actions}>
        <Button variant="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm}>{confirmText}</Button>
      </div>
    </div>
  </div>
);
