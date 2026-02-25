import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  APP_LANGUAGE_VALUES,
  COUNTRY_CODE_VALUES,
  DOSE_KIND_VALUES,
  REPEAT_UNIT_VALUES,
} from '../modules/profile/profileTypes.js';
import {
  OptimisticConcurrencyError,
  ProfileAccountNotFoundError,
  ProfilePrimaryAccountDeletionError,
} from '../modules/profile/profileRepository.js';

import { publicProcedure, router } from './trpc.js';
import type { TrpcContext } from './trpc.js';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoDateTimeSchema = z.string().datetime({ offset: true });
const currentYear = new Date().getFullYear();
const birthYearSchema = z.number().int().min(1900).max(currentYear);
const accountIdSchema = z.number().int().positive();

const plannedDoseSchema = z.object({
  dueAt: isoDateSchema,
  id: z.string().min(1),
  kind: z.enum(DOSE_KIND_VALUES),
});

const repeatRuleSchema = z.object({
  interval: z.number().int().positive(),
  kind: z.enum(DOSE_KIND_VALUES),
  unit: z.enum(REPEAT_UNIT_VALUES),
});

const submitVaccinationRecordSchema = z.object({
  batchNumber: z.string().nullable(),
  completedAt: isoDateSchema,
  completedDoseId: z.string().min(1).nullable(),
  completedDoseKind: z.enum(DOSE_KIND_VALUES),
  diseaseId: z.string().min(1),
  expectedUpdatedAt: isoDateTimeSchema.nullable(),
  futureDueDoses: z.array(plannedDoseSchema),
  repeatEvery: repeatRuleSchema.nullable(),
  tradeName: z.string().nullable(),
});

const completeVaccinationDoseSchema = z.object({
  batchNumber: z.string().nullable(),
  completedAt: isoDateSchema,
  diseaseId: z.string().min(1),
  doseId: z.string().min(1),
  expectedUpdatedAt: isoDateTimeSchema.nullable(),
  kind: z.enum(DOSE_KIND_VALUES),
  plannedDoseId: z.string().min(1).nullable(),
  tradeName: z.string().nullable(),
});

type SetLanguageInput = {
  language: (typeof APP_LANGUAGE_VALUES)[number];
};

type TrpcErrorCode = 'BAD_REQUEST' | 'CONFLICT' | 'INTERNAL_SERVER_ERROR' | 'NOT_FOUND';

interface ErrorMapping {
  code: Exclude<TrpcErrorCode, 'INTERNAL_SERVER_ERROR'>;
  message: string;
  matches: (error: unknown) => boolean;
}

const toTrpcError = (
  code: TrpcErrorCode,
  message: string,
  cause: unknown,
): TRPCError => new TRPCError({
  code,
  message,
  cause,
});

const runProfileOperation = async <T>(
  operation: () => Promise<T>,
  internalErrorMessage: string,
  errorMappings: readonly ErrorMapping[] = [],
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    for (const mapping of errorMappings) {
      if (mapping.matches(error)) {
        throw toTrpcError(mapping.code, mapping.message, error);
      }
    }

    throw toTrpcError('INTERNAL_SERVER_ERROR', internalErrorMessage, error);
  }
};

const isProfileAccountNotFoundError = (error: unknown): error is ProfileAccountNotFoundError =>
  error instanceof ProfileAccountNotFoundError;

const isProfilePrimaryAccountDeletionError = (
  error: unknown,
): error is ProfilePrimaryAccountDeletionError => error instanceof ProfilePrimaryAccountDeletionError;

const isOptimisticConcurrencyError = (error: unknown): error is OptimisticConcurrencyError =>
  error instanceof OptimisticConcurrencyError;

const PROFILE_ACCOUNT_NOT_FOUND_ERROR_MAPPING: ErrorMapping = {
  code: 'NOT_FOUND',
  matches: isProfileAccountNotFoundError,
  message: 'Profile account not found.',
};

const PRIMARY_ACCOUNT_DELETE_ERROR_MAPPING: ErrorMapping = {
  code: 'BAD_REQUEST',
  matches: isProfilePrimaryAccountDeletionError,
  message: 'Primary account cannot be deleted.',
};

const VACCINATION_SYNC_CONFLICT_ERROR_MAPPING: ErrorMapping = {
  code: 'CONFLICT',
  matches: isOptimisticConcurrencyError,
  message: 'Vaccination record was changed by another client. Refresh and retry.',
};

