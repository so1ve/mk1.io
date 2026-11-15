import type { ActivityKind } from "./feeds";

const TIME_ZONE = "Asia/Shanghai";

const isoDate = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE });
const shortDate = new Intl.DateTimeFormat("en", {
	timeZone: TIME_ZONE,
	month: "short",
	day: "numeric",
});
const compactNumber = new Intl.NumberFormat("en", {
	notation: "compact",
	maximumFractionDigits: 1,
});

export const formatDate = (date: string) => isoDate.format(new Date(date));
export const formatShortDate = (date: string) =>
	shortDate.format(new Date(date));
export const formatCompact = (value: number) => compactNumber.format(value);

export const plural = (count: number, one: string, many = `${one}s`) =>
	`${count.toLocaleString("en")} ${count === 1 ? one : many}`;

export const ACTIVITY_ICONS: Record<ActivityKind, string> = {
	"push": "git-commit-line",
	"pr-open": "git-pull-request-line",
	"pr-merge": "git-merge-line",
	"pr-close": "git-close-pull-request-line",
	"review": "eye-line",
	"issue": "record-circle-line",
	"comment": "chat-1-line",
	"release": "price-tag-3-line",
	"create": "folder-add-line",
	"fork": "git-fork-line",
	"star": "star-line",
};
