import { NextResponse } from "next/server";
import { generateStory, StoryPayload } from "@/lib/story-generator";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<StoryPayload>;

    const genre = payload.genre?.trim().toLowerCase() || "adventure";
    const setting = payload.setting?.trim() || "a city perched between dusk and dawn";
    const protagonist = payload.protagonist?.trim() || "a restless storyteller";
    const vibe = payload.vibe?.trim() || "electric hope";

    const story = generateStory({ genre, setting, protagonist, vibe });

    return NextResponse.json(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        inputs: { genre, setting, protagonist, vibe },
        story,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[story API]", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to build the story right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
