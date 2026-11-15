# Ray's Homepage

Designed by [@AkaraChen](https://github.com/AkaraChen)

Visit <https://mk1.io> for more information.

## Scheduled deployment

Cloudflare Pages builds and deploys `main` through its Git integration. The
`Rebuild Cloudflare Pages` workflow also triggers a build every six hours at
00:17, 06:17, 12:17 and 18:17 UTC, and supports manual runs. GitHub may delay
scheduled runs.

Create a deploy hook for `main` in the `mk1-io` Pages project and store its URL
as the repository Actions secret `CLOUDFLARE_DEPLOY_HOOK`. Treat the URL as a
secret: anyone who has it can trigger builds. No Cloudflare API token is needed.
Keep the Pages build's `GITHUB_TOKEN` secret for fetching GitHub data.

These scheduled builds use about 120–124 of the Free plan's 500 monthly builds,
in addition to builds triggered by code changes.
