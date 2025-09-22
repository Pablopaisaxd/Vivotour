import React from "react";
import HomeTwoToneIcon from "@mui/icons-material/HomeTwoTone";
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Link to="/" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <HomeTwoToneIcon
        sx={{
          fontSize: 40,
          filter: "drop-shadow(0 0 0.25rem rgba(0,0,0,0.1))",
          cursor: "pointer",
          transition: "0.2s",
          color: 'primary.main',
          "&:hover": { color: 'primary.dark', transform: "scale(1.1)" },
        }}
      />
    </Link>
  );
}

export default Home;