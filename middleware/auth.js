export function verifySecret(req, res, next) {
  const clientKey = req.headers['x-api-key'];
  const serverKey = process.env.API_SECRET_KEY;

  if (clientKey && clientKey === serverKey) {
    return next();
  } else {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }
}
