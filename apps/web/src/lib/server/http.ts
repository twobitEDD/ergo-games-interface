export const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });

export const ok = (body: unknown): Response => json(200, body);
export const created = (body: unknown): Response => json(201, body);
export const badRequest = (message: string): Response => json(400, { error: message });
export const notFound = (message: string): Response => json(404, { error: message });
export const conflict = (message: string): Response => json(409, { error: message });

export const parseJsonBody = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    throw new Error("invalid JSON body");
  }
};
