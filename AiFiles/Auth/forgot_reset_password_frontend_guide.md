# Forgot / Reset Password — Frontend Implementation Guide

## Overview

Two new unauthenticated pages are needed:

1. **Forgot Password page** — user enters their email, receives a reset link
2. **Reset Password page** — user lands from the email link, enters a new password

Both pages are fully unauthenticated (no token/cookie required).

---

## API Endpoints

### 1. Request a password reset

```
POST /auth/forgot-password
Content-Type: application/json
```

**Request body:**
```json
{
  "email": "user@example.com"
}
```

**Response (always 200, even if email does not exist — prevents enumeration):**
```json
{
  "code": "auth.password.reset_request_sent",
  "data": null,
  "message": "Password reset email sent if account exists",
  "success": true
}
```

**Error (invalid email format — 400):**
```json
{
  "code": "auth.login.fail",
  "data": null,
  "message": "Error",
  "success": false
}
```

---

### 2. Reset the password

```
POST /auth/reset-password
Content-Type: application/json
```

**Request body:**
```json
{
  "token": "<token from URL query param>",
  "newPassword": "NewPass123"
}
```

**Success (200):**
```json
{
  "code": "auth.password.reset_success",
  "data": null,
  "message": "Password has been reset successfully",
  "success": true
}
```

**Token invalid or expired (400):**
```json
{
  "code": "auth.password.token_invalid",
  "data": null,
  "message": "Invalid or expired password reset token",
  "success": false
}
```

---

## Password Rules

The backend enforces the same rules on `newPassword` as for registration:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

Validate these client-side before submitting to give instant feedback.

---

## Page 1 — Forgot Password (`/forgot-password`)

### Layout

```
┌────────────────────────────────┐
│         FlairSync Logo         │
│                                │
│    Forgot your password?       │
│    Enter your email and we'll  │
│    send you a reset link.      │
│                                │
│  [ Email address          ]    │
│                                │
│  [ Send Reset Link  ]          │
│                                │
│  ← Back to login               │
└────────────────────────────────┘
```

### States

| State       | UI behaviour                                           |
|-------------|--------------------------------------------------------|
| Idle        | Form enabled, button active                            |
| Loading     | Button shows spinner, disabled, input disabled         |
| Success     | Replace form with success message (see below)          |
| Error       | Show inline error under input (e.g. invalid email fmt) |

### Success state (replace the form entirely)

```
┌────────────────────────────────┐
│         FlairSync Logo         │
│                                │
│   ✉ Check your inbox           │
│                                │
│   If an account exists for     │
│   that email, we've sent a     │
│   password reset link.         │
│                                │
│   The link expires in 1 hour.  │
│                                │
│  [ Back to Login ]             │
└────────────────────────────────┘
```

> **Do not** say "email not found" or "email found" — always show the same success message regardless of whether the email exists.

### Implementation notes

- On submit: call `POST /auth/forgot-password` with `{ email }`
- If `response.success === true` → switch to success state
- If the API returns an error (e.g. network failure) → show a generic error toast
- Do not auto-redirect after success; let the user click "Back to Login"

---

## Page 2 — Reset Password (`/reset-password`)

The user arrives here via the link in their email:
```
https://yourapp.com/reset-password?token=<64-char-hex-token>
```

### On page load

1. Read `token` from the URL query params
2. If `token` is missing → immediately show an "Invalid link" error and a link back to `/forgot-password`
3. If `token` is present → show the reset form

### Layout (token present)

```
┌────────────────────────────────┐
│         FlairSync Logo         │
│                                │
│    Choose a new password       │
│                                │
│  [ New password           ]    │
│  [ Confirm new password   ]    │
│                                │
│  Password requirements:        │
│  • 8+ characters               │
│  • One uppercase letter        │
│  • One lowercase letter        │
│  • One number                  │
│                                │
│  [ Reset Password ]            │
└────────────────────────────────┘
```

### States

| State          | UI behaviour                                                |
|----------------|-------------------------------------------------------------|
| Idle           | Form enabled, button active                                 |
| Loading        | Button spinner, inputs disabled                             |
| Success        | Replace form with success message + redirect to login       |
| Token invalid  | Show error state (see below)                                |
| Validation err | Inline error under the relevant input                       |

### Client-side validation (before API call)

- `newPassword` meets password rules (show live indicator)
- `confirmPassword === newPassword` (show error if mismatch)

### Success state

