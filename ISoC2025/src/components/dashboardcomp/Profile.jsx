import React from 'react'
import ProfileComp from '../ProfileComp'
import { useAuth } from '../../context/Authcontext';

const Profile = () => {
    const { user } = useAuth();
    return (
        <div className="bg-repeat" style={{
      backgroundImage: "url('/images/repopagebg2.png')",
      backgroundRepeat: "repeat",
      backgroundSize: "200%",
    }}>
      <style>
        {`
          @media (min-width: 768px) {
            div.bg-repeat {
              background-size: 100% !important;
            }
          }
        `}
      </style>
        <div className="space-grotesk-regular w-full min-h-screen bg-transparent text-[#000] pt-10 py-7 px-8 shadow-lg space-y-5">
            <h1 className='text-2xl md:text-5xl font-bold mb-8 text-center' style={{fontFamily: "CameraObscuraDEMO, sans-serif",
          letterSpacing: 2,textShadow: `
            -2px -2px 0 #fff,
            2px -2px 0 #fff,
            -2px 2px 0 #fff,
            2px 2px 0 #fff,
            0px 2px 0 #fff,
            2px 0px 0 #fff,
            0px -2px 0 #fff,
            -2px 0px 0 #fff
          `,}}><span className='text-[#ee540e] block md:inline'>Welcome,</span> {user.displayName}</h1>
            <ProfileComp />
        </div>
        </div>
    )
}

export default Profile;
