import React from "react";
import { Link } from "react-router-dom";
import HomeTwoToneIcon from "@mui/icons-material/HomeTwoTone";

function Home() {
  return (
    <Link
      to="/Presentacion"
      style={{
        textDecoration: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "20px auto",
      }}
    >
      <HomeTwoToneIcon
        sx={{
          fontSize: 40,
          filter: "drop-shadow(0 0 0.25rem #d8d8e2)",
          cursor: "pointer",
          transition: "0.2s",
          "&:hover": { color: "#1976d2", transform: "scale(1.1)" },
        }}
        color="secondary"
      />
    </Link>
  );
}

export default Home;
