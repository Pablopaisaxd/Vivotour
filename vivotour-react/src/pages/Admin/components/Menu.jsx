import React, { useContext } from "react";
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ColorizeOutlinedIcon from "@mui/icons-material/ColorizeOutlined";
import SettingsIcon from '@mui/icons-material/Settings';
import CommentIcon from '@mui/icons-material/Comment';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import { ListItemButton } from "@mui/material";
import { AdminContext } from '../AdminContext';

export default function Menu({ onNavigate }) {
  const theme = useTheme();
  const [openDashboard, setOpenDashboard] = React.useState(true);
  const { setActiveComponent } = useContext(AdminContext);

  const handleDashboardClick = () => setOpenDashboard(!openDashboard);

  return (
    <div>
      <List>
        <Divider />
        <ListItemButton
          onClick={() => { setActiveComponent('dashboard'); onNavigate && onNavigate(); }}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.secondary.main,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <DashboardOutlinedIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          onClick={() => { setActiveComponent('homePageSettings'); onNavigate && onNavigate(); }}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.secondary.main,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <SettingsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Opciones Página Inicio" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          onClick={() => { setActiveComponent('commentsManagement'); onNavigate && onNavigate(); }}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.secondary.main,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <CommentIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Gestión de Comentarios" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          onClick={() => { setActiveComponent('galleryManagement'); onNavigate && onNavigate(); }}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.secondary.main,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <PhotoLibraryIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Gestión de Galería" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          onClick={() => { setActiveComponent('reservationManagement'); onNavigate && onNavigate(); }}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.secondary.main,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <EventAvailableIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Gestión de Reservas" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          onClick={() => { setActiveComponent('availabilityManagement'); onNavigate && onNavigate(); }}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.secondary.main,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <CalendarTodayIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Modificar Disponibilidad" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          onClick={() => { setActiveComponent('userManagement'); onNavigate && onNavigate(); }}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.secondary.main,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <PeopleIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Gestión de Usuarios" />
        </ListItemButton>

        <Divider />
      </List>
    </div>
  );
}