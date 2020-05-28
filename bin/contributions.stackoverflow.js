#!/usr/bin/env node

const err = (message) => {
    console.error(message);
    process.exit(1);
};

// imports
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const url = require('url');

var file = path.join(__dirname, '..', 'src', 'contributions.stackoverflow.json')

// let's check if a custom output filepath is provided as arg
if (process.argv[2]) {
    let p = process.argv[2];
    let f = p[0] === '/' ? p : path.join(process.env.PWD, p);

    try {
        // check file existance, readable and writable
        fs.accessSync(f, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        err(`The file "${f}" has to be created first and must be readable|writable to the script.`);
    }

    file = f;
}

console.log(`Fetch data, write result to file "${file}".`);

// @link https://gist.github.com/ktheory/df3440b01d4b9d3197180d5254d7fb65
const httpRequest = (urlOptions, data = '') => {
    return new Promise((resolve, reject) => {
        const req = https.request(urlOptions, (res) => {
            let body = [];
            res.on('data', (chunk) => (body.push(chunk)));
            res.on('error', reject);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode <= 299) {
                    resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(body) });
                } else {
                    reject('Request failed. status: ' + res.statusCode + ', body: ' + Buffer.concat(body));
                }
            });
        });
        req.on('error', reject);
        req.write(data, 'binary');
        req.end();
    });
};

httpRequest('https://api.stackexchange.com/2.2/users/3893182?site=stackoverflow&filter=!0Z-YCJvQuo1AV3KBboAG9AL2A')
    .then((data) => {
        return JSON.parse(zlib.gunzipSync(data.body).toString());
    })
    .then((body) => {
        let output = {
            badges: {
                bronze: 0,
                silver: 0,
                gold: 0
            },
            votes: {
                up: 0,
                down: 0
            },
            answers: 0,
            questions: 0,
            reputation: 0
        };

        output.answers = body.items[0].answer_count;
        output.badges.bronze = body.items[0].badge_counts.bronze;
        output.badges.gold = body.items[0].badge_counts.gold;
        output.badges.silver = body.items[0].badge_counts.silver;
        output.questions = body.items[0].question_count;
        output.reputation = body.items[0].reputation;
        output.votes.down = body.items[0].down_vote_count;
        output.votes.up = body.items[0].up_vote_count;

        return output;
    })
    .then((output) => {
        fs.writeFileSync(file, JSON.stringify(output));
    })
    .catch(err);
