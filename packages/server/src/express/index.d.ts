/* eslint-disable */

import {Request} from "express";
import {ParamsDictionary, Query} from "express-serve-static-core";
import {
  ArraySchema,
  BinarySchema,
  BooleanSchema,
  DateSchema,
  FunctionSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  SymbolSchema,
} from "joi";

export type RequestPayload = { body?: object; params?: object; query?: object };

type PayloadDictionary<T> = {
  [P in keyof T]: T[P] extends StringSchema
    ? string
    : T[P] extends NumberSchema
    ? number
    : T[P] extends BooleanSchema
    ? boolean
    : T[P] extends FunctionSchema
    ? Function
    : T[P] extends ArraySchema
    ? Array<any>
    : T[P] extends DateSchema
    ? Date
    : T[P] extends BinarySchema
    ? Buffer
    : T[P] extends ObjectSchema
    ? Object<any>
    : T[P] extends SymbolSchema
    ? symbol
    : any;
};

export interface TypedRequest<A extends RequestPayload> extends Request {
  body: Required<PayloadDictionary<A["body"]>>;
  params: Required<PayloadDictionary<A["params"]>> & Omit<ParamsDictionary, never>;
  query: Required<PayloadDictionary<A["query"]>> & Omit<Query, never>;
}

global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
