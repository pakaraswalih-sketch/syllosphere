import type { IncomingMessage, ServerResponse } from 'node:http';
import { executeAccountDeletion } from './_lib/deleteAccount';

export default async function handler(
  req: IncomingMessage & { method?: string; headers: Record<string, string | string[] | undefined> },
  res: ServerResponse & { status: (code: number) => any; json: (data: any) => any }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawAuth = req.headers.authorization;
  const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;

  const result = await executeAccountDeletion(authHeader);
  return res.status(result.status).json(result.body);
}
