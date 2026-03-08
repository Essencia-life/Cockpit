import type { EditorComponentOptions } from 'decap-cms-core';

export default {
	id: 'image-and-content',
	label: 'Image and Content',
	summary: '{{content}}',
	fields: [
		{
			name: 'image',
			label: 'Image',
			widget: 'file',
			choose_url: false
		},
		{
			name: 'alt',
			label: 'Image alternative text',
			widget: 'string'
		},
		{
			name: 'content',
			label: 'Content',
			widget: 'markdown',
			buttons: [
				'bold',
				'italic',
				'code',
				'link',
				'heading-two',
				'heading-three',
				'heading-four',
				'heading-five',
				'heading-six',
				'quote',
				'bulleted-list',
				'numbered-list'
			]
		},
		{
			label: 'Image right side on large screens',
			name: 'lgRight',
			widget: 'boolean'
		},
		{
			label: 'Image below content on small screens',
			name: 'smBottom',
			widget: 'boolean'
		}
	],
	pattern:
		/^<ImageAndContent image="(?<image>media\/.+?)" alt="(?<alt>.*?)"(?<lgRight> lgRight)?(?<smBottom> smBottom)?>\n\n(?<content>[\s\S]*?)\n\n<\/ImageAndContent>$/m,
	fromBlock(match) {
		return {
			image: match.groups!.image,
			alt: match.groups!.alt,
			content: match.groups!.content,
			lgRight: !!match.groups?.lgRight,
			smBottom: !!match.groups?.smBottom
		};
	},
	toBlock(data) {
		return `<ImageAndContent image="${data.image}" alt="${data.alt}"${data.lgRight ? ' lgRight' : ''}${data.smBottom ? ' smBottom' : ''}>

${data.content}

</ImageAndContent>`;
	},
	toPreview(data) {
		return `
			<section class="image-and-content">
				<div>${data.image} ${data.alt}</div>
				<div>${data.content}</div>
			</section>
		`;
	}
} satisfies EditorComponentOptions;
