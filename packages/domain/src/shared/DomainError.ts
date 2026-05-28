export abstract class DomainError extends Error {
  abstract readonly code: string;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BusinessRuleViolation extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
  constructor(rule: string, detail?: string) {
    super(detail ? `${rule}: ${detail}` : rule);
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  constructor(action: string) {
    super(`Forbidden: ${action}`);
  }
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  constructor(message: string) {
    super(message);
  }
}
