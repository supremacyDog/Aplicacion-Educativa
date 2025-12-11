/**
 * @jest-environment node
 */

const app = require("../app.cjs");
const request = require("supertest");

describe("API básica", () => {
  test("GET / debe devolver el login", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  test("GET /api/health debe responder ok:true", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
