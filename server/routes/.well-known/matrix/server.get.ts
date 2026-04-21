export default defineEventHandler((event) => {
	const host = getRequestHost(event, { xForwardedHost: false });

	setResponseHeader(event, "Access-Control-Allow-Origin", "*");
	setResponseHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS");
	setResponseHeader(event, "Access-Control-Allow-Headers", "Content-Type");

	return {
		"m.server": `matrix.${host}:443`,
	};
});
