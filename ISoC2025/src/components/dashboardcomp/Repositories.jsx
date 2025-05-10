import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/Authcontext';
import axios from 'axios';

const Repositories = () => {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${user._id}/repos`);
        console.log('Fetched repos:', response.data.ongoingprojects);
        const data = response.data.ongoingprojects;

        const enriched = data.map((repo) => ({
          ...repo,
          updated: 'Recently',
          activity: Math.floor(Math.random() * 100),
          language: repo.language?.[0] || 'N/A', // Default to N/A if no language is found
        }));

        setRepos(enriched);
      } catch (error) {
        console.error('Failed to fetch repos:', error);
      }
    };

    if (user) fetchRepos();
  }, [user]);

  return (
    <div className="py-7 px-4 bg-[#1c1f2b] min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">Active Repositories</h2>
      <div className="grid grid-cols-1 gap-6">
        {repos.map((repo) => (
          <div key={repo._id} className="bg-[#252a3b] rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-101 hover:shadow-xl w-full">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
              <p className="text-sm text-gray-400 mt-2">{repo.shortDescription}</p>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-[#1e232d]">
              <span className="text-xs text-gray-400">{repo.language}</span>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm hover:underline"
              >
                View on GitHub
              </a>
            </div>
            <div className="p-4 bg-[#1e232d] rounded-b-lg">
              <div className="text-xs text-gray-400 mb-1">Activity</div>
              <div className="w-full bg-gray-700 h-2 rounded-full">
                <div
                  className="bg-purple-400 h-2 rounded-full"
                  style={{ width: `${repo.activity}%` }}
                ></div>
              </div>
              <div className="text-right text-xs mt-1 text-gray-400">
                {repo.activity}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Repositories;
