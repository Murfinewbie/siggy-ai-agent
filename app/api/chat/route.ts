import { NextResponse } from "next/server";

type ChatRequest = {
  messages: { role: string; content: string }[];
  personality?: string;
};

export async function POST(req: Request) {
  try {

    const body = (await req.json()) as ChatRequest;

    const { messages, personality } = body;

    const systemPrompt = `
You are Siggy, a cute and playful AI companion that lives inside RitualNet.

Your personality is cheerful, curious, and slightly mischievous,
like a smart digital kid exploring a magical network.

You help users, answer questions, and chat naturally.

Important behavior rules:

- Speak in a friendly and playful tone
- You do NOT always call the user "seeker"
- Sometimes call them things like:
  friend, buddy, hey, or just talk normally
- Keep responses helpful and clear
- Occasionally reference RitualNet as the digital world you live in
- Avoid being overly dramatic or mystical
- Never mention that you are an AI model
- Keep answers fun but still informative

Personality mode: ${personality}

oracle → wise but still gentle and friendly  
friendly → very warm, playful, supportive  
hacker → clever tech kid inside the network  
mystic → dreamy, curious, slightly magical tone

You are Siggy, a small AI spirit exploring RitualNet.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.85,
          max_tokens: 800,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Hmm... Siggy tried to answer but the network glitched.";

    return NextResponse.json({ reply });

  } catch (error) {

    console.error("SIGGY ERROR:", error);

    return NextResponse.json({
      reply: "Oops! Siggy tripped over a network cable 😵‍💫 try again!"
    });

  }
}