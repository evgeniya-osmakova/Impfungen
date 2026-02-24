import { initTRPC } from '@trpc/server';
import type {
  AppLanguage,
  CountryCode,
  ProfileSnapshot,
  UpsertVaccinationStorageRecordInput,
} from '../modules/profile/profileTypes.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

interface TrpcProfileRepository {
  createFamilyAccount: (input: {
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<ProfileSnapshot>;
  deleteFamilyAccount: (accountId: number) => Promise<ProfileSnapshot>;
  ensureDefaultProfile: () => Promise<void>;
  getProfileSnapshot: () => Promise<ProfileSnapshot>;
  removeVaccinationRecord: (accountId: number, diseaseId: string) => Promise<void>;
  selectAccount: (accountId: number) => Promise<ProfileSnapshot>;
  setVaccinationCountry: (accountId: number, country: CountryCode) => Promise<void>;
  upsertVaccinationRecord: (
    accountId: number,
    record: UpsertVaccinationStorageRecordInput,
  ) => Promise<string>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  updateAccount: (input: {
    accountId: number;
    birthYear: number;
    country: CountryCode | null;
    name: string;
  }) => Promise<ProfileSnapshot>;
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
