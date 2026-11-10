/**
 * Layout container — caps width on wide screens, gives consistent gutters.
 */
import type { HTMLAttributes, ReactElement, ReactNode } from "react";

import { cn } from "../lib/cn";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
};

const SIZE_CLASS: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function Container({
  size = "lg",
  className,
  children,
  ...rest
}: ContainerProps): ReactElement {
  return (
    <div
      className={cn("mx-auto w-full px-6 sm:px-8 lg:px-12", SIZE_CLASS[size], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
