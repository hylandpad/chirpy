import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "src/db/generated",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://postgres@localhost:5432/chirpy?sslmode=disable",
  },
});