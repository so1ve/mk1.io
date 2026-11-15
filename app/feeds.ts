import { parse as parseYaml } from "yaml";

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

export interface Activity {
	kind: ActivityKind;
	action: string;
	repo: string;
	/** Branch, PR/issue number or tag shown after the repository. */
	ref?: string;
	/** Commit message, PR or issue title, or comment excerpt. */
	title?: string;
	url: string;
	date: string;
	/** Commits in a push besides the one in `title`. */
	moreCommits: number;
}

export interface Language {
	name: string;
	color: string | null;
}

export interface HotSpot {
	repo: string;
	url: string;
	language: Language | null;
	commits: number;
	pullRequests: number;
	/** Commits per week, oldest first, covering the whole window. */
	weeks: number[];
}

export interface Project {
	owner: string;
	name: string;
	description: string;
	language: Language | null;
	stars: number;
	forks: number;
	url: string;
	pushedAt: string;
	archived: boolean;
}

export interface Repositories {
	pinned: Project[];
	/** Public repositories owned by the user, most recently pushed first. */
	owned: Project[];
	/** Other people's repositories the user committed to or opened PRs in. */
	contributed: Project[];
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
	avatar: string | null;
	description: string | null;
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

// blog.mk1.io blocks requests from CI runners, so read the page source from
// the blog repository instead of the rendered HTML.
const FRIENDS_SOURCE =
	"https://raw.githubusercontent.com/so1ve/blog.mk1.io/main/pages/03-links.md";

export async function fetchFriends(): Promise<Friend[]> {
	const markdown = await fetchText(FRIENDS_SOURCE);
	const block = markdown.match(/```friends\n([\s\S]*?)\n```/)?.[1];
	if (block === undefined) {
		throw new Error(`${FRIENDS_SOURCE}: no friends block found`);
	}
	const friends: {
		name: string;
		url: string;
		avatar?: string;
		description?: string;
	}[] = parseYaml(block);

	return friends.map(({ name, url, avatar, description }) => ({
		name,
		url,
		avatar: avatar ?? null,
		description: description ?? null,
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

async function githubGraphql(
	query: string,
	variables: Record<PropertyKey, unknown>,
) {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		throw new Error("GITHUB_TOKEN is required to query the GitHub GraphQL API");
	}
	const response = await $fetch<{ data?: any; errors?: { message: string }[] }>(
		"https://api.github.com/graphql",
		{
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: { query, variables },
		},
	);
	if (response.errors?.length) {
		throw new Error(
			`GitHub GraphQL: ${response.errors.map((error) => error.message).join("; ")}`,
		);
	}

	return response.data;
}

const HOT_SPOTS_QUERY = `
	query ($login: String!, $from: DateTime!, $to: DateTime!) {
		user(login: $login) {
			contributionsCollection(from: $from, to: $to) {
				commitContributionsByRepository(maxRepositories: 25) {
					repository { nameWithOwner url primaryLanguage { name color } }
					contributions(first: 100) { nodes { occurredAt commitCount } }
				}
				pullRequestContributionsByRepository(maxRepositories: 25) {
					repository { nameWithOwner url primaryLanguage { name color } }
					contributions(first: 100) { nodes { occurredAt } }
				}
			}
		}
	}
`;

const DAY = 24 * 60 * 60 * 1000;

// Repositories that received the most commits and pull requests over the last
// `weeks` weeks, each with a per-week commit count.
export async function fetchHotSpots(
	weeks: number,
	limit: number,
): Promise<HotSpot[]> {
	const to = new Date();
	const from = new Date(to.getTime() - weeks * 7 * DAY);
	const data = await githubGraphql(HOT_SPOTS_QUERY, {
		login: GITHUB_USER,
		from: from.toISOString(),
		to: to.toISOString(),
	});
	const collection = data.user.contributionsCollection;
	const weekOf = (date: string) =>
		Math.min(
			weeks - 1,
			Math.floor((new Date(date).getTime() - from.getTime()) / (7 * DAY)),
		);

	const spots = new Map<string, HotSpot>();
	function spotFor(repository: any) {
		let spot = spots.get(repository.nameWithOwner);
		if (!spot) {
			spot = {
				repo: repository.nameWithOwner,
				url: repository.url,
				language: repository.primaryLanguage,
				commits: 0,
				pullRequests: 0,
				weeks: Array.from({ length: weeks }, () => 0),
			};
			spots.set(spot.repo, spot);
		}

		return spot;
	}

	for (const {
		repository,
		contributions,
	} of collection.commitContributionsByRepository) {
		const spot = spotFor(repository);
		for (const { occurredAt, commitCount } of contributions.nodes) {
			spot.commits += commitCount;
			spot.weeks[weekOf(occurredAt)]! += commitCount;
		}
	}
	for (const {
		repository,
		contributions,
	} of collection.pullRequestContributionsByRepository) {
		spotFor(repository).pullRequests += contributions.nodes.length;
	}

	// A pull request usually stands for more work than a single commit.
	const weight = (spot: HotSpot) => spot.commits + spot.pullRequests * 5;

	return [...spots.values()]
		.sort((a, b) => weight(b) - weight(a))
		.slice(0, limit);
}

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
	const base = { repo, moreCommits: 0 };

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
			// Compare lists commits oldest first.
			const newest = hasRange
				? compare.commits.at(-1)
				: await githubApi(`/repos/${repo}/commits/${payload.head}`);
			const total: number = hasRange ? compare.total_commits : 1;

			return {
				...base,
				kind: "push",
				action: "Pushed to",
				ref: branch,
				title: firstLine(newest.commit.message),
				url:
					total === 1
						? newest.html_url
						: `${repoUrl}/compare/${payload.before.slice(0, 12)}...${payload.head.slice(0, 12)}`,
				moreCommits: total - 1,
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
				title: pull.title,
				url: pull.html_url,
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
				title: pull.title,
				url: payload.review?.html_url ?? pull.html_url,
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
				title: payload.issue.title,
				url: payload.issue.html_url,
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
				title: excerpt(comment.body) || payload.issue.title,
				url: comment.html_url,
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
				title: release.name ?? undefined,
				url: release.html_url,
			};
		}
		case "CreateEvent": {
			return payload.ref_type === "repository"
				? {
						...base,
						kind: "create",
						action: "Created repository",
						title: payload.description ?? undefined,
						url: repoUrl,
					}
				: undefined;
		}
		case "ForkEvent": {
			return {
				...base,
				kind: "fork",
				action: "Forked",
				url: payload.forkee.html_url,
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

const REPOSITORY_FIELDS = `
	name
	owner { login }
	description
	url
	stargazerCount
	forkCount
	pushedAt
	isArchived
	primaryLanguage { name color }
`;

const toProject = (repository: any): Project => ({
	owner: repository.owner.login,
	name: repository.name,
	description: repository.description ?? "",
	language: repository.primaryLanguage,
	stars: repository.stargazerCount,
	forks: repository.forkCount,
	url: repository.url,
	pushedAt: repository.pushedAt,
	archived: repository.isArchived,
});

const PINNED_QUERY = `
	query ($login: String!) {
		user(login: $login) {
			pinnedItems(first: 6, types: REPOSITORY) {
				nodes { ... on Repository { ${REPOSITORY_FIELDS} } }
			}
		}
	}
`;

// Mirrors the repositories pinned on the GitHub profile.
export async function fetchPinnedProjects(): Promise<Project[]> {
	const data = await githubGraphql(PINNED_QUERY, { login: GITHUB_USER });

	return data.user.pinnedItems.nodes.map(toProject);
}

const REPOSITORIES_QUERY = `
	query ($login: String!) {
		user(login: $login) {
			pinnedItems(first: 6, types: REPOSITORY) {
				nodes { ... on Repository { ${REPOSITORY_FIELDS} } }
			}
			repositories(
				ownerAffiliations: OWNER
				isFork: false
				privacy: PUBLIC
				first: 100
				orderBy: { field: PUSHED_AT, direction: DESC }
			) {
				nodes { ${REPOSITORY_FIELDS} }
			}
			repositoriesContributedTo(
				first: 30
				includeUserRepositories: false
				contributionTypes: [COMMIT, PULL_REQUEST]
				orderBy: { field: STARGAZERS, direction: DESC }
			) {
				nodes { ${REPOSITORY_FIELDS} }
			}
		}
	}
`;

export async function fetchRepositories(): Promise<Repositories> {
	const { user } = await githubGraphql(REPOSITORIES_QUERY, {
		login: GITHUB_USER,
	});

	return {
		pinned: user.pinnedItems.nodes.map(toProject),
		owned: user.repositories.nodes.map(toProject),
		contributed: user.repositoriesContributedTo.nodes.map(toProject),
	};
}
