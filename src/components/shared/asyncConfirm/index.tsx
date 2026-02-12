import { createRoot } from "react-dom/client";

import { ConfirmDialog } from "./components/dialog";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const asyncConfirm = async ({
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "No",
}: ConfirmOptions): Promise<boolean> =>
  new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const handleClose = (result: boolean) => {
      resolve(result);
      root.unmount();
      container.remove();
    };

    const root = createRoot(container);
    root.render(
      <ConfirmDialog
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={() => handleClose(true)}
        onCancel={() => handleClose(false)}
      />,
    );
  });
