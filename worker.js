/**
 * Advance Property Assistant (APA)
 * API Worker v0.1
 *
 * First backend endpoint:
 * POST /api/analyze
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Simple health check
    if (request.method === "GET" && url.pathname === "/api/health") {
      return jsonResponse({
        success: true,
        service: "APA",
        version: "0.1",
        status: "online"
      });
    }

    // Photo/property analysis endpoint
    if (request.method === "POST" && url.pathname === "/api/analyze") {
      try {
        const body = await request.json();

        if (!body || !body.photos || !Array.isArray(body.photos)) {
          return jsonResponse(
            {
              success: false,
              error: "No photos were supplied."
            },
            400
          );
        }

        return jsonResponse({
          success: true,
          service: "APA",
          version: "0.1",
          message: "APA received the assessment request.",
          received: {
            photoCount: body.photos.length,
            propertyType: body.propertyType || null,
            interiorExterior: body.interiorExterior || null,
            notes: body.notes || null
          }
        });
      } catch (error) {
        return jsonResponse(
          {
            success: false,
            error: "Invalid request."
          },
          400
        );
      }
    }

    return jsonResponse(
      {
        success: false,
        error: "APA endpoint not found."
      },
      404
    );
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
