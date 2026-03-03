export class OptimisticConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptimisticConcurrencyError';
  }
}

export class ProfileAccountNotFoundError extends Error {
  constructor(accountId: number) {
    super(`Profile account ${accountId} is not found.`);
    this.name = 'ProfileAccountNotFoundError';
  }
}

export class ProfilePrimaryAccountDeletionError extends Error {
  constructor(accountId: number) {
    super(`Primary account ${accountId} cannot be deleted.`);
    this.name = 'ProfilePrimaryAccountDeletionError';
  }
}

export class LastCompletedDoseRemovalError extends Error {
  constructor(diseaseId: string, doseId: string) {
    super(
      `Cannot remove completed dose "${doseId}" for disease "${diseaseId}" because it is the last one.`,
    );
    this.name = 'LastCompletedDoseRemovalError';
  }
}
