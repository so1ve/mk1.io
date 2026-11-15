export const BLOG_URL = "https://blog.mk1.io";
export const GITHUB_USER = "so1ve";

export interface Post {
	title: string;
	url: string;
	date: string;
	category: string;
	excerpt: string | null;
}

export type ActivityKind =
	| "push"
	| "pr-open"
	| "pr-merge"
	| "pr-close"
	| "review"
	| "issue"
	| "comment"
	| "release"
	| "create"
	| "fork"
	| "star";

export interface ActivityDetail {
	text: string;
	url: string;
	/** Short commit hash, shown before the message. */
	sha?: string;
}

export interface Activity {
	kind: ActivityKind;
	action: string;
	repo: string;
	/** Branch, PR/issue number or tag shown after the repository. */
	ref?: string;
	url: string;
	date: string;
	details: ActivityDetail[];
	/** Commits in a push beyond the ones listed in `details`. */
	moreCommits: number;
}

export interface Project {
	owner: string;
	name: string;
	forks: number;
	description: string;
	language: string | null;
	stars: number;
	url: string;
}

export interface Profile {
	avatar: string;
	followers: number;
	repos: number;
}

export interface ContributionDay {
	date: string;
	count: number;
	level: number;
}

export interface Friend {
	name: string;
	url: string;
	avatar: string;
}

const ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
};

const decodeEntities = (text: string) =>
	text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (entity, code: string) => {
		if (code.startsWith("#x") || code.startsWith("#X")) {
			return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
		}
		if (code.startsWith("#")) {
			return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
		}

		return ENTITIES[code] ?? entity;
	});

function readOptionalTag(item: string, name: string) {
	const match = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));

	return match && decodeEntities(match[1]!.trim());
}

function readTag(item: string, name: string) {
	const value = readOptionalTag(item, name);
	if (value === null) {
		throw new Error(`${BLOG_URL}/rss.xml: item has no <${name}>`);
	}

	return value;
}

const fetchText = (url: string) =>
	$fetch<string>(url, { responseType: "text" });

export async function fetchPosts(limit: number): Promise<Post[]> {
	const xml = await fetchText(`${BLOG_URL}/rss.xml`);

	return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
		.slice(0, limit)
		.map(([, item]) => {
			const url = readTag(item!, "link");
			// Inkcairn places posts under /posts/<category>/<slug>.html.
			const category = decodeURIComponent(
				new URL(url).pathname.split("/").at(-2)!,
			);

			return {
				title: readTag(item!, "title"),
				url,
				date: new Date(readTag(item!, "pubDate")).toISOString(),
				category,
				// Inkcairn omits <description> for posts without an excerpt.
				excerpt: readOptionalTag(item!, "description"),
			};
		});
}

export async function fetchFriends(): Promise<Friend[]> {
	const html = await fetchText(`${BLOG_URL}/links.html`);

	return [
		...html.matchAll(
			/<a class="friend-link" href="([^"]+)">[\s\S]*?<img src="([^"]+)"[\s\S]*?class="friend-link-name">([^<]+)</g,
		),
	].map(([, url, avatar, name]) => ({
		url: decodeEntities(url!),
		avatar: decodeEntities(avatar!),
		name: decodeEntities(name!),
	}));
}

const githubApi = (path: string) =>
	$fetch<any>(path, {
		baseURL: "https://api.github.com",
		headers: {
			Accept: "application/vnd.github+json",
			// Optional at build time; raises the 60 requests/hour anonymous limit.
			...(process.env.GITHUB_TOKEN && {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			}),
		},
	});

export async function fetchProfile(): Promise<Profile> {
	const user = await githubApi(`/users/${GITHUB_USER}`);

	return {
		avatar: user.avatar_url,
		followers: user.followers,
		repos: user.public_repos,
	};
}

