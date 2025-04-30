import { AboutTheme } from "@/app/promts/language";
import { NextResponse } from "next/server";
import { openai } from "../utils";

export async function POST(request: Request) {
  try {
    const { label } = await request.json();

    if (!label) {
      return NextResponse.json(
        { error: "Label is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: AboutTheme(label),
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

    return NextResponse.json(aiResponse);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
