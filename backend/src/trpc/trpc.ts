import { initTRPC } from '@trpc/server';
import type {
  AppLanguage,
  ProfileSnapshot,
  VaccinationStorageState,
} from '../modules/profile/profileTypes.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

interface TrpcProfileRepository {
  ensureDefaultProfile: () => Promise<void>;
  getProfileSnapshot: () => Promise<ProfileSnapshot>;
  replaceVaccinationState: (state: VaccinationStorageState) => Promise<void>;
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
