import React from "react";
import HomeTwoToneIcon from "@mui/icons-material/HomeTwoTone"; // Importación de MUI v5

function Home() {
  return (
    <>
      <HomeTwoToneIcon
        sx={{ margin: "auto", filter: "drop-shadow(0 0 0.25rem #d8d8e2)" }} // Usar sx prop para estilos de MUI v5
        color="secondary"
      />
    </>
  );
}

export default Home;