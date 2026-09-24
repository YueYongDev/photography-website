export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  _context: { params: Promise<{ asset?: string[] }> },
) {
  return new Response(null, {
    status: 307,
    headers: {
      Location: "/roadbooks/georgia-2026/index.html#day-3",
    },
  });
}
