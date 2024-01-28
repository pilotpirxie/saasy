import { NextFunction, Request, Response } from "express";
import { CacheStore } from "../data/cacheStore";

const cache =
  (cacheStore: CacheStore) =>
  (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cached = cacheStore.get(key);
    if (cached) {
      return res.json(cached);
    }

    // @ts-ignore
    res.cacheJSONResponse = res.json;

    // @ts-ignore
    res.json = (body) => {
      cacheStore.set(key, body);
      // @ts-ignore
      res.cacheJSONResponse(body);
    };
    return next();
  };

export default cache;