// GitHub has no public API for the contribution calendar, so read the same
// fragment that github.com renders on the profile page.
export async function fetchContributions(): Promise<ContributionDay[]> {
	const html = await fetchText(
		`https://github.com/users/${GITHUB_USER}/contributions`,
	);
	const counts = new Map(
		[
			...html.matchAll(
				/<tool-tip [^>]*for="([^"]+)"[^>]*>(No|\d+) contributions? on/g,
			),
		].map(([, id, count]) => [id!, count === "No" ? 0 : Number(count)]),
	);
	const days = [
		...html.matchAll(
			/<td [^>]*data-date="([\d-]+)" id="([^"]+)" data-level="(\d)"/g,
		),
	].map(([, date, id, level]) => {
		const count = counts.get(id!);
		if (count === undefined) {
			throw new Error(`GitHub contributions: no count for ${date}`);
		}

		return { date: date!, count, level: Number(level) };
	});
	if (days.length === 0) {
		throw new Error("GitHub contributions: calendar markup not found");
	}

	return days.sort((a, b) => a.date.localeCompare(b.date));
}

const MAX_COMMITS = 3;

const firstLine = (text: string) => text.split("\n", 1)[0]!.trim();

function excerpt(markdown: string, length = 120) {
	const text = markdown
		.replaceAll(/```[\s\S]*?```/g, " ")
		.replaceAll(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replaceAll(/[#*_`>]/g, "")
		.replaceAll(/\s+/g, " ")
		.trim();

	return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

const branchName = (ref: string) => ref.replace(/^refs\/heads\//, "");

// The events feed only carries identifiers, so each entry fetches the commit
// messages, titles or text it shows.
async function describeEvent(
	event: any,
): Promise<Omit<Activity, "date"> | undefined> {
	const repo: string = event.repo.name;
	const repoUrl = `https://github.com/${repo}`;
	const { payload } = event;
	const base = { repo, details: [], moreCommits: 0 };

	switch (event.type) {
		case "PushEvent": {
			const branch = branchName(payload.ref);
			// A push that creates a branch has an all-zero `before`, and a force
			// push may leave nothing ahead of it; fall back to the head commit.
			const compare = /^0+$/.test(payload.before)
				? undefined
				: await githubApi(
						`/repos/${repo}/compare/${payload.before}...${payload.head}`,
					);
			const hasRange = compare !== undefined && compare.total_commits > 0;
			const commits: any[] = hasRange
				? // Compare lists commits oldest first; show the newest.
					compare.commits.toReversed()
				: [await githubApi(`/repos/${repo}/commits/${payload.head}`)];
			const total: number = hasRange ? compare.total_commits : 1;
			const shown = commits.slice(0, MAX_COMMITS);

			return {
				...base,
				kind: "push",
				action: "Pushed to",
				ref: branch,
				url:
					total === 1
						? commits[0].html_url
						: `${repoUrl}/compare/${payload.before.slice(0, 12)}...${payload.head.slice(0, 12)}`,
				details: shown.map((commit) => ({
					text: firstLine(commit.commit.message),
					url: commit.html_url,
					sha: commit.sha.slice(0, 7),
				})),
				moreCommits: total - shown.length,
			};
		}
		case "PullRequestEvent": {
			const merged =
				payload.action === "merged" ||
				(payload.action === "closed" && payload.pull_request.merged);
			const action = merged
				? "Merged"
				: { opened: "Opened", reopened: "Reopened", closed: "Closed" }[
						payload.action as string
					];
			if (!action) {
				return;
			}
			const pull = await githubApi(`/repos/${repo}/pulls/${payload.number}`);

			return {
				...base,
				kind: merged
					? "pr-merge"
					: action === "Closed"
						? "pr-close"
						: "pr-open",
				action: `${action} pull request in`,
				ref: `#${payload.number}`,
				url: pull.html_url,
				details: [{ text: pull.title, url: pull.html_url }],
			};
		}
		case "PullRequestReviewEvent": {
			const pull = await githubApi(
				`/repos/${repo}/pulls/${payload.pull_request.number}`,
			);

			return {
				...base,
				kind: "review",
				action: "Reviewed pull request in",
				ref: `#${pull.number}`,
				url: payload.review?.html_url ?? pull.html_url,
				details: [{ text: pull.title, url: pull.html_url }],
			};
		}
		case "IssuesEvent": {
			const action = {
				opened: "Opened",
				closed: "Closed",
				reopened: "Reopened",
			}[payload.action as string];
			if (!action) {
				return;
			}

			return {
				...base,
				kind: "issue",
				action: `${action} issue in`,
				ref: `#${payload.issue.number}`,
				url: payload.issue.html_url,
				details: [{ text: payload.issue.title, url: payload.issue.html_url }],
			};
		}
		case "IssueCommentEvent": {
			const comment = await githubApi(
				`/repos/${repo}/issues/comments/${payload.comment.id}`,
			);
			const kind = payload.issue.pull_request ? "pull request" : "issue";

			return {
				...base,
				kind: "comment",
				action: `Commented on ${kind} in`,
				ref: `#${payload.issue.number}`,
				url: comment.html_url,
				details: [
					{ text: payload.issue.title, url: payload.issue.html_url },
					...(excerpt(comment.body)
						? [{ text: excerpt(comment.body), url: comment.html_url }]
						: []),
				],
			};
		}
		case "ReleaseEvent": {
			const release = await githubApi(
				`/repos/${repo}/releases/${payload.release.id}`,
			);

			return {
				...base,
				kind: "release",
				action: "Released",
				ref: release.tag_name,
				url: release.html_url,
				details: release.name
					? [{ text: release.name, url: release.html_url }]
					: [],
			};
		}
		case "CreateEvent": {
			return payload.ref_type === "repository"
				? {
						...base,
						kind: "create",
						action: "Created repository",
						url: repoUrl,
						details: payload.description
							? [{ text: payload.description, url: repoUrl }]
							: [],
					}
				: undefined;
		}
		case "ForkEvent": {
			return {
				...base,
				kind: "fork",
				action: "Forked",
				url: payload.forkee.html_url,
				details: [
					{
						text: `to ${payload.forkee.full_name}`,
						url: payload.forkee.html_url,
					},
				],
			};
		}
		case "WatchEvent": {
			return { ...base, kind: "star", action: "Starred", url: repoUrl };
		}
	}
}

// Branch and tag creation or deletion is noise next to the pushes themselves.
const SHOWN_EVENTS = new Set([
	"PushEvent",
	"PullRequestEvent",
	"PullRequestReviewEvent",
	"IssuesEvent",
	"IssueCommentEvent",
	"ReleaseEvent",
	"CreateEvent",
	"ForkEvent",
	"WatchEvent",
]);

export async function fetchActivity(limit: number): Promise<Activity[]> {
	const events: any[] = await githubApi(
		`/users/${GITHUB_USER}/events/public?per_page=100`,
	);
	// The endpoint does not guarantee chronological order.
	events.sort((a, b) => b.created_at.localeCompare(a.created_at));

	const picked: any[] = [];
	for (const event of events) {
		const previous = picked.at(-1);
		// Consecutive pushes to one branch read as a single entry whose compare
		// range covers all of them.
		if (
			event.type === "PushEvent" &&
			previous?.type === "PushEvent" &&
			previous.repo.name === event.repo.name &&
			previous.payload.ref === event.payload.ref
		) {
			previous.payload = { ...previous.payload, before: event.payload.before };
			continue;
		}
		if (SHOWN_EVENTS.has(event.type)) {
			picked.push(event);
		}
	}

	const activity: Activity[] = [];
	for (const event of picked) {
		const described = await describeEvent(event);
		if (described) {
			activity.push({ ...described, date: event.created_at });
		}
		if (activity.length === limit) {
			break;
		}
	}

	return activity;
}

async function fetchPinnedRepos() {
	const html = await fetchText(`https://github.com/${GITHUB_USER}`);
	const repos = [
		...html.matchAll(
			// Owned repositories omit the owner prefix, so match up to the name span.
			/href="\/([^"/]+\/[^"/]+)"[^>]*>(?:<span class="owner[^"]*">[^<]*<\/span>)?<span class="repo">/g,
		),
	].map(([, repo]) => repo!);
	if (repos.length === 0) {
		throw new Error(`github.com/${GITHUB_USER}: no pinned repositories found`);
	}

	return repos;
}

// Mirrors the repositories pinned on the GitHub profile.
export async function fetchProjects(): Promise<Project[]> {
	const repos = await fetchPinnedRepos();

	return Promise.all(
		repos.map(async (repo) => {
			const data = await githubApi(`/repos/${repo}`);

			return {
				owner: data.owner.login,
				name: data.name,
				description: data.description ?? "",
				language: data.language,
				stars: data.stargazers_count,
				forks: data.forks_count,
				url: data.html_url,
			};
		}),
	);
}
