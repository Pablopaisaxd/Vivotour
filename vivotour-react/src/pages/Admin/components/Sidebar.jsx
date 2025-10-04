import React, { useContext } from 'react'
import ProfileCard from "./ProfileCard"
import Menu from "./Menu"
import { AdminContext } from '../AdminContext';

function Sidebar() {
    const { sidebarOpen, closeSidebar } = useContext(AdminContext);
    return (
        <>
            {sidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} aria-hidden="true" />}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <ProfileCard />
                <Menu onNavigate={closeSidebar} />
            </div>
        </>
    )
}

export default Sidebar;