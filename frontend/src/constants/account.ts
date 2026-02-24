import type { FieldErrors, NewMemberFieldErrors } from 'src/interfaces/accountForm.ts';

export const MIN_BIRTH_YEAR = 1900;
export const CURRENT_YEAR = new Date().getFullYear();
export const EMPTY_COUNTRY_VALUE = '' as const;

export const DEFAULT_FIELD_ERRORS: FieldErrors = {
  birthYear: null,
  name: null,
};

export const DEFAULT_NEW_MEMBER_FIELD_ERRORS: NewMemberFieldErrors = {
  birthYear: null,
  country: null,
  name: null,
};
