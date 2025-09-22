import React, { useContext } from 'react';
import DailyVisitors from "./DailyVisitors";
import RealtimeUsers from "./RealtimeUsers";
import TotalVisits from "./TotalVists";
import BounceRate from "./BounceRate";
import VisitDuration from "./VisitDuration";
import Footer from "./Footer";
import HomePageSettings from './HomePageSettings';
import CommentsManagement from './CommentsManagement';
import GalleryManagement from './GalleryManagement';
import ReservationManagement from './ReservationManagement';
import AvailabilityManagement from './AvailabilityManagement';
import UserManagement from './UserManagement';
import { AdminContext } from '../AdminContext';

function Content() {
    const { activeComponent } = useContext(AdminContext);

    const renderContent = () => {
        switch (activeComponent) {
            case 'dashboard':
                return (
                    <>
                        <DailyVisitors />
                        <RealtimeUsers />
                        <TotalVisits />
                        <BounceRate />
                        <VisitDuration />
                        <Footer />
                    </>
                );
            case 'homePageSettings':
                return <HomePageSettings />;
            case 'commentsManagement':
                return <CommentsManagement />;
            case 'galleryManagement':
                return <GalleryManagement />;
            case 'reservationManagement':
                return <ReservationManagement />;
            case 'availabilityManagement':
                return <AvailabilityManagement />;
            case 'userManagement':
                return <UserManagement />;
            default:
                return (
                    <>
                        <DailyVisitors />
                        <RealtimeUsers />
                        <TotalVisits />
                        <BounceRate />
                        <VisitDuration />
                        <Footer />
                    </>
                );
        }
    };

    return (
        <div className="content">
            {renderContent()}
        </div>
    );
}

export default Content;