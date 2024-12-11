import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const agentId = process.env.ELEVEN_LABS_AGENT_ID;
    const apiKey = process.env.ELEVEN_LABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is missing' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch signed URL' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signed_url: data.signed_url }, { status: 200 });
  } catch (error) {
    console.error('ERROR IN `/api/elevenlabs` ::', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
