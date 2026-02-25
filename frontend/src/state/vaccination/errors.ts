export const isTrpcConflictError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const errorWithData = error as { data?: { code?: string } };

  return errorWithData.data?.code === 'CONFLICT';
};
