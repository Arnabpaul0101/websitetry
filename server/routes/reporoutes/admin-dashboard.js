const express = require("express");
const router = express.Router();
const axios = require("axios");
const Repo = require("../../models/Repo");
const User = require("../../models/User");

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

router.get("/", ensureAuth, async (req, res) => {
  console.log("Admin Dashboard route hit");

  try {
    const offset = parseInt(req.query.offset || "0");
    const sort = req.query.sort === "asc" ? "asc" : "desc";

    const baseDate = new Date("2024-05-09T00:00:00.000Z");
    let startTime, endTime;

    if (sort === "desc") {
      // Newest to oldest: move backwards by offset days from now
      endTime = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
      startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    } else {
      // Oldest to newest: move forwards by offset days from baseDate
      startTime = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
      endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
    }

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

    // Build repo filters for the search query, e.g. "repo:owner/name"
    const repoFilters = repos
      .map((r) => {
        const parts = r.url.replace("https://github.com/", "").split("/");
        if (parts.length < 2) return null;
        return `repo:${parts[0]}/${parts[1]}`;
      })
      .filter(Boolean);

    if (repoFilters.length === 0) {
      return res
        .status(200)
        .json({ message: "No repos found", pullRequests: [] });
    }

    // GitHub search query:
    // "type:pr created:<end> created:>=<start> <repo filters> <keyword>"
    // GitHub search API only supports one 'created' filter, so combine as range
    // So we use: created:<end> created:>=<start> (no official range syntax, so we do created:>=start and created:<end)

    // Unfortunately, GitHub search API expects date in YYYY-MM-DD format (ISO string works but time ignored)

    const createdGte = startTime.toISOString().split("T")[0];
    const createdLt = endTime.toISOString().split("T")[0];

    // We'll page through results until we hit end or 1000 results (GitHub Search max)

    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const q = [
        "type:pr",
        `created:>=${createdGte}`,
        `created:<${createdLt}`,
        ...repoFilters,
        "#ieeesoc",
      ].join(" ");

      const response = await axios.get("https://api.github.com/search/issues", {
        headers,
        params: {
          q,
          sort: "created",
          order: sort,
          per_page: perPage,
          page,
        },
      });

      const items = response.data.items;
      if (!items || items.length === 0) break;

      // Map results
      for (const pr of items) {
        allMatchingPRs.push({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          html_url: pr.html_url,
          merged: pr.pull_request
            ? pr.pull_request.merged_at !== undefined
            : false,
          merged_at: null,
          repo: pr.repository_url.replace("https://api.github.com/repos/", ""),
          user: {
            login: pr.user?.login,
            avatar_url: pr.user?.avatar_url,
            html_url: pr.user?.html_url,
          },
        });
      }

      // GitHub Search API caps at 1000 results total
      if (items.length < perPage || page * perPage >= 1000) {
        hasMore = false;
      } else {
        page++;
      }
    }

    res.status(200).json({
      message: "PRs fetched",
      pullRequests: allMatchingPRs,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err.response?.data || err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
