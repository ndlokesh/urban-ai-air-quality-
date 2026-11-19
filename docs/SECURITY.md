# CleanBreath | Security, Privacy & Safety Architecture

CleanBreath enforces defense-in-depth principles across client, server, and LLM integrations.

---

## 1. Key Protection & Zero-Client Secret Exposure
- **Server-Side API Proxy**: The `GEMINI_API_KEY` is loaded exclusively in the Node.js backend environment via `dotenv`. It is never bundled into client-side JavaScript or exposed in network traffic.
- **Client Bundling**: The Vite build contains zero references to private credentials.

## 2. HTTP Defense & Middleware Stack
- **Helmet Middleware**: Injects strict HTTP response headers:
  - `X-Content-Type-Options: nosniff` (prevents MIME type sniffing)
  - `X-Frame-Options: SAMEORIGIN` (mitigates clickjacking)
  - `Strict-Transport-Security` (enforces HTTPS in production)
- **Rate Limiting (`express-rate-limit`)**:
  - Global API Limiter: 300 requests per 15 minutes per IP.
  - Dedicated AI Limiter: 40 requests per minute on `/api/plan` and `/api/chat` to protect Google Gemini quota and mitigate denial-of-service attempts.
- **Payload Constraints**: JSON request bodies are restricted to `250kb` to prevent memory exhaustion buffer overflow attacks.
- **Strict Input Validation**: Latitude (-90 to 90) and Longitude (-180 to 180) parameters are strictly sanitized and parsed before proxying to Open-Meteo.

## 3. LLM Safety & Prompt Injection Guardrails
- **Prompt Isolation**: System instructions strictly ground Gemini in the numerical data provided. System instructions separate context from user queries.
- **Medical Safety Protocol**:
  - Real-time keyword filtering identifies symptoms: wheezing, coughing, chest tightness, shortness of breath, blood, or fever.
  - Automatically overrides general advice with an urgent medical advisory directing the user to a healthcare professional, while explicitly stating CleanBreath does not diagnose illnesses.
- **Calibrated Offline Engine**:
  - If external network failures, API rate limits, or missing keys occur, CleanBreath safely falls back to a deterministic, peer-reviewed engineering engine without crashing or returning unhandled exceptions.

## 4. Privacy & Data Minimization
- **No User Tracking**: CleanBreath stores lifestyle profiles and action checklist progress purely inside the user's browser `localStorage`.
- **Zero Database Profiling**: No personal health data, GPS coordinates, or household profiles are saved to persistent server databases or third-party tracking services.