```
┌────────────────────────────────┐
│         FlairSync Logo         │
│                                │
│   ✓ Password updated!          │
│                                │
│   Your password has been       │
│   changed. You can now log in  │
│   with your new password.      │
│                                │
│  [ Go to Login ]               │
└────────────────────────────────┘
```

Auto-redirect to `/login` after 3 seconds, or immediately on button click.

### Token invalid / expired state

```
┌────────────────────────────────┐
│         FlairSync Logo         │
│                                │
│   ✗ Link expired or invalid    │
│                                │
│   This password reset link     │
│   has already been used or     │
│   has expired (links are valid │
│   for 1 hour).                 │
│                                │
│  [ Request a new link ]        │
└────────────────────────────────┘
```

"Request a new link" navigates to `/forgot-password`.

### Implementation notes

- On submit: call `POST /auth/reset-password` with `{ token, newPassword }`
- If `response.success === true` → show success state, auto-redirect to `/login` in 3s
- If `response.code === 'auth.password.token_invalid'` → show token invalid state
- Any other error → show a generic error toast

---

## Routing

| Path               | Component            | Auth required |
|--------------------|----------------------|---------------|
| `/forgot-password` | ForgotPasswordPage   | No            |
| `/reset-password`  | ResetPasswordPage    | No            |

Make sure these routes are accessible when the user is **not** logged in (i.e. not wrapped in an auth guard).

If your app redirects all unauthenticated users to `/login`, whitelist `/forgot-password` and `/reset-password` in your auth guard.

---

## Code skeleton (React + fetch)

### `ForgotPasswordPage.tsx`

```tsx
import { useState } from 'react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.message ?? 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h2>Check your inbox</h2>
        <p>If an account exists for that email, we've sent a password reset link. The link expires in 1 hour.</p>
        <a href="/login">Back to Login</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot your password?</h2>
      <p>Enter your email and we'll send you a reset link.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        disabled={loading}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>
      <a href="/login">← Back to Login</a>
    </form>
  );
}
```

---

### `ResetPasswordPage.tsx`

```tsx
import { useState, useEffect } from 'react';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

export function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token');
    if (!t) {
      setTokenInvalid(true);
    } else {
      setToken(t);
    }
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!PASSWORD_REGEX.test(newPassword)) {
      e.newPassword =
        'Password must be 8+ characters with an uppercase letter, lowercase letter, and number.';
    }
    if (newPassword !== confirm) {
      e.confirm = 'Passwords do not match.';
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => (window.location.href = '/login'), 3000);
      } else if (data.code === 'auth.password.token_invalid') {
        setTokenInvalid(true);
      } else {
        setErrors({ form: data.message ?? 'Something went wrong.' });
      }
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  if (tokenInvalid) {
    return (
      <div>
        <h2>Link expired or invalid</h2>
        <p>This password reset link has already been used or has expired (links are valid for 1 hour).</p>
        <a href="/forgot-password">Request a new link</a>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <h2>Password updated!</h2>
        <p>Your password has been changed. Redirecting to login…</p>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Choose a new password</h2>
      <div>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          required
          disabled={loading}
        />
        {errors.newPassword && <p style={{ color: 'red' }}>{errors.newPassword}</p>}
      </div>
      <div>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          required
          disabled={loading}
        />
        {errors.confirm && <p style={{ color: 'red' }}>{errors.confirm}</p>}
      </div>
      {errors.form && <p style={{ color: 'red' }}>{errors.form}</p>}
      <ul>
        <li>8+ characters</li>
        <li>One uppercase letter</li>
        <li>One lowercase letter</li>
        <li>One number</li>
      </ul>
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting…' : 'Reset Password'}
      </button>
    </form>
  );
}
```

---

## Environment variable

Add `FRONTEND_URL` to the backend `.env` file so the reset link in the email points to the correct domain:

```env
FRONTEND_URL=https://app.yourfrontend.com
```

The reset URL the backend builds is:
```
${FRONTEND_URL}/reset-password?token=<token>
```

If `FRONTEND_URL` is not set, it falls back to `http://localhost:3000`.

---

## Security notes for QA

- The same success message is returned whether the email exists or not — this is intentional and must not be changed.
- Each new forgot-password request invalidates all previous tokens for that user.
- Tokens expire after **1 hour**.
- Tokens are single-use — submitting the same token a second time returns `token_invalid`.
- The raw token is never stored in the database; only its SHA-256 hash is stored.
