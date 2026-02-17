interface ErrorProps {
  className: string;
  message: string | null;
}

export const Error = ({ className, message }: ErrorProps) => {
  if (!message) {
    return null;
  }

  return (
    <p aria-live="assertive" className={className} role="alert">
      {message}
    </p>
  );
};
