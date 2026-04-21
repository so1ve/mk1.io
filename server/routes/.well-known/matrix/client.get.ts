export default defineEventHandler((event) => {
	const host = getRequestHost(event, { xForwardedHost: false });

	return {
		"m.homeserver": {
			base_url: `https://matrix.${host}`,
		},
	};
});
