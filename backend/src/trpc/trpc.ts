import { initTRPC } from '@trpc/server';
import type {
  AppLanguage,
  CountryCode,
  ProfileSnapshot,
  VaccinationStorageRecord,
} from '../modules/profile/profileTypes.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

interface TrpcProfileRepository {
  ensureDefaultProfile: () => Promise<void>;
  getProfileSnapshot: () => Promise<ProfileSnapshot>;
  removeVaccinationRecord: (diseaseId: string) => Promise<void>;
  setVaccinationCountry: (country: CountryCode) => Promise<void>;
  upsertVaccinationRecord: (record: VaccinationStorageRecord) => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
}

export interface TrpcContext {
  profileRepository: TrpcProfileRepository;
  req: FastifyRequest;
  res: FastifyReply;
}

const t = initTRPC.context<TrpcContext>().create();

export const createTrpcContext = ({
  profileRepository,
  req,
  res,
}: TrpcContext): TrpcContext => ({
  profileRepository,
  req,
  res,
});

export const router = t.router;
export const publicProcedure = t.procedure;
