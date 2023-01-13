// @ts-expect-error Deno
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
// @ts-expect-error Deno
import { serveDir } from "https://deno.land/std@0.170.0/http/file_server.ts";

serve((req) => {
  return serveDir(req, {
    fsRoot: "./.output/public",
  });
});
