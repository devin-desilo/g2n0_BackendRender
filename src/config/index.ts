import { ClassConstructor, plainToClass } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

export const Environment = {
  Development: 'development',
  Production: 'production',
  Test: 'testing',
  Staging: 'staging',
};
export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: 'development';

  @IsNumber()
  PORT: number;

  public get isProd(): boolean {
    return this.NODE_ENV === Environment.Production;
  }

  public get isDev(): boolean {
    return this.NODE_ENV === Environment.Development;
  }

  public get isTest(): boolean {
    return this.NODE_ENV === Environment.Test;
  }

  public get isStage(): boolean {
    return this.NODE_ENV === Environment.Staging;
  }

  @IsString()
  RABBIT_MQ_URI: string;
}

export class DatabaseVariables extends EnvironmentVariables {
  @IsString()
  MONGODB_URI: string;

  @IsBoolean()
  DB_LOGGING_ENABLED: boolean;
}

export class FSVariables extends EnvironmentVariables {
  @IsString()
  FS_HOST: string;

  @IsString()
  FS_PASSWORD: string;

  @IsNumber()
  FS_PORT: number;
}

export class AuthVariables extends EnvironmentVariables {
  @IsNumber()
  JWT_EXPIRATION: number;

  @IsString()
  JWT_SECRET: string;
}

const getPlainToClass = <T>(
  type: ClassConstructor<T>,
  config: Record<string, unknown>,
) => plainToClass(type, config, { enableImplicitConversion: true });

export function validate(config: Record<string, unknown>): DatabaseVariables {
  const finalConfig = getPlainToClass(DatabaseVariables, config);
  const errors = validateSync(finalConfig, { skipMissingProperties: true });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return finalConfig;
}

export function validateDB(config: Record<string, unknown>): DatabaseVariables {
  const finalConfig = getPlainToClass(DatabaseVariables, config);
  const errors = validateSync(finalConfig, { skipMissingProperties: true });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return finalConfig;
}

export function validateFreeSwitch(
  config: Record<string, unknown>,
): FSVariables {
  const finalConfig = getPlainToClass(FSVariables, config);
  const errors = validateSync(finalConfig, { skipMissingProperties: true });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return finalConfig;
}

export function validateAuth(config: Record<string, unknown>): AuthVariables {
  const finalConfig = getPlainToClass(AuthVariables, config);
  const errors = validateSync(finalConfig, { skipMissingProperties: true });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return finalConfig;
}

export function responser(
  statusCode: number,
  message: string,
  error?: string,
  data?: any,
) {
  const returnObj = {
    statusCode: statusCode,
    message: message,
  };
  if (error) {
    returnObj['error'] = error;
  }
  if (data) {
    returnObj['data'] = data;
  }
  return returnObj;
}
