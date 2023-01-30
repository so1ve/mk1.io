// @ts-nocheck
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.170.0/http/file_server.ts";

serve((req) => {
  // Redirect /.well-known/webfinger to mas.mk1.io
  if (req.url.includes("/.well-known/webfinger")) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: "https://mas.mk1.io/.well-known/webfinger",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  return serveDir(req, {
    fsRoot: "./.output/public",
  });
});
