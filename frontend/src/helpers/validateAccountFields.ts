import type { TFunction } from 'i18next'
import type { FieldErrors } from 'src/interfaces/accountForm.ts'
import { CURRENT_YEAR, MIN_BIRTH_YEAR } from 'src/constants/account.ts'

export const validateAccountFields = (
  t: TFunction,
  input: { birthYear: string; name: string },
): {
  birthYear: number | null;
  errors: FieldErrors;
  isValid: boolean;
  trimmedName: string;
} => {
  const trimmedName = input.name.trim();
  const nextErrors: FieldErrors = {
    birthYear: null,
    name: null,
  };

  if (!trimmedName) {
    nextErrors.name = t('account.validation.nameRequired');
  }

  const parsedBirthYear = Number.parseInt(input.birthYear, 10);
  const isBirthYearInteger = Number.isInteger(parsedBirthYear);

  if (!isBirthYearInteger || String(parsedBirthYear) !== input.birthYear.trim()) {
    nextErrors.birthYear = t('account.validation.birthYearInvalid', { max: CURRENT_YEAR, min: MIN_BIRTH_YEAR });
  } else if (parsedBirthYear < MIN_BIRTH_YEAR || parsedBirthYear > CURRENT_YEAR) {
    nextErrors.birthYear = t('account.validation.birthYearInvalid', { max: CURRENT_YEAR, min: MIN_BIRTH_YEAR });
  }

  return {
    birthYear: isBirthYearInteger ? parsedBirthYear : null,
    errors: nextErrors,
    isValid: !nextErrors.name && !nextErrors.birthYear,
    trimmedName,
  };
};
