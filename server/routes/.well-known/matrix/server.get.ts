export default defineEventHandler((event) => {
	const host = getRequestHost(event, { xForwardedHost: false });

	return {
		"m.server": `matrix.${host}:443`,
	};
});
