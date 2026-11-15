import {
	fetchActivity,
	fetchContributions,
	fetchFriends,
	fetchHotSpots,
	fetchPosts,
	fetchProfile,
	fetchRepositories,
} from "./feeds";

export const HOT_SPOT_WEEKS = 12;

// Every page is prerendered in one build, so fetch the GitHub and blog data
// once and share it between them.
let siteData: ReturnType<typeof loadSiteData> | undefined;

async function loadSiteData() {
	const [
		posts,
		repositories,
		activity,
		hotSpots,
		contributions,
		profile,
		friends,
	] = await Promise.all([
		fetchPosts(6),
		fetchRepositories(),
		fetchActivity(30),
		fetchHotSpots(HOT_SPOT_WEEKS, 10),
		fetchContributions(),
		fetchProfile(),
		fetchFriends(),
	]);

	return {
		posts,
		repositories,
		activity,
		hotSpots,
		contributions,
		profile,
		friends,
		builtAt: new Date().toISOString(),
	};
}

export async function useSiteData() {
	const { data } = await useAsyncData(
		"site",
		() => (siteData ??= loadSiteData()),
	);

	return data.value!;
}
