# Swagger API documentation

[`openapi.json`](openapi.json) is the OpenAPI 3.0.3 specification for this server.
It documents 33 operations across authentication, users, posts, comments, likes,
images, and friends, including request schemas, response schemas, pagination,
authentication, and error responses.

## View the documentation

1. Start the API locally using the instructions in the root README.
2. Open `http://localhost:3001/api` in your browser, adjusting the port if needed.
   It redirects to Swagger UI at `/api/docs/`.
3. Register through `POST /users/register` and sign in through `POST /auth`.
4. Copy the returned JWT into **Authorize**. Swagger sends it in `x-auth-token`;
   enter the token without a `Bearer` prefix.

Swagger UI serves its JavaScript and CSS locally and loads the specification from
`/api/openapi.json`. The served specification uses `/api` on the current host, so
**Try it out** works with your configured port or deployed server.

You can also import `doc/openapi.json` into [Swagger Editor](https://editor.swagger.io/)
or an OpenAPI-compatible API client. The standalone file defaults to localhost:3001.

## Current API behavior

- Successful creation, updates, and deletion generally return HTTP 200.
- Errors and the login JWT are sent as strings using Express's `text/html`
  content type. JSON responses contain documents or arrays directly.
- Protected endpoints use `x-auth-token`. The current logout endpoint is public.
- Login and registration share a limit of 20 requests per IP per 15 minutes.
- List endpoints with pagination use `page` and `limit`; defaults are 1 and 20,
  and the maximum limit is 100.
- Image endpoints accept JSON metadata, not multipart file uploads.
- Registration and photo updates currently include a password hash in their
  user document response; user listings and `/users/me` omit the password.
- `GET /comments` returns comment counters or `false`, while
  `GET /comments/{id}` uses a post ID to return its comments.
- `PATCH /images/{id}` uses an image ID; `DELETE /images/{id}` uses a post ID.
- Post deletion and the unlike branch check legacy Mongoose deletion fields.
  Their current limitations are described on the corresponding operations.
- Chat and message models exist, but no HTTP routes for them are mounted.

The specification reflects the handlers as implemented, including operations
marked unused in the source. Examples use fictitious data. A documented success
response does not mean every endpoint has integration test coverage.

## Maintain the specification

Update this file when changing routes, authentication, validation, or response
shapes. The source of truth is [`startup/routes.ts`](../startup/routes.ts),
[`routes/`](../routes/), [`models/`](../models/), and
[`utils/pagination.ts`](../utils/pagination.ts).

To validate the specification with Swagger CLI without adding a project dependency:

```sh
npm exec --yes --package=@apidevtools/swagger-cli -- swagger-cli validate doc/openapi.json
```

Use `npm.cmd` in PowerShell if script execution policy blocks `npm`.
