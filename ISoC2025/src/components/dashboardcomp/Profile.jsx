import React from 'react'
import ProfileComp from '../ProfileComp'

const Profile = () => {
    return (
        <div className="w-full min-h-screen bg-[#1a1f2c] text-white py-7 px-4 shadow-lg space-y-5">
            <h1 className='text-2xl font-bold'>Profile</h1>
            <ProfileComp />
        </div>
    )
}

export default Profile;
