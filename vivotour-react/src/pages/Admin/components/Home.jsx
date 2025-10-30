import React from "react";
import HomeTwoToneIcon from "@mui/icons-material/HomeTwoTone";
import { Link } from 'react-router-dom';

const homeStyles = {
  textDecoration: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  padding: '8px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.1)',
};

function Home() {
  return (
    <Link to="/" style={homeStyles}>
      <HomeTwoToneIcon
        sx={{
          fontSize: 40,
          filter: "drop-shadow(0 0 0.25rem rgba(0,0,0,0.1))",
          cursor: "pointer",
          transition: "all 0.3s ease",
          color: 'primary.main',
          "&:hover": { 
            color: 'primary.dark', 
            transform: "scale(1.15) rotate(5deg)",
            filter: "drop-shadow(0 0 0.5rem rgba(75, 172, 53, 0.3))"
          },
        }}
      />
    </Link>
  );
}

export default Home;