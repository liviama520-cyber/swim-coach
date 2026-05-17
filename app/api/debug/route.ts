export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY
  return Response.json({ 
    hasKey: !!key, 
    keyStart: key ? key.slice(0, 15) + '...' : null,
    keyLength: key?.length 
  })
}
