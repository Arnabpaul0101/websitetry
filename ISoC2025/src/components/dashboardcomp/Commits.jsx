import React, { useEffect } from 'react';
import { useAuth } from '../../context/Authcontext';
import { GitBranch } from 'lucide-react';
import moment from 'moment';
import Loading from './Loading';
import { useDashboard } from '../../context/Dashboardcontext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Commits = () => {
  const { user } = useAuth();
  const { dashboardData, setDashboardData } = useDashboard();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/dashboard/${user._id}/dashboard`, {
          withCredentials: true,
        });
        console.log('Dashboard data:', res.data);
        setDashboardData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
        toast.error('Failed to load dashboard');
      }
    };

    if (user && !dashboardData) {
      fetchDashboardData();
    }
  }, [user, dashboardData, setDashboardData]);

  if (!dashboardData) return <Loading />;

  const pullRequests = user.pullRequests || [];

  return (
    <div
      className="min-h-screen w-full bg-fixed bg-cover bg-center px-4 py-10 md:px-20"
      style={{
        backgroundImage: "url('/images/repopagebg2.png')",
      }}
    >
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md p-4 md:p-6 border rounded-md shadow-md">
        <h2 className="text-xl md:text-3xl font-semibold mb-4 text-center text-gray-800">Recent PRs</h2>

        {pullRequests.length === 0 ? (
          <p className="text-gray-500 text-center">No PRs available.</p>
        ) : (
          pullRequests.map((pr, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-start justify-between py-4 border-b border-gray-300 last:border-b-0 gap-2 md:gap-0"
            >
              <div>
                <div className="flex flex-wrap gap-2 items-center">
                  <p className="text-gray-700 md:text-lg text-sm">#{pr.number}</p>
                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold md:text-lg text-sm text-blue-600 hover:underline"
                  >
                    {pr.title}
                  </a>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <GitBranch className="mr-1 text-purple-600" size={16} />
                  {user.displayName || user.username}
                  <span className="mx-2">•</span>
                  Created {moment(pr.created_at).fromNow()}
                </div>
              </div>
              <div className="text-right text-xs md:text-sm text-gray-500">
                Merged {moment(pr.merged_at).fromNow()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Commits;
