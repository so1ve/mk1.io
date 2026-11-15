<script setup lang="ts">
import type { ContributionDay } from "../feeds";

const props = defineProps<{ days: ContributionDay[] }>();

// Calendar columns start on Sunday, matching GitHub's own layout.
const weeks: ContributionDay[][] = [];
for (const day of props.days) {
	if (weeks.length === 0 || new Date(day.date).getUTCDay() === 0) {
		weeks.push([]);
	}
	weeks.at(-1)!.push(day);
}
const leadingBlanks = new Date(props.days[0]!.date).getUTCDay();
const total = props.days.reduce((sum, day) => sum + day.count, 0);
const activeDays = props.days.filter((day) => day.count > 0).length;

// Calendar dates are plain YYYY-MM-DD values, so format them in UTC.
const dayLabel = new Intl.DateTimeFormat("en", {
	weekday: "short",
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});
const monthLabel = new Intl.DateTimeFormat("en", {
	month: "short",
	timeZone: "UTC",
});
const describeCount = (count: number) =>
	count === 0
		? "No contributions"
		: `${count.toLocaleString("en")} contribution${count === 1 ? "" : "s"}`;
const monthLabels = weeks.flatMap((week, index) => {
	const first = week.find((day) => day.date.endsWith("-01"));

	return first
		? [{ column: index + 1, label: monthLabel.format(new Date(first.date)) }]
		: [];
});
</script>

<template>
	<figure aria-labelledby="calendar-caption" class="calendar">
		<div class="calendar-scroll">
			<div class="calendar-grid" :style="{ '--weeks': weeks.length }">
				<span
					v-for="month in monthLabels"
					:key="month.column"
					class="calendar-month"
					:style="{ gridColumn: month.column }"
				>
					{{ month.label }}
				</span>
				<template v-for="(week, column) in weeks" :key="column">
					<span
						v-for="(day, row) in week"
						:key="day.date"
						class="calendar-day"
						:data-level="day.level"
						:style="{
							gridColumn: column + 1,
							gridRow: (column === 0 ? leadingBlanks + row : row) + 2,
						}"
					>
						<span class="calendar-tip">
							<b>{{ describeCount(day.count) }}</b>
							on {{ dayLabel.format(new Date(day.date)) }}
						</span>
					</span>
				</template>
			</div>
		</div>
		<figcaption id="calendar-caption">
			<span class="calendar-summary">
				{{ total.toLocaleString("en") }} contributions on {{ activeDays }} days
				in the last year
			</span>
			<span aria-hidden="true" class="legend">
				Less
				<span
					v-for="level in 5"
					:key="level"
					class="calendar-day"
					:data-level="level - 1"
				/>
				More
			</span>
		</figcaption>
	</figure>
</template>
