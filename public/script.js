var ghCommits = document.getElementById('gh-commits'),
    ghIssues = document.getElementById('gh-issues'),
    ghPullRequests = document.getElementById('gh-pullrequests'),
    ghReviews = document.getElementById('gh-reviews'),
    ghRepositories = document.getElementById('gh-repositories'),
    soBadges = document.getElementById('so-badges'),
    soVotes = document.getElementById('so-votes'),
    soAnswers = document.getElementById('so-answers'),
    soQuestions = document.getElementById('so-questions'),
    soReputation = document.getElementById('so-reputation');

fetch('contributions.json').then(function (res) {
    return res.json();
}).then(function (data) {
    ghCommits.textContent = data.github.commits;
    ghIssues.textContent = data.github.issues;
    ghPullRequests.textContent = data.github.pullRequests;
    ghReviews.textContent = data.github.pullRequestReviews;
    ghRepositories.textContent = data.github.repositories;
    soBadges.textContent = data.stackoverflow.badges.bronze + data.stackoverflow.badges.silver + data.stackoverflow.badges.gold;
    soVotes.textContent = data.stackoverflow.votes.up + data.stackoverflow.votes.down;
    soAnswers.textContent = data.stackoverflow.answers;
    soQuestions.textContent = data.stackoverflow.questions;
    soReputation.textContent = data.stackoverflow.reputation;
});
