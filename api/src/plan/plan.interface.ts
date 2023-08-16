import { Document } from 'mongoose';
export interface IPlan extends Document {
  readonly name: string;

  readonly length: number;

  readonly width: number;

  readonly height: number;

  readonly weight: number;

  readonly quantity: number;

  readonly stackable: boolean;

  readonly tiltable: boolean;
}

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
