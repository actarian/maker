/* jshint esversion: 6 */
const bodyParser = require('body-parser');
const files = require('./files');
const express = require('express');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json({
	type: 'application/json',
	limit: '10mb'
}));

app.use(express.static('docs'));

/*
app.get('/', (req, res) => {
	res.send('Hello World!');
	// res.sendFile('./docs/index.html');
});
*/

app.get('/api/outputs', (req, res) => {
	files.readFiles('./output').then((items) => {
		res.json(items.map(x => {
			// console.log(x);
			return x;
		}));
	}, error => {
		res.json(error);
	});
});

app.get('/api/inputs', (req, res) => {
	files.readFiles('./input').then((items) => {
		const inputs = [];
		Promise.all(items.map(x => {
			return files.readFileJson(`input/${x}`).then(data => {
				data.name = x.replace('.json', '.png');
				return data;
			});
		})).then(inputs => {
			// console.log(inputs);
			res.json(inputs);
		});
	}, error => {
		res.json(error);
	});
});

app.get('/api/save', function(req, res) {
	res.send(`Got a GET request<br/><pre>${serialize(req)}</pre>`);
	// res.json({ a: 1 });
});

app.post('/api/saveToDisk', function(req, res) {
	// res.send(`Got a POST request<br/><pre>${serialize(req.body)}</pre>`);
	files.writeImage(req.body.dataUrl, `output/${req.body.filename}`).then(success => {
		res.json({ status: 0 });
	}, error => {
		res.json(error);
	});
});

app.use(function(req, res, next) {
	res.status(404).send("404");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function serialize(o) {
	// Note: cache should not be re-used by repeated calls to JSON.stringify.
	let cache = [];
	const serialized = JSON.stringify(o, function(key, value) {
		if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) !== -1) {
				// Duplicate reference found, discard key
				return;
			}
			// Store value in our collection
			cache.push(value);
		}
		return value;
	}, '\t');
	cache = null; // Enable garbage collection
	return serialized;
}
