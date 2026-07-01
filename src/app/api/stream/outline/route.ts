import { generateOutline } from "@/server/ai/pipelines/outline-generator";
import { ensureDevUser } from "@/server/services/user";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title: string;
    description?: string;
  };

  const authDisabled = process.env.AUTH_DISABLED === "true";
  if (!authDisabled) {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
  } else {
    await ensureDevUser();
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        send("progress", { step: "analyzing", percent: 10 });
        await delay(300);
        send("progress", { step: "structuring", percent: 40 });
        await delay(300);
        send("progress", { step: "generating", percent: 70 });

        const outline = await generateOutline(body);

        send("progress", { step: "complete", percent: 100 });
        send("result", { outline });
      } catch (error) {
        send("error", { message: String(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
