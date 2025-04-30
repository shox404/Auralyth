import { LearnLanguage } from "@/app/promts/language";
import { parseMermaidToReactFlow } from "@/app/scripts/diagram";
import { NextResponse } from "next/server";
import { openai } from "../utils";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: LearnLanguage(prompt),
        },
      ],
    });

    const aiResponse = completion.choices[0]?.message.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "AI response is empty" },
        { status: 400 }
      );
    }

    return NextResponse.json(parseMermaidToReactFlow(aiResponse));
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
