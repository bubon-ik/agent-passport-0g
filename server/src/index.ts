import cors from "cors";
import express from "express";
import { z } from "zod";
import {
  agentPassportSchema,
  generatePassportInputSchema
} from "../../shared/passport.js";
import { config } from "./config.js";
import { AppError } from "./errors.js";
import { checkHealth } from "./services/healthService.js";
import { generatePassport } from "./services/computeService.js";
import { savePassport } from "./services/storageService.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res, next) => {
  try {
    const health = await checkHealth();
    res.json(health);
  } catch (error) {
    next(error);
  }
});

app.post("/api/passport/generate", async (req, res, next) => {
  try {
    const input = generatePassportInputSchema.parse(req.body);
    const result = await generatePassport(input);

    res.json({
      passport: result.passport,
      mode: result.mode
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/passport/save", async (req, res, next) => {
  try {
    const body = z.object({ passport: agentPassportSchema }).parse(req.body);
    const result = await savePassport(body.passport);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Invalid request payload.",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  res.status(500).json({
    error:
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Internal server error."
  });
});

app.listen(config.port, () => {
  console.log(`Agent Passport server listening on http://localhost:${config.port}`);
});
