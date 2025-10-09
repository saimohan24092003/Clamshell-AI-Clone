## EduAI Backend (Node.js + Express) with OpenAI GPT-4o-mini

Production-ready Express backend integrating OpenAI's GPT-4o-mini. Includes JWT auth middleware, secure env config, CORS, Helmet, rate limiting, logging, streaming and non-streaming chat responses.

### 1) Setup

1. Requirements: Node 18+
2. Install dependencies:
```bash
npm install
```
3. Create `.env` in project root:
```bash
PORT=4000
NODE_ENV=development
JWT_SECRET=replace-this-with-a-strong-secret
FRONTEND_ORIGIN=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-key
REQUEST_LOGGING=true
```
4. Start server:
```bash
npm run dev
```

Health check: GET http://localhost:4000/health

### 2) Auth expectation

- The `/api/chat` endpoint requires a valid `Authorization: Bearer <jwt>` header.
- The server trusts your existing auth system to issue JWTs signed with `JWT_SECRET`.

### 3) API: POST /api/chat

Request JSON (either `prompt` or `messages` is required):
```json
{
  "prompt": "Explain photosynthesis simply",
  "stream": false,
  "temperature": 0.7,
  "maxTokens": 512,
  "model": "gpt-4o-mini"
}
```
Or multi-turn:
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful tutor." },
    { "role": "user", "content": "What is photosynthesis?" },
    { "role": "assistant", "content": "It is how plants make food from light." },
    { "role": "user", "content": "Give me a 2-line summary." }
  ],
  "stream": true
}
```

Non-streaming response:
```json
{ "text": "Photosynthesis is ..." }
```

Streaming response (Server-Sent Events over POST):
- `Content-Type: text/event-stream`
- Lines like: `data: {"text":"accumulated","delta":"new token"}`
- Final line: `data: {"done":true}`

### 4) Frontend usage examples (React)

Non-streaming example:
```ts
async function callChatNonStreaming(token: string, prompt: string) {
  const res = await fetch('http://localhost:4000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, stream: false }),
  });
  if (!res.ok) throw new Error('Chat request failed');
  const data = await res.json();
  return data.text as string;
}
```

Streaming example (parse text/event-stream manually):
```ts
async function callChatStreaming(token: string, messages) {
  const res = await fetch('http://localhost:4000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, stream: true }),
  });
  if (!res.ok || !res.body) throw new Error('Stream request failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      const json = line.slice(5).trim();
      if (!json) continue;
      const evt = JSON.parse(json);
      if (evt.delta) {
        accumulated += evt.delta;
        // update UI with accumulated
      }
      if (evt.done) {
        return accumulated;
      }
    }
  }
  return accumulated;
}
```

### 5) Rate limiting

- Global limiter: 120 req/min per IP.
- Chat route limiter: 30 req/min per IP.
Adjust in `src/app.js` and `src/routes/chat.js`.

### 6) Error handling

- Centralized error handler at `src/middleware/errorHandler.js`.
- OpenAI errors are mapped to 502 with a safe message.
- Validation errors return 400.

### 7) Project structure

```
src/
  app.js
  server.js
  config/env.js
  middleware/
    auth.js
    errorHandler.js
  routes/
    chat.js
  services/
    openaiService.js
  utils/
    logger.js
```

### 8) Tests (ideas)

- Unit test `authenticateJwt` with valid/invalid tokens.
- Mock OpenAI SDK and test `getChatCompletion` non-streaming returns text.
- Integration test POST `/api/chat`:
  - 401 when missing token.
  - 400 when neither prompt nor messages.
  - 200 with text for non-streaming.
  - Streaming: ensure sequence of SSE messages and final `{done:true}`.
- Rate limit test: exceed `max` and assert 429.

You can use Jest or Node's built-in test runner.

### 9) Security notes

- Set `JWT_SECRET` and `OPENAI_API_KEY` only in `.env` (never commit real keys).
- Restrict CORS to your real frontend domain in production.
- Consider HTTPS and a reverse proxy for production.


