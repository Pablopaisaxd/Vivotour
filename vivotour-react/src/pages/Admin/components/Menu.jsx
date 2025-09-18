import React from "react";
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
import { ListItemButton } from "@mui/material";

export default function Menu() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const handleClick = () => setOpen(!open);

  return (
    <div>
      <List>
        <Divider />
        <ListItemButton
          onClick={handleClick}
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.primary.light,
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
          {open ? <ExpandMore color="primary" /> : <ExpandLess color="primary" />}
        </ListItemButton>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{
                pl: 12,
                pb: 0.1,
                fontSize: 16,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main },
              }}
            >
              <ListItemText primary="Page Visitors" />
            </ListItemButton>
            <ListItemButton
              sx={{
                pl: 12,
                pb: 0.1,
                fontSize: 16,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main },
              }}
            >
              <ListItemText primary="Post Performance" />
            </ListItemButton>
            <ListItemButton
              sx={{
                pl: 12,
                pb: 0.1,
                fontSize: 16,
                color: theme.palette.secondary.main,
                "&:hover": { color: theme.palette.primary.main },
              }}
            >
              <ListItemText primary="Team Overall" />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider variant="middle" />

        <ListItemButton
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <TodayOutlinedIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Calendar" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <MoveToInboxOutlinedIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <ReceiptOutlinedIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Invoicing" />
        </ListItemButton>

        <Divider variant="middle" />

        <ListItemButton
          sx={{
            pl: 4,
            "&:hover": { color: theme.palette.primary.main },
            "& .MuiListItemText-primary": {
              fontWeight: "bold",
              fontSize: 16,
              color: theme.palette.primary.light,
              "&:hover": {
                animation: "color 0.2s ease-in-out",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <ColorizeOutlinedIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Lab / Experimental" />
        </ListItemButton>
        <Divider />
      </List>
    </div>
  );
}
