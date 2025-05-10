const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Repo = require("../../models/Repo");

router.post("/:userId/contribute", async (req, res) => {
  console.log("Contribute route hit");
  const { userId } = req.params;
  const { repoId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.ongoingprojects.includes(repoId)) {
      return res
        .status(400)
        .json({ message: "Repo already in ongoing projects" });
    }

    if (user.ongoingprojects.length >= 5) {
      return res
        .status(400)
        .json({ message: "You can only contribute to 5 projects at a time." });
    }

    user.ongoingprojects.push(repoId);
    await user.save();

    res.status(200).json({ message: "Repo added to ongoing projects" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:userId/repos', async (req, res) => {
  const { userId } = req.params;
  console.log('GET /:userId/repos hit');

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const user = await User.findById(userId).populate('ongoingprojects');

    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log('User ongoing projects:', user.ongoingprojects);
   res.json({ ongoingprojects: user.ongoingprojects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
