// @ts-nocheck
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.170.0/http/file_server.ts";

serve((req) => {
  // Redirect /.well-known/webfinger to mas.mk1.io
  if (req.url.includes("/.well-known/webfinger")) {
    const reqURL = new URL(req.url);
    const path = reqURL.pathname;
    const search = reqURL.search;
    const dest = `https://mas.mk1.io${path}${search}`;
    return new Response(null, {
      status: 301,
      headers: {
        "Location": dest,
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  return serveDir(req, {
    fsRoot: "./.output/public",
  });
});
