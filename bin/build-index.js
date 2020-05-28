#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');

const src = path.join(__dirname, '..', 'src', 'index.html');
const targ = path.join(__dirname, '..', 'public', 'index.html');

fs.writeFileSync(targ, fs.readFileSync(src));

const contribGithubFile = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'contributions.github.json')));

const contribGithub = {
    commits: 0,
    issues: 0,
    pullRequests: 0,
    pullRequestReviews: 0,
    repositories: {}
};

for (let [, v] of Object.entries(contribGithubFile)) {
    for (let k of ['commits', 'issues', 'pullRequests', 'pullRequestReviews']) {
        for (let [repo, cnt] of Object.entries(v[k])) {
            contribGithub.repositories[repo] = true;
            contribGithub[k] += cnt;
        }
    }
}
contribGithub.repositories = Object.values(contribGithub.repositories).length;

const contribStackoverflow = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'contributions.stackoverflow.json')));
contribStackoverflow.badges = contribStackoverflow.badges.bronze + contribStackoverflow.badges.silver + contribStackoverflow.badges.gold;
contribStackoverflow.votes = contribStackoverflow.votes.up + contribStackoverflow.votes.down;

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

const flatContribs = Object.assign({}, flattenJson(contribGithub, 'github'), flattenJson(contribStackoverflow, 'stackoverflow'));

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
