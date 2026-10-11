import request from "supertest";
import app from "../../index";
import apiDefinition from "../../doc/openapi.json";

describe("Swagger documentation", () => {
  it.each(["/api", "/api/"])("redirects %s to the Swagger UI", async (url) => {
    await request(app).get(url).expect(302).expect("Location", "/api/docs/");
  });

  it("opens the Swagger UI when following the /api redirect", async () => {
    const res = await request(app).get("/api").redirects(2).expect(200);

    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.text).toContain('id="swagger-ui"');
    expect(res.text).toContain("Social Media API documentation");
  });

  it("serves the specification with an API URL for the current host", async () => {
    const res = await request(app)
      .get("/api/openapi.json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      ...apiDefinition,
      servers: [{ url: "/api", description: "Current server" }],
    });
  });

  it("configures Swagger UI to load the served specification", async () => {
    const res = await request(app).get("/api/docs/swagger-ui-init.js").expect(200);

    expect(res.text).toContain("/api/openapi.json");
  });

  it.each(["swagger-ui.css", "swagger-ui-bundle.js", "swagger-ui-standalone-preset.js"])(
    "serves the local Swagger asset %s",
    async (asset) => {
      const res = await request(app).get(`/api/docs/${asset}`).expect(200);

      expect(res.headers["content-type"]).toMatch(/css|javascript/);
    }
  );

  it("keeps protected API routes protected", async () => {
    await request(app).get("/api/users/me").expect(401);
  });

  it("returns 404 for unknown API endpoints", async () => {
    await request(app).get("/api/does-not-exist").expect(404);
  });
});
