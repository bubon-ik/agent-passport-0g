import { z } from "zod";
import { AppError } from "../server/src/errors.js";

export type VercelApiRequest = {
  method?: string;
  body?: unknown;
};

export type VercelApiResponse = {
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => VercelApiResponse;
  json: (body: unknown) => void;
};

export function withCors(response: VercelApiResponse) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function handleOptions(request: VercelApiRequest, response: VercelApiResponse) {
  if (request.method === "OPTIONS") {
    withCors(response);
    response.status(200).json({});
    return true;
  }

  return false;
}

export function ensureMethod(
  request: VercelApiRequest,
  response: VercelApiResponse,
  allowedMethod: "GET" | "POST"
) {
  if (request.method !== allowedMethod) {
    withCors(response);
    response.setHeader("Allow", [allowedMethod, "OPTIONS"]);
    response.status(405).json({ error: "Method not allowed." });
    return false;
  }

  return true;
}

export function parseJsonBody<T>(request: VercelApiRequest): T {
  if (typeof request.body === "string") {
    return JSON.parse(request.body) as T;
  }

  return request.body as T;
}

export function sendError(response: VercelApiResponse, error: unknown) {
  withCors(response);

  if (error instanceof z.ZodError) {
    response.status(400).json({
      error: "Invalid request payload.",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  response.status(500).json({
    error:
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Internal server error."
  });
}