const accountMutationBaseSchema = z.object({
  birthYear: birthYearSchema,
  name: z.string().trim().min(1),
});

const profileRouter = router({
  get: publicProcedure.query(({ ctx }: { ctx: TrpcContext }) =>
    runProfileOperation(
      () => ctx.profileRepository.getProfileSnapshot(),
      'Failed to load profile state.',
    )),
  selectAccount: publicProcedure
    .input(z.object({ accountId: accountIdSchema }))
    .mutation(({ ctx, input }) =>
      runProfileOperation(
        () => ctx.profileRepository.selectAccount(input.accountId),
        'Failed to select account.',
        [PROFILE_ACCOUNT_NOT_FOUND_ERROR_MAPPING],
      )),
  createFamilyAccount: publicProcedure
    .input(accountMutationBaseSchema.extend({
      country: z.enum(COUNTRY_CODE_VALUES).nullable(),
    }))
    .mutation(({ ctx, input }) =>
      runProfileOperation(
        () => ctx.profileRepository.createFamilyAccount(input),
        'Failed to create family account.',
      )),
  deleteFamilyAccount: publicProcedure
    .input(z.object({ accountId: accountIdSchema }))
    .mutation(({ ctx, input }) =>
      runProfileOperation(
        () => ctx.profileRepository.deleteFamilyAccount(input.accountId),
        'Failed to delete family account.',
        [
          PROFILE_ACCOUNT_NOT_FOUND_ERROR_MAPPING,
          PRIMARY_ACCOUNT_DELETE_ERROR_MAPPING,
        ],
      )),
  updateAccount: publicProcedure
    .input(accountMutationBaseSchema.extend({
      accountId: accountIdSchema,
      country: z.enum(COUNTRY_CODE_VALUES).nullable(),
    }))
    .mutation(({ ctx, input }) =>
      runProfileOperation(
        () => ctx.profileRepository.updateAccount(input),
        'Failed to update account.',
        [PROFILE_ACCOUNT_NOT_FOUND_ERROR_MAPPING],
      )),
  setVaccinationCountry: publicProcedure
    .input(z.object({
      accountId: accountIdSchema,
      country: z.enum(COUNTRY_CODE_VALUES),
    }))
    .mutation(({ ctx, input }) =>
      runProfileOperation(
        async () => {
          await ctx.profileRepository.setVaccinationCountry(input.accountId, input.country);
          return ctx.profileRepository.getProfileSnapshot();
        },
        'Failed to save vaccination country.',
      )),
  submitVaccinationRecord: publicProcedure
    .input(submitVaccinationRecordSchema.extend({
      accountId: accountIdSchema,
    }))
    .mutation(({ ctx, input }) =>
      runProfileOperation(
        async () => {
          const { accountId, ...record } = input;
          await ctx.profileRepository.submitVaccinationRecord(accountId, record);
          return ctx.profileRepository.getProfileSnapshot();
        },
        'Failed to save vaccination record.',
        [VACCINATION_SYNC_CONFLICT_ERROR_MAPPING],
      )),
  completeVaccinationDose: publicProcedure
    .input(completeVaccinationDoseSchema.extend({
      accountId: accountIdSchema,
    }))
    .mutation(({ ctx, input }) =>
      runProfileOperation(
        async () => {
          const { accountId, ...dose } = input;
          await ctx.profileRepository.completeVaccinationDose(accountId, dose);
          return ctx.profileRepository.getProfileSnapshot();
        },
        'Failed to save completed dose.',
        [VACCINATION_SYNC_CONFLICT_ERROR_MAPPING],
      )),
  removeVaccinationRecord: publicProcedure
    .input(z.object({
      accountId: accountIdSchema,
      diseaseId: z.string().min(1),
    }))
    .mutation(({ ctx, input }) =>
      runProfileOperation(
        async () => {
          await ctx.profileRepository.removeVaccinationRecord(input.accountId, input.diseaseId);
          return ctx.profileRepository.getProfileSnapshot();
        },
        'Failed to remove vaccination record.',
      )),
  setLanguage: publicProcedure
    .input(z.object({ language: z.enum(APP_LANGUAGE_VALUES) }))
    .mutation(({ ctx, input }: { ctx: TrpcContext; input: SetLanguageInput }) =>
      runProfileOperation(
        async () => {
          await ctx.profileRepository.setLanguage(input.language);
          return ctx.profileRepository.getProfileSnapshot();
        },
        'Failed to save language.',
      )),
});

export const appRouter = router({
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
