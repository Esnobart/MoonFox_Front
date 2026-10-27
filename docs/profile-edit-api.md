# Profile editing: proposed API contract

Frontend route: `/profile/:username/edit`, available only for the signed-in owner.
Requests use the existing API base URL (`VITE_API_URL`, default
`http://localhost:4000/api/`) and cookie credentials. The profile PATCH endpoint
still needs backend implementation. The frontend shows errors and retains edits
when a request fails; it never reports a successful save without a valid response.
Requests use `createAsyncThunk` operations in `redux/users/operations.js`;
`redux/users/slice.js` applies successful profile changes in `extraReducers`.

## PATCH /api/users/current

Content type: `multipart/form-data` (the browser sets the boundary).

| Field | Type | Meaning |
| --- | --- | --- |
| `username` | string, optional | Trimmed new username. Omitted if unchanged. |
| `avatar` | file, optional | One new avatar. Omitted to retain the current avatar. |

No email, role, password, user ID or existing avatar URL is sent.
The authenticated session identifies the account. Avatars accept JPEG, PNG,
WebP, GIF and AVIF, with a nonzero size up to 10 MiB. The frontend uses a round,
centered cover preview. No image cropping or avatar removal is requested.

Success: `200 { "user": { "_id": "…", "username": "…", "avatar": "https://…" } }`.
Return the complete resulting username and avatar, including an unchanged
avatar; use `null` if there is no avatar. Do not return passwords or hashes.
The frontend updates these two fields in Redux and navigates to the resulting
profile URL, preserving email, role, wishlist and basket.

Errors: `400` for invalid fields/files, `401` for an expired session,
`409` for a username already taken, with `{ "message": "…" }`.
The backend must validate username uniqueness and image contents and authorize
the account independently of the frontend route guard.

## Existing password recovery

The “Change password” section offers “Send reset link” and reuses `requestNewPassword`:
`POST /api/users/forgot-password` with `{ "email": "<current account email>" }`.
Email is displayed as text and cannot be changed here. The existing reset link
and `ResetPasswordForm` continue to use
`PATCH /api/users/reset-password/:resetToken` with `{ "newPassword": "…" }`.
The profile editor has no password inputs and needs no separate password-change
endpoint. Password entry happens only in the existing reset form; its fields
start empty and are never populated from profile data.
