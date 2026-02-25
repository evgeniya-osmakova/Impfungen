import { initTRPC } from '@trpc/server';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ProfileRepository } from '../modules/profile/profileRepository.js';

export interface TrpcContext {
  profileRepository: ProfileRepository;
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
