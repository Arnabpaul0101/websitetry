const express = require("express");
const router = express.Router();
const axios = require("axios");
const Repo = require("../../models/Repo");
const User = require("../../models/User");

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/", ensureAuth, async (req, res) => {
  console.log("Admin Dashboard route hit");

  try {
    const windowOffset = parseInt(req.query.offset || "0");
    const endTime = new Date(Date.now() - windowOffset * 24 * 60 * 60 * 1000);
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    console.log(
      `Fetching PRs between ${startTime.toISOString()} and ${endTime.toISOString()}`
    );

    const repos = await Repo.find({});
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.accessToken) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    const headers = {
      Authorization: `token ${adminUser.accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "IEEE-SOC-App",
    };

    const allMatchingPRs = [];

    for (const repo of repos) {
      let repoUrl = repo.url;
      const parts = repoUrl.replace("https://github.com/", "").split("/");
      if (parts.length < 2) continue;
      const [owner, name] = parts;

      let prPage = 1;
      let stop = false;

      while (!stop) {
        try {
          const response = await axios.get(
            `https://api.github.com/repos/${owner}/${name}/pulls`,
            {
              headers,
              params: {
                state: "all",
                per_page: 100,
                page: prPage,
              },
            }
          );

          const prs = response.data;
          if (prs.length === 0) break;

          for (const pr of prs) {
            const created = new Date(pr.created_at);
            if (created < startTime) {
              stop = true;
              break;
            }

            if (
              created >= startTime &&
              created <= endTime &&
              pr.title.toLowerCase().includes("#ieeesoc")
            ) {
              allMatchingPRs.push({
                id: pr.id,
                number: pr.number,
                title: pr.title,
                state: pr.state,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
                html_url: pr.html_url,
                merged: !!pr.merged_at,
                merged_at: pr.merged_at,
                repo: `${owner}/${name}`,
                user: {
                  login: pr.user?.login,
                  avatar_url: pr.user?.avatar_url,
                  html_url: pr.user?.html_url,
                },
              });
              console.log(`Fetched PR: ${pr.html_url}`);
            }
          }

          prPage++;
          await sleep(300);
        } catch (err) {
          console.warn(`Error fetching PRs for ${owner}/${name}:`, err.message);
          break;
        }
      }
    }

    res.status(200).json({
      message: "PRs fetched",
      pullRequests: allMatchingPRs,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
