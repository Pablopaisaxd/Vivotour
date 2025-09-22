import React, { useState } from 'react';
import CustomSelect from "./reusable/CustomSelect";
import MyChart from "./MyChart";

function DailyVisitors() {

    const [ monthValue, setMonthValue] = useState("Enero");
    const [ yearValue, setYearValue] = useState("2025");

    const data_1 = [
        { id: "Enero", name: "Enero" },
        { id: "Febrero", name: "Febrero" },
        { id: "Marzo", name: "Marzo" },
        { id: "Abril", name: "Abril" },
        { id: "Mayo", name: "Mayo" },
        { id: "Junio", name: "Junio" },
        { id: "Julio", name: "Julio" },
        { id: "Agosto", name: "Agosto" },
        { id: "Septiembre", name: "Septiembre" },
        { id: "Octubre", name: "Octubre" },
        { id: "Noviembre", name: "Noviembre" },
        { id: "Diciembre", name: "Diciembre" }
      ];

      const data_2 = [
        { id: "2025", name: "2025" }
      ];

      const setMonth = (value) => {
        setMonthValue(value);
      }

      const setYear = (value) => {
        setYearValue(value);
      }

    const styles = {
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1em",
            borderBottom: "1px solid var(--border-color-light)",
        },
        title: {
            filter: 'drop-shadow(0 0 0.25rem rgba(0,0,0,0.05))',
            fontSize: '16px',
            fontWeight: '600',
            color: "var(--rich-black)",
        },
        selectContainer: {
            display: "flex",
            justifyContent: "flex-end",
        },
        selectPaddingRight: {
            paddingRight: "0",
        },
        selectPaddingLeft: {
            paddingLeft: "0",
        }
    };

    return (
        <div className="daily-visitors">
            <header style={styles.header}>
                <p style={styles.title}>Visitas Diarias</p>
                <div style={styles.selectContainer}>
                    <CustomSelect style={styles.selectPaddingRight} data={data_1} setMonth={setMonth}/>
                    <CustomSelect style={styles.selectPaddingLeft} data={data_2} setYear={setYear} />
                </div>
            </header>
            <MyChart month={monthValue} year={yearValue}/>
        </div>
    )
}

export default DailyVisitors;