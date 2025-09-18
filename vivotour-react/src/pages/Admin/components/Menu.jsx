import React from "react";
import { useTheme } from '@mui/material/styles'; // Importar useTheme de MUI v5
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Link from '@mui/material/Link'; // Usar Link de MUI para estilos, o Link de react-router-dom para navegación
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ColorizeOutlinedIcon from "@mui/icons-material/ColorizeOutlined";
import ArrowRightAltOutlinedIcon from '@mui/icons-material/ArrowRightAltOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Link as RouterLink } from 'react-router-dom'; // Importar Link de react-router-dom

export default function Menu() {
  const theme = useTheme(); // Usar useTheme para acceder al tema
  const [open, setOpen] = React.useState(true);
  const handleClick = () => setOpen(!open);

  return (
    <div>
      <List>
        <Divider />
        <ListItem
          button
          onClick={handleClick}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            // Estilos para ListItemText dentro de este ListItem
            '& .MuiListItemText-primary': {
              fontWeight: 'bold',
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: 'color 0.2s ease-in-out',
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <ListItemIcon>
            <DashboardOutlinedIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
          {open ? <ExpandMore color="primary" /> : <ExpandLess color="primary" />}
        </ListItem>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button
              sx={{
                pl: 12,
                pb: 0.1,
                fontSize: 16,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main }
              }}
            >
              <ListItemText primary="Page Visitors" />
            </ListItem>
            <ListItem button
              sx={{
                pl: 12,
                pb: 0.1,
                fontSize: 16,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main }
              }}
            >
              <ListItemText primary="Post Performance" />
            </ListItem>
            <ListItem button
              sx={{
                pl: 12,
                pb: 0.1,
                fontSize: 16,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main }
              }}
            >
              <ListItemText primary="Team Overall" />
            </ListItem>
          </List>
        </Collapse>

        <Divider variant="middle" />

        <ListItem button
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            '& .MuiListItemText-primary': {
              fontWeight: 'bold',
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: 'color 0.2s ease-in-out',
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <ListItemIcon>
            <TodayOutlinedIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Calendar" />
        </ListItem>

        <Divider variant="middle" />

        <ListItem button
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            '& .MuiListItemText-primary': {
              fontWeight: 'bold',
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: 'color 0.2s ease-in-out',
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <ListItemIcon>
            <MoveToInboxOutlinedIcon color="primary"/>
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </ListItem>

        <Divider variant="middle" />

        <ListItem button
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            '& .MuiListItemText-primary': {
              fontWeight: 'bold',
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: 'color 0.2s ease-in-out',
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <ListItemIcon>
            <ReceiptOutlinedIcon color="primary"/>
          </ListItemIcon>
          <ListItemText primary="Invoicing" />
        </ListItem>

        <Divider variant="middle" />

        <ListItem button
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            '& .MuiListItemText-primary': {
              fontWeight: 'bold',
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: 'color 0.2s ease-in-out',
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <ListItemIcon>
            <ColorizeOutlinedIcon color="primary"/>
          </ListItemIcon>
          <ListItemText primary="Lab / Experimental" />
        </ListItem>
        <Divider />
      </List>

      <div style={{ filter: 'drop-shadow(0 0 0.55rem #ddddf0)' }}>
        <List
          component="nav"
          subheader={
            <ListSubheader component="div" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold' }}>
              RECENTLY VIEWED
            </ListSubheader>
          }
        >
          <ListItem button
            sx={{
              pl: 4,
              m: 0,
              '& .MuiListItemText-primary': {
                fontSize: 14,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main }
              }
            }}
          >
            <ListItemText primary="Overall Performance" />
            <ListItemSecondaryAction>
              <ArrowRightAltOutlinedIcon color="secondary" />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem button
            sx={{
              pl: 4,
              m: 0,
              '& .MuiListItemText-primary': {
                fontSize: 14,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main }
              }
            }}
          >
            <ListItemText primary="Invoice #940" />
            <ListItemSecondaryAction>
              <ArrowRightAltOutlinedIcon color="secondary" />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem button
            sx={{
              pl: 4,
              m: 0,
              '& .MuiListItemText-primary': {
                fontSize: 14,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main }
              }
            }}
          >
            <ListItemText primary="Customer: Minerva Viewer" />
            <ListItemSecondaryAction>
              <ArrowRightAltOutlinedIcon color="secondary" />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </div>

      <div className="github">
        {/* Usar RouterLink para navegación interna si es necesario, o Link de MUI para enlaces externos */}
        <Link component={RouterLink} to="https://github.com/malhotra-parul/dashboard" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GitHubIcon /> Github Repo
        </Link>
      </div>
    </div>
  );
}