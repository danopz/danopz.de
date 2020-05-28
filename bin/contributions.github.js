#!/usr/bin/env node

const err = (message) => {
    console.error(message);
    process.exit(1);
};

// check for GITHUB_TOKEN environment variable
if (!process.env.GITHUB_TOKEN) {
    err('GITHUB_TOKEN environment variable is missing!');
}

// imports
const fs = require('fs');
const path = require('path');
const { GraphQLClient } = require('graphql-request');

var year = new Date().getUTCFullYear();
var file = path.join(__dirname, '..', 'src', 'contributions.github.json')

// let's check the args for being either a year for fetching data from or a file path for the output
for (let i = 2; i <= 3; i++) {
    let p = process.argv[i];
    if (!p) {
        continue;
    }

    if (!isNaN(p)) {
        // it's a number
        // year == 4 digits, github started in 2008
        if (p.length !== 4 || p < 2008) {
            err(`The number "${p}" must have 4 digits and be greater than 2008 to be a valid year.`);
        }

        year = Number(p);
    } else {
        // it's a file/path
        let f = p[0] === '/' ? p : path.join(process.env.PWD, p);

        try {
            // check file existance, readable and writable
            fs.accessSync(f, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
        } catch (e) {
            err(`The file "${f}" has to be created first and must be readable|writable to the script.`);
        }

        file = f;
    }
}

console.log(`Fetch data for year ${year}, write result to file "${file}".`);

try {
    var output = JSON.parse(fs.readFileSync(file));
} catch (e) {
    var output = {};
}

const gqclient = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
        Authorization: 'Bearer ' + process.env.GITHUB_TOKEN
    }
});
const gqquery = `query($login: String!, $from: DateTime, $to: DateTime) {
    user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
            commitContributionsByRepository {contributions { totalCount } repository { nameWithOwner }}
            contributionYears
            issueContributionsByRepository {contributions { totalCount } repository { nameWithOwner }}
            pullRequestContributionsByRepository {contributions { totalCount } repository { nameWithOwner }}
            pullRequestReviewContributionsByRepository {contributions { totalCount } repository { nameWithOwner }}
        }
    }
}`;
const gqvars = {
    login: 'danopz', // TODO dynamic?
    from: `${year}-01-01T00:00:00`,
    to: `${year}-12-31T23:59:59`
};

gqclient.request(gqquery, gqvars).then(response => {
    if (!response.user || !response.user.contributionsCollection) {
        err('GraphQL response is missing ".user.contributionsCollection"');
    }

    const contributionMap = {
        commitContributionsByRepository: 'commits',
        issueContributionsByRepository: 'issues',
        pullRequestContributionsByRepository: 'pullRequests',
        pullRequestReviewContributionsByRepository: 'pullRequestReviews'
    };
    const contributions = response.user.contributionsCollection;

    var data = {};

    for (const [k, v] of Object.entries(contributionMap)) {
        if (contributions[k]) {
            data[v] = data[v] || {};

            contributions[k].forEach(o => {
                data[v][o.repository.nameWithOwner.split(' ').join('')] = o.contributions.totalCount;
            });
        }
    }

    output[year] = data;

    fs.writeFileSync(file, JSON.stringify(output));
});
