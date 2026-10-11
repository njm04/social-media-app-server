import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import apiDefinition from "../doc/openapi.json";

const openapiDocument = {
  ...apiDefinition,
  servers: [{ url: "/api", description: "Current server" }],
};

export default (app: Application): void => {
  app.get("/api", (_req, res) => {
    res.redirect("/api/docs/");
  });

  app.get("/api/openapi.json", (_req, res) => {
    res.json(openapiDocument);
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      customSiteTitle: "Social Media API documentation",
      swaggerOptions: {
        url: "/api/openapi.json",
        validatorUrl: null,
      },
    })
  );
};
