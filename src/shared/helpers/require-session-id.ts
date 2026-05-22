import type { FastifyReply, FastifyRequest } from "fastify";

export function requireSessionId(request: FastifyRequest, reply: FastifyReply): string | undefined {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    void reply.status(401).send({ error: "Session ID is required" });
    return undefined;
  }

  return sessionId;
}
