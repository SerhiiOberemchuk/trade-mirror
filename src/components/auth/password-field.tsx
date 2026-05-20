"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  autoComplete: React.HTMLInputAutoCompleteAttribute;
  label: string;
  maxLength?: number;
  minLength?: number;
  name: string;
  placeholder: string;
};

export function PasswordField({
  autoComplete,
  label,
  maxLength,
  minLength,
  name,
  placeholder,
}: PasswordFieldProps) {
  const inputId = useId();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="block">
      <label className="text-sm font-medium" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          className="w-full rounded-lg border border-border bg-background py-3 pl-3 pr-12 text-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          autoComplete={autoComplete}
          id={inputId}
          maxLength={maxLength}
          minLength={minLength}
          name={name}
          placeholder={placeholder}
          required
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="m3 3 18 18" />
              <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c5 0 8.5 4.5 9.5 6-.4.7-1.4 1.9-2.8 3.1" />
              <path d="M6.5 6.6C4.5 7.9 3.2 9.8 2.5 11c1 1.5 4.5 6 9.5 6 1.9 0 3.6-.7 5-1.6" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
