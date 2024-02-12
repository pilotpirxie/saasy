import { NextFunction, Request, Response } from "express";
import { CacheStore } from "../data/cacheStore";

const cache = (cacheStore: CacheStore) => (req: Request, res: Response, next: NextFunction) => {
  const key = req.originalUrl;
  const cached = cacheStore.get(key);
  if (cached) {
    return res.json(cached);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  res.cacheJSONResponse = res.json;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  res.json = (body) => {
    cacheStore.set(key, body);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    res.cacheJSONResponse(body);
  };
  return next();
};

export default cache;
