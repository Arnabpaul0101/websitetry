import React from 'react'
import { useAuth } from '../context/Authcontext'

const ProfileComp = () => {
    const { user } = useAuth();

    return (
        <div className='p-4 sm:p-6 md:p-10 bg-[#21293b] rounded-lg'>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shrink-0">
                    <div className='w-full aspect-square bg-white rounded-full flex items-center justify-center overflow-hidden'>
                        <img src={user.avatar} alt="avatar" className="object-cover w-full h-full" />
                    </div>
                </div>
                <div className="text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <span className="bg-purple-700 text-sm px-3 py-1 rounded-full text-white inline-block w-fit mx-auto sm:mx-0">
                            Developer
                        </span>
                    </div>
                    <p className="text-gray-400 mt-1">GitHub User</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm text-gray-300">
                <div>
                    <p className="text-gray-400">Username:</p>
                    <p className="text-white font-medium">{user.username}</p>
                </div>
                <div>
                    <p className="text-gray-400">Joined:</p>
                    <p className="text-white font-medium">{user.joinedAt.slice(0, 10)}</p>
                </div>
                <div>
                    <p className="text-gray-400">Repositories:</p>
                    <p className="text-white font-medium">{user.qualityData.repoCount}</p>
                </div>
                <div>
                    <p className="text-gray-400">Followers:</p>
                    <p className="text-white font-medium">{user.followers}</p>
                </div>
                <div>
                    <p className="text-gray-400">Following:</p>
                    <p className="text-white font-medium">{user.following}</p>
                </div>
            </div>
        </div>
    )
}

export default ProfileComp;
