function buildAuthCookieOptions({ secure }) {
  const isSecure = Boolean(secure);
  return {
    httpOnly: true,
    // For Vercel (frontend) -> Render (backend), cookies are cross-site.
    // Browsers require SameSite=None + Secure for cross-site cookies.
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    path: "/",
  };
}

module.exports = { buildAuthCookieOptions };

