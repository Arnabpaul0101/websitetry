const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../../models/User");

// Auth middleware (ensure user is logged in)
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

router.get("/:userId/dashboard", ensureAuth, async (req, res) => {
    console.log("Dashboard route hit");
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user || !user.accessToken)
      return res.status(404).json({ message: "User not found" });

    const { username, accessToken } = user;
    const headers = {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "IEEE-SOC-App",
    };

    const repoOwner = "ieee-cs-bmsit";
    const repoName = "ISoC2025";

    // === 1. Pull Requests ===
    const q = `repo:${repoOwner}/${repoName} type:pr author:${username}`;
    let page = 1,
      allPRs = [];

    while (true) {
      const resPR = await axios.get("https://api.github.com/search/issues", {
        headers,
        params: { q, per_page: 100, page },
      });
      if (resPR.data.items.length === 0) break;
      allPRs.push(...resPR.data.items);
      page++;
    }

    let mergedDurations = [],
      detailedPRs = [];

    for (const pr of allPRs) {
      const prDetails = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pr.number}`,
        { headers }
      );

      const prData = prDetails.data;
      if (prData.merged_at) {
        const created = new Date(prData.created_at);
        const merged = new Date(prData.merged_at);
        mergedDurations.push((merged - created) / (1000 * 60 * 60 * 24));
      }

      detailedPRs.push({
        id: prData.id,
        number: prData.number,
        title: prData.title,
        state: prData.state,
        created_at: prData.created_at,
        updated_at: prData.updated_at,
        html_url: prData.html_url,
        status: prData.merged_at ? "merged" : prData.state,
        merged: !!prData.merged_at,
        merged_at: prData.merged_at,
        repo: `${repoOwner}/${repoName}`,
      });
    }

    const pullRequestData = {
      total: detailedPRs.length,
      open: detailedPRs.filter((pr) => pr.state === "open").length,
      closed: detailedPRs.filter(
        (pr) => pr.state === "closed" || pr.status === "merged"
      ).length,
      avgMergeTime: mergedDurations.length
        ? mergedDurations.reduce((a, b) => a + b, 0) / mergedDurations.length
        : 0,
    };

    // === 2. Commit Stats ===
    const commitsRes = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/commits?author=${username}&per_page=100`,
      { headers }
    );

    const commitDetails = [];

    for (const c of commitsRes.data) {
      const fullCommit = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${c.sha}`,
        { headers }
      );

      const stats = fullCommit.data.stats;
      commitDetails.push({
        date: c.commit.author.date,
        message: c.commit.message,
        additions: stats.additions,
        deletions: stats.deletions,
        sha: c.sha,
        url: c.html_url,
      });
    }

    const commitStats = {
      repo: repoName,
      totalCommits: commitDetails.length,
      commits: commitDetails,
    };

    // === 3. Quality Metrics ===
    const reposRes = await axios.get(
      `https://api.github.com/orgs/${repoOwner}/repos`,
      { headers }
    );
    const repos = reposRes.data;

    const repoCount = repos.length;
    const activeProjects = repos.filter(
      (r) =>
        new Date(r.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const popularity = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

    let communityEngagement = 0;
    const resolutionBuckets = { Critical: [], High: [], Medium: [], Low: [] };

    for (const repo of repos) {
      const issuesRes = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repo.name}/issues`,
        { headers, params: { state: "closed", per_page: 100 } }
      );
      for (const issue of issuesRes.data) {
        if (issue.pull_request) continue;
        communityEngagement++;
        const labels = issue.labels.map((l) => l.name);
        const created = new Date(issue.created_at);
        const closed = new Date(issue.closed_at);
        for (const label of labels) {
          const key = ["Critical", "High", "Medium", "Low"].find(
            (lvl) => lvl.toLowerCase() === label.toLowerCase()
          );
          if (key)
            resolutionBuckets[key].push(
              (closed - created) / (1000 * 60 * 60 * 24)
            );
        }
      }
    }

    const resolutionTime = {};
    for (const level in resolutionBuckets) {
      const arr = resolutionBuckets[level];
      resolutionTime[level] = arr.length
        ? arr.reduce((a, b) => a + b, 0) / arr.length
        : 0;
    }

    const qualityData = {
      repoCount,
      popularity,
      activeProjects,
      communityEngagement,
      resolutionTime,
    };

    console.log("data:", {
      detailedPRs,
      pullRequestData,
      commitStats,
      qualityData,
    });

    // Save to user (optional)
    await User.findByIdAndUpdate(userId, {
  pullRequests: detailedPRs,
  pullRequestData,
  commitStats,
  qualityData
});

    res.status(200).json({
      message: "Dashboard data loaded",
      pullRequestData,
      commitStats,
      qualityData,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
