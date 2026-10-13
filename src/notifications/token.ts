import { z } from "zod";

export const deviceTokenSchema = z.string().trim().min(20).max(4096).regex(/^\S+$/);
