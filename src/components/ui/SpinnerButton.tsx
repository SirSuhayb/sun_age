import React, { useState } from "react";
import { PulsingStarSpinner } from "./PulsingStarSpinner";

// SpinnerButton component
export function SpinnerButton({ onClick, children, isSubmitting, delay = 500, className = "", ...props }: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  children: React.ReactNode;
  isSubmitting?: boolean;
  delay?: number;
  className?: string;
  [x: string]: any;
}) {
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isSubmitting !== undefined) {
      setIsLoading(isSubmitting);
    }
  }, [isSubmitting]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isSubmitting === undefined) {
      setIsLoading(true);
    }
    await onClick?.(e);
    if (isSubmitting === undefined) {
      setTimeout(() => setIsLoading(false), delay);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={className + " flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"}
    >
      {isLoading && <PulsingStarSpinner />}
      {children}
    </button>
  );
} 