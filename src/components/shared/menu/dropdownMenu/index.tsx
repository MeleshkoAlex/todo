import { type ReactNode } from "react";

import { Popover, type PopoverProps } from "@/components/shared/popover";

import styles from "./style.module.scss";

interface DropdownMenuProps {
  isOpen: boolean;
  anchorRef: PopoverProps["anchorRef"];
  onClose: () => void;
  children: ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  anchorRef,
  onClose,
  children,
}) => (
  <>
    <Popover isOpen={isOpen} anchorRef={anchorRef} onClose={onClose}>
      <div className={styles.dropdown}>{children}</div>
    </Popover>
    {isOpen && <div className={styles.dropdown__backdrop} />}
  </>
);
