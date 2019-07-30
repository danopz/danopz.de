#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');

const src = path.join(__dirname, '..', 'src', 'index.html');
const targ = path.join(__dirname, '..', 'public', 'index.html');

fs.writeFileSync(targ, fs.readFileSync(src));

const contributions = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'contributions.json')));

const flattenJson = function(element, key, res) {
    res = res || {};

    if (typeof element === 'object') {
        Object.keys(element).forEach(function(k) {
            var newK = key ? key + '.' + k : k;
            flattenJson(element[k], newK, res);
        });
    } else {
        res[key] = element;
    }

    return res;
};

contributions.stackoverflow.badges = contributions.stackoverflow.badges.bronze + contributions.stackoverflow.badges.silver + contributions.stackoverflow.badges.gold;
contributions.stackoverflow.votes = contributions.stackoverflow.votes.up + contributions.stackoverflow.votes.down;

flatContribs = flattenJson(contributions);

replace.sync({
    files: targ,
    from: /\$\{.+\}/g,
    to: function(match) {
        match = match.substring(2, match.length-1);

        if (!flatContribs.hasOwnProperty(match)) {
            throw new Error(`Key ${match} not found in contributions!`);
        }

        return flatContribs[match];
    }
});
