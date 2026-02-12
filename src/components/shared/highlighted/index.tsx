import React, { useMemo } from "react";

import { useContextApp } from "@/context";

import styles from "./style.module.scss";

interface Props extends React.PropsWithChildren {
  className?: string;
  [key: string]: unknown;
}

export const Highlighted: React.FC<Props> = ({
  children,
  className,
  ...rest
}) => {
  const { search } = useContextApp();

  const highlightedContent = useMemo(() => {
    if (typeof children !== "string" || !search) {
      return children;
    }

    const regex = new RegExp(`(${search})`, "gi");

    return children.split(regex).map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={index} className={styles.highlight}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  }, [children, search]);

  return (
    <p className={className} {...rest}>
      {highlightedContent}
    </p>
  );
};
