# Backend OAuth Changes

## Route
`POST /api/auth/google`

## Body
```json
{
  "credential": "GOOGLE_JWT_ID_TOKEN",
  "role": "brand" // Optional, used for new user creation
}
```

## Logic
1. Verifies the ID token with Google.
2. Checks if the user email is `comeshowup@gmail.com`. If not, returns 403.
3. If user exists, logs them in.
4. If user does not exist, creates a new user with the provided role (default 'brand').
5. Returns JWT and user data.
