import type { EditorComponentOptions } from 'decap-cms-core';

export default {
	id: 'instagram',
	label: 'Instagram Block',
	fields: [
		{
			name: 'link',
			label: 'Link',
			widget: 'string'
		}
	],
	pattern: /^<Instagram link="(?<link>.+)" \/>$/m,
	fromBlock(match) {
		return {
			link: match.groups!.link
		};
	},
	toBlock(data) {
		return `<Instagram link="${data.link}" />`;
	},
	toPreview(data) {
		return `
			<section class="placeholder">
				<i>Shows embedded Instagram for: {data.link}</i>
			</section>
		`;
	}
} satisfies EditorComponentOptions;
