import React from 'react';
import { useAuth } from '../../context/Authcontext';
import { GitBranch } from 'lucide-react';
import moment from 'moment';

const Commits = () => {
    const { user } = useAuth();

    const pullRequests = user.pullRequests || [];

    return (
        <div className="px-4 py-7 text-white bg-[#1c1f2b]">
            <h1 className="text-2xl font-bold mb-6">Pull Requests</h1>

            <div className="bg-[#21293b] p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Recent PRs</h2>

                {pullRequests.length === 0 ? (
                    <p className="text-gray-400">No PRs available.</p>
                ) : (
                    pullRequests.map((pr, index) => (
                        <div
                            key={index}
                            className="flex items-start justify-between py-4 border-b border-gray-700 last:border-b-0"
                        >
                            <div>
                                <div className='flex gap-2'>
                                    <p className='text-md'>#{pr.number}</p>
                                    <a
                                        href={pr.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-md text-blue-400 hover:underline"
                                    >
                                        {pr.title}
                                    </a>
                                </div>
                                <div className="flex items-center text-sm text-gray-400 mt-1">
                                    <GitBranch className="mr-1" size={16} color='#a993ec' />
                                    {user.displayName || user.username}
                                    <span className="mx-2">•</span>
                                    Created {moment(pr.created_at).fromNow()}
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                <div className='items-center text-gray-400 text-sm'>
                                    Merged {moment(pr.merged_at).fromNow()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Commits;
