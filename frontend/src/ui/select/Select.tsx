import { type ComponentPropsWithoutRef,forwardRef } from 'react';

export type SelectProps = ComponentPropsWithoutRef<'select'>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  return <select ref={ref} {...props} />;
});
