import React, { useContext } from "react";
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SettingsIcon from '@mui/icons-material/Settings';
import CommentIcon from '@mui/icons-material/Comment';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import LogoutIcon from '@mui/icons-material/Logout';
import { ListItemButton } from "@mui/material";
import { AdminContext } from '../AdminContext';
import { AuthContext } from '../../../AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Menu({ onNavigate }) {
  const theme = useTheme();
  const { activeComponent, setActiveComponent } = useContext(AdminContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardOutlinedIcon },
    { id: 'homePageSettings', label: 'Página de Inicio', icon: SettingsIcon },
    { id: 'commentsManagement', label: 'Comentarios', icon: CommentIcon },
    { id: 'galleryManagement', label: 'Galería', icon: PhotoLibraryIcon },
    { id: 'reservationManagement', label: 'Reservas', icon: EventAvailableIcon },
    { id: 'availabilityManagement', label: 'Disponibilidad', icon: CalendarTodayIcon },
    { id: 'userManagement', label: 'Usuarios', icon: PeopleIcon },
    { id: 'plansManagement', label: 'Planes', icon: LocalActivityIcon },
    { id: 'extraServicesManagement', label: 'Servicios Extra', icon: RoomServiceIcon },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--alice-blue)' }}>
      <List sx={{ flex: 1, padding: '8px' }}>
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = activeComponent === item.id;
          
          return (
            <React.Fragment key={item.id}>
              <ListItemButton
                selected={isActive}
                onClick={() => { 
                  setActiveComponent(item.id); 
                  onNavigate && onNavigate(); 
                }}
                sx={{
                  borderRadius: '8px',
                  margin: '2px 0',
                  transition: 'all 0.3s ease',
                  backgroundColor: isActive ? 'rgba(75, 172, 53, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--forest-green)' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(75, 172, 53, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    color: isActive ? 'var(--forest-green)' : 'var(--rich-black)',
                  },
                }}
              >
                <ListItemIcon>
                  <IconComponent 
                    sx={{ 
                      color: isActive ? 'var(--forest-green)' : 'var(--text-color-secondary)',
                      transition: 'all 0.3s ease',
                    }} 
                  />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
              {index < menuItems.length - 1 && (
                <Divider 
                  variant="middle" 
                  sx={{ 
                    margin: '4px 16px',
                    borderColor: 'rgba(26, 24, 27, 0.08)'
                  }} 
                />
              )}
            </React.Fragment>
          );
        })}
      </List>

      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid var(--border-color-light)',
        background: 'linear-gradient(135deg, var(--alice-blue), rgba(75, 172, 53, 0.05))'
      }}>
        <ListItemButton
          onClick={handleLogout}
          className="btnlog"
          sx={{
            borderRadius: '25px',
            background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
            color: 'white !important',
            fontWeight: 700,
            padding: '8px 16px',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #3d9129, #e6b412)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 15px rgba(75, 172, 53, 0.4)',
            },
            '& .MuiListItemText-primary': {
              color: 'white',
              fontWeight: 700,
              textAlign: 'center',
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </div>
    </div>
  );
}