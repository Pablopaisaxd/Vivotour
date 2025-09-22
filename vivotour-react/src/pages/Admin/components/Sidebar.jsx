import React, { useContext } from 'react'
import ProfileCard from "./ProfileCard"
import Menu from "./Menu"
import { AdminContext } from '../AdminContext';

function Sidebar() {
    const { activeComponent } = useContext(AdminContext);
    return (
        <div className="sidebar">
            <ProfileCard />
            <Menu />
        </div>
    )
}

export default Sidebar;