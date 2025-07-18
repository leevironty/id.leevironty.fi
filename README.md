# Fresh project

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno:
https://docs.deno.com/runtime/getting_started/installation

Then start the project in development mode:

```
deno task dev
```

This will watch the project directory and restart as necessary.


## Hardening checklist
- [ ] Instrospection endpoint is private / reachable only by oathkeeper
- [ ] Doublecheck CSRF cookie settings
- [ ] Add CPS headers
- [ ] Add rate limiting
- [ ] Add db indices
- [ ] Add token rotation (?)
### From code review
- [ ] Double-check webauthn userHandle is generated server-side.
- [ ] Do not log secrets.
- [ ] CSRF protection with a custom X-* header.
- [ ] Error handling in UX