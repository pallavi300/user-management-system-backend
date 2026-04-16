function buildAuthCookieOptions({ secure }) {
  return {
    httpOnly: true,
    secure: Boolean(secure),
    sameSite: "lax",
    path: "/",
  };
}

module.exports = { buildAuthCookieOptions };

