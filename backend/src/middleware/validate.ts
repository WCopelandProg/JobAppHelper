import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

// Validates and coerces req.body/query/params in place against a zod schema.
export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        error: { message: "Validation failed", details: result.error.flatten() },
      });
    }

    const parsed = result.data as { body?: unknown; query?: unknown; params?: unknown };
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query as never;
    if (parsed.params) req.params = parsed.params as never;
    next();
  };
}
