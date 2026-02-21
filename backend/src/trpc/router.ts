import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  APP_LANGUAGE_VALUES,
  COUNTRY_CODE_VALUES,
  DOSE_KIND_VALUES,
  REPEAT_UNIT_VALUES,
} from '../modules/profile/profileTypes.js';

import { publicProcedure, router } from './trpc.js';
import type { TrpcContext } from './trpc.js';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoDateTimeSchema = z.string().datetime({ offset: true });

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
  futureDueDoses: z.array(plannedDoseSchema),
  repeatEvery: repeatRuleSchema.nullable(),
  updatedAt: isoDateTimeSchema,
});

type SetLanguageInput = {
  language: (typeof APP_LANGUAGE_VALUES)[number];
};

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
  setVaccinationCountry: publicProcedure
    .input(z.object({ country: z.enum(COUNTRY_CODE_VALUES) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.profileRepository.setVaccinationCountry(input.country);

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
    .input(vaccinationRecordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.profileRepository.upsertVaccinationRecord(input);

        return { ok: true as const };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save vaccination record.',
          cause: error,
        });
      }
    }),
  removeVaccinationRecord: publicProcedure
    .input(z.object({ diseaseId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.profileRepository.removeVaccinationRecord(input.diseaseId);

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
