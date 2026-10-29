export class NotFoundError extends Error {
  constructor(message: string){
    super(message);
  }
}

export class MalformedError extends Error {
  constructor(message: string){
    super(message);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string){
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string){
    super(message);
  }
}