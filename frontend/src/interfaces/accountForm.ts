import type { CountryCode } from '@backend/contracts';

export type AccountCountryValue = CountryCode | '';

export type FieldErrors = {
  birthYear: string | null;
  name: string | null;
};

export type NewMemberFieldErrors = FieldErrors & {
  country: string | null;
};
