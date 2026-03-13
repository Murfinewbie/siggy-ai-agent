export default {

  async fetch(request: Request, env: Env): Promise<Response> {

    // ===== CORS PREFLIGHT =====
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
      })
    }

    // ===== ONLY ALLOW POST =====
    if (request.method !== "POST") {
      return new Response("Send POST request with prompt", {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    try {

      const { prompt } = (await request.json()) as { prompt: string }

      if (!prompt) {
        return new Response("Prompt is required", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        })
      }

      // ===== GENERATE IMAGE =====
      const image = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        {
          prompt: prompt
        }
      )

      // ===== RETURN IMAGE =====
      return new Response(image, {
        headers: {
          "Content-Type": "image/png",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
      })

    } catch (error) {

      return new Response("Image generation failed", {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })

    }

  }

}