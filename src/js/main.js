/* jshint esversion: 6 */

import html2canvas from 'html2canvas';

export default class App {

	constructor() {}

	init() {
		const body = document.querySelector('body');
		const save = document.querySelector('.btn--export');
		Promise.all([this.getOutputs(), this.getInputs()]).then(datas => {
			this.onSave = this.onSave.bind(this);
			save.addEventListener('click', this.onSave);
		});
	}

	getOutputs() {
		return fetch('./api/outputs').then(response => response.json()).then((json) => {
			this.outputs = json.filter(x => x.indexOf('.png') !== -1);
			console.log(this.outputs);
		});
	}

	getInputs() {
		return fetch('./api/inputs').then(response => response.json()).then((json) => {
			this.inputs = json;
			console.log(this.inputs);
		});
	}

	onPost(data) {
		fetch('./api/save', {
			method: 'post',
			body: JSON.stringify(data)
		}).then((response) => {
			return response.json();
		}).then((json) => {
			console.log(json);
		});
	}

	onSave() {
		this.items = this.inputs.filter(x => this.outputs.indexOf(x.name) === -1);
		this.total = this.items.length;
		this.onNext();
	}

	onNext() {
		const info = document.querySelector('.info');
		const total = this.total;
		if (this.items.length) {
			const index = total - this.items.length + 1;
			info.innerHTML = `exporting ${index} of ${total}`;
			const item = this.items.shift();
			const card = document.querySelector('.card');
			card.setAttribute('class', 'card');
			card.classList.add('card--2');
			card.querySelector('.text').innerHTML = item.text;
			const icon = fetch(`icons/${item.icon}`).then(response => response.text()).then(html => {
				card.querySelector('.icon').innerHTML = html;
				const svg = card.querySelector('.icon svg');
				svg.setAttribute('fill', '#ffc600');
				if (!svg.hasAttribute('viewBox')) {
					svg.setAttribute('viewBox', '0 0 24 24');
				}
				this.toCanvas(card).then(canvas => {
					// this.download(canvas, item.name);
					this.saveToDisk(canvas, item.name).then(saved => {
						setTimeout(() => {
							this.onNext();
						}, 400);
					});
				});
			});
		} else if (total === 0) {
			info.innerHTML = `nothing to export!`;
		} else {
			info.innerHTML = `export complete!`;
		}
	}

	saveToDisk(canvas, filename = 'snapshot.png') {
		const dataUrl = canvas.toDataURL('image/png', 0.92);
		if (!dataUrl) {
			console.error('Console.save: No picture');
			return;
		}
		return fetch('./api/saveToDisk', {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				dataUrl,
				filename
			})
		}).then((response) => {
			return response.json();
		}).then((json) => {
			console.log(json);
		});
	}

	download(canvas, filename = 'snapshot.png') {
		const dataUrl = canvas.toDataURL('image/png', 0.92);
		// console.log('dataUrl', dataUrl);
		// console.log('saveImage', image);
		if (!dataUrl) {
			console.error('Console.save: No picture');
			return;
		}
		// const blob = image; // new Blob(image, { type: 'image/png' });
		const event = document.createEvent('MouseEvents');
		const anchor = document.createElement('a');
		anchor.download = filename;
		anchor.href = dataUrl;
		event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		anchor.dispatchEvent(event);
	}

	toCanvas(node) {
		return new Promise((resolve, reject) => {
			if (node) {
				html2canvas(node, {
					backgroundColor: '#ffffff00',
				}).then(canvas => {
					// !!!
					// document.body.appendChild(canvas);
					// const alpha = this.getAlphaFromCanvas(canvas);
					// document.body.appendChild(alpha);
					resolve(canvas);
				});
			} else {
				reject('node not found');
			}
		});
	}

}

var app = new App();

window.onload = () => {
	app.init();
};
