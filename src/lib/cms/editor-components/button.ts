import type { EditorComponentOptions } from 'decap-cms-core';

export default {
	id: 'button',
	label: 'Button',
	summary: '{{label}}',
	fields: [
		{
			name: 'link',
			label: 'Link',
			widget: 'string'
		},
		{
			name: 'label',
			label: 'Label',
			widget: 'string'
		},
		{
			label: 'Primary',
			name: 'primary',
			widget: 'boolean'
		}
	],
	pattern: /^<Button (?<primary>primary )?href="(?<link>.+)">(?<label>.+)<\/Button>$/m,
	fromBlock(match) {
		return {
			link: match.groups!.link,
			primary: match.groups!.primary,
			label: match.groups!.label
		};
	},
	toBlock(data) {
		return `<Button ${data.primary ? ' primary' : ''} href="${data.link}">${data.label}</Button>`;
	},
	toPreview(data) {
		return `<button>${data.label}</button>`;
	}
} satisfies EditorComponentOptions;
