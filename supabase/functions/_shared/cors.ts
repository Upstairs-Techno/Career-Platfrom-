// supabase/functions/_shared/cors.ts
// Shared CORS headers for all Edge Functions

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, apikey, x-client-info',
  'Access-Control-Expose-Headers': 'Content-Disposition, X-Resume-Content-Type',
  'Access-Control-Max-Age': '86400',
}

export function corsResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export function errorResponse(message: string, status = 400): Response {
  return corsResponse({ error: message, message }, status)
}
