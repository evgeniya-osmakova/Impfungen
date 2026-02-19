import { VACCINATION_VALIDATION_ERROR_CODE } from 'src/constants/vaccinationValidation.ts'

export type VaccinationValidationErrorCode =
  (typeof VACCINATION_VALIDATION_ERROR_CODE)[keyof typeof VACCINATION_VALIDATION_ERROR_CODE];
