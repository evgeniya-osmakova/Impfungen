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

const completedDoseSchema = z.object({
  batchNumber: z.string().nullable(),
  completedAt: isoDateSchema,
  id: z.string().min(1),
  kind: z.enum(DOSE_KIND_VALUES),
  tradeName: z.string().nullable(),
});

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

const vaccinationRecordSchema = z.object({
  completedDoses: z.array(completedDoseSchema),
  diseaseId: z.string().min(1),
  expectedUpdatedAt: isoDateTimeSchema.nullable(),
  futureDueDoses: z.array(plannedDoseSchema),
  repeatEvery: repeatRuleSchema.nullable(),
});

type SetLanguageInput = {
  language: (typeof APP_LANGUAGE_VALUES)[number];
};

const accountMutationBaseSchema = z.object({
  birthYear: birthYearSchema,
  name: z.string().trim().min(1),
});

const profileRouter = router({
  get: publicProcedure.query(async ({ ctx }: { ctx: TrpcContext }) => {
    try {
      return await ctx.profileRepository.getProfileSnapshot();
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load profile state.',
        cause: error,
      });
    }
  }),
  selectAccount: publicProcedure
    .input(z.object({ accountId: accountIdSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.profileRepository.selectAccount(input.accountId);
      } catch (error) {
        if (error instanceof ProfileAccountNotFoundError) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profile account not found.',
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to select account.',
          cause: error,
        });
      }
    }),
  createFamilyAccount: publicProcedure
    .input(accountMutationBaseSchema.extend({
      country: z.enum(COUNTRY_CODE_VALUES).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.profileRepository.createFamilyAccount(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create family account.',
          cause: error,
        });
      }
    }),
  deleteFamilyAccount: publicProcedure
    .input(z.object({ accountId: accountIdSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.profileRepository.deleteFamilyAccount(input.accountId);
      } catch (error) {
        if (error instanceof ProfileAccountNotFoundError) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profile account not found.',
            cause: error,
          });
        }

        if (error instanceof ProfilePrimaryAccountDeletionError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Primary account cannot be deleted.',
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete family account.',
          cause: error,
        });
      }
    }),
  updateAccount: publicProcedure
    .input(accountMutationBaseSchema.extend({
      accountId: accountIdSchema,
      country: z.enum(COUNTRY_CODE_VALUES).nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.profileRepository.updateAccount(input);
      } catch (error) {
        if (error instanceof ProfileAccountNotFoundError) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profile account not found.',
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update account.',
          cause: error,
        });
      }
    }),
  setVaccinationCountry: publicProcedure
    .input(z.object({
      accountId: accountIdSchema,
      country: z.enum(COUNTRY_CODE_VALUES),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.profileRepository.setVaccinationCountry(input.accountId, input.country);

        return { ok: true as const };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save vaccination country.',
          cause: error,
        });
      }
    }),
  upsertVaccinationRecord: publicProcedure
    .input(vaccinationRecordSchema.extend({
      accountId: accountIdSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { accountId, ...record } = input;
        const updatedAt = await ctx.profileRepository.upsertVaccinationRecord(accountId, record);

        return { ok: true as const, updatedAt };
      } catch (error) {
        if (error instanceof OptimisticConcurrencyError) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Vaccination record was changed by another client. Refresh and retry.',
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save vaccination record.',
          cause: error,
        });
      }
    }),
  removeVaccinationRecord: publicProcedure
    .input(z.object({
      accountId: accountIdSchema,
      diseaseId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.profileRepository.removeVaccinationRecord(input.accountId, input.diseaseId);

        return { ok: true as const };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove vaccination record.',
          cause: error,
        });
      }
    }),
  setLanguage: publicProcedure
    .input(z.object({ language: z.enum(APP_LANGUAGE_VALUES) }))
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: SetLanguageInput }) => {
      try {
        await ctx.profileRepository.setLanguage(input.language);

        return { ok: true as const };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save language.',
          cause: error,
        });
      }
    }),
});

export const appRouter = router({
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
