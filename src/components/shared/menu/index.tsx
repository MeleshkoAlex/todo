import React, { useRef, useState } from "react";

import { IconMoreVertical } from "@/components/icons";

import { Button, ButtonIcon, type ButtonProps } from "../button";

import { DropdownMenu } from "./dropdownMenu";
import { DropdownItem } from "./dropdownItem";
import { DropdownItemSubmenu } from "./dropdownItemSubmenu";

interface MenuItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  items?: MenuItem[];
  isActive?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  buttonOptions?: ButtonProps;
}

export const Menu: React.FC<MenuProps> = ({ items, buttonOptions }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const handleClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }

    setOpen(false);
  };

  return (
    <>
      {buttonOptions ? (
        <Button
          ref={buttonRef}
          {...buttonOptions}
          onClick={() => setOpen((v) => !v)}
        />
      ) : (
        <ButtonIcon ref={buttonRef} onClick={() => setOpen((v) => !v)}>
          <IconMoreVertical size={16} />
        </ButtonIcon>
      )}

      <DropdownMenu
        isOpen={open}
        anchorRef={buttonRef}
        onClose={() => setOpen(false)}
      >
        {items.map((item, index) =>
          item.items ? (
            <DropdownItemSubmenu key={index} icon={item.icon} text={item.label}>
              {item.items.map((subItem, subIndex) => (
                <DropdownItem
                  key={subIndex}
                  isActive={subItem.isActive}
                  icon={subItem.icon}
                  text={subItem.label}
                  onClick={() => handleClick(subItem.onClick)}
                />
              ))}
            </DropdownItemSubmenu>
          ) : (
            <DropdownItem
              key={index}
              icon={item.icon}
              text={item.label}
              onClick={() => handleClick(item.onClick)}
            />
          ),
        )}
      </DropdownMenu>
    </>
  );
};
