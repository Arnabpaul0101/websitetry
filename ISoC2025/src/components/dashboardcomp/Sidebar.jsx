import React, { useEffect, useState } from 'react';
import {
    Columns2,
    UserRound,
    ChartNoAxesCombined,
    Calendar,
    GitPullRequest,
    FolderGit
} from 'lucide-react';

const Sidebar = ({ activeItem, setActiveItem, open, setOpen }) => {
    const [isMobile, setIsMobile] = useState(false);

    const menuItems = [
        {
            id: 'overview', label: 'Overview', icon: (
                <svg className="scale-90" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
            )
        },
        
        { id: 'repositories', label: 'Repositories', icon: <FolderGit className="scale-90" /> },
        { id: 'activity', label: 'Activity', icon: <Calendar className="scale-90" /> },
        { id: 'performance', label: 'Performance', icon: <ChartNoAxesCombined className="scale-90" /> },
        { id: 'commits', label: 'PRs', icon: <GitPullRequest className="scale-90" /> },
        { id: 'profile', label: 'Profile', icon: <UserRound className="scale-90" /> },
        
    ];

    // Detect screen width and set the sidebar to close on mobile screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 980) {
                setIsMobile(true); // Set to mobile view
                setOpen(false); // Close sidebar on mobile
            } else {
                setIsMobile(false); // Set to desktop view
                setOpen(true); // Open sidebar on desktop
            }
        };

        handleResize(); // Call on initial render
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [setOpen]);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col h-full py-7 bg-[#141a29] fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${open ? 'w-[17%]' : 'w-17'}`}>
                <header className={`flex ${open ? 'justify-between px-4' : 'justify-center'} items-center`}>
                    {open && <h1 className="text-xl font-semibold text-[#dae6f2]">IEEE Summer of Code</h1>}
                    {!isMobile && (
                        <button
                            className="cursor-pointer"
                            type="button"
                            onClick={() => setOpen(!open)}
                        >
                            <Columns2 className="text-[#dae6f2]" />
                        </button>
                    )}
                </header>

                <section className={`${!open && 'py-1'} mt-10 text-sm font-semibold text-[#ffffff] px-3`}>
                    <ul className="flex flex-col space-y-2">
                        {menuItems.map((item) => (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveItem(item.id);
                                }}
                                className={`w-full ${activeItem !== item.id && 'hover:bg-[#a993ec]'} hover:rounded-sm active:bg-[#21293b] active:rounded-sm px-3 py-0.5 ${activeItem === item.id ? 'bg-[#21293b] rounded-sm' : ''}`}
                            >
                                <li className="flex items-center gap-4 py-2 justify-start">
                                    {item.icon}
                                    {open && item.label}
                                </li>
                            </a>
                        ))}
                    </ul>
                </section>
            </aside>

            {/* Mobile Bottom Taskbar (Icons Only) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3 bg-[#141a29] text-white md:hidden">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveItem(item.id)}
                        className={`p-1 ${activeItem === item.id ? 'text-[#a993ec]' : 'text-white'}`}
                    >
                        {item.icon}
                    </button>
                ))}
            </nav>
        </>
    );
};

export default Sidebar;
