import { ARIA_LIVE, HTML_ROLE } from 'src/constants/ui';

interface ErrorProps {
  className: string;
  message: string | null;
}

export const Error = ({ className, message }: ErrorProps) => {
  if (!message) {
    return null;
  }

  return (
    <p aria-live={ARIA_LIVE.assertive} className={className} role={HTML_ROLE.alert}>
      {message}
    </p>
  );
};
