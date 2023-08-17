export interface IPlan {
  _id: string;

  name: string;

  length: number;

  width: number;

  height: number;

  weight: number;

  quantity: number;

  stackable: boolean;

  tiltable: boolean;
}

export enum OperationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export interface IBatchOperation {
  action: OperationType;
  id?: string;
  data?: Partial<IPlan>;
}

export type TBatchRequestBody = {
  operations: IBatchOperation[];
};
