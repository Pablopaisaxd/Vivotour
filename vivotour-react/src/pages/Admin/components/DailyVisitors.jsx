import React, { useState } from 'react';
import CustomSelect from "./reusable/CustomSelect";
import MyChart from "./MyChart";

function DailyVisitors() {

    const [ monthValue, setMonthValue] = useState("Enero");
    const [ yearValue, setYearValue] = useState("2025");

    const data_1 = [
        {
          id: "Enero",
          name: "Enero"
        },
        {
          id: "Febrero",
          name: "Febrero"
        },
        {
          id: "Marzo",
          name: "Marzo"
        },
        {
          id: "Abril",
          name: "Abril"
        },
        {
          id: "Mayo",
          name: "Mayo"
        },
        {
          id: "Junio",
          name: "Junio"
        },
        {
          id: "Julio",
          name: "Julio"
        },
        {
          id: "Agosto",
          name: "Agosto"
        },
        {
          id: "Septiembre",
          name: "Septiembre"
        },
        {
          id: "Octubre",
          name: "Octubre"
        },
        {
          id: "Noviembre",
          name: "Noviembre"
        },
        {
          id: "Diciembre",
          name: "Diciembre"
        }
      ];

      const data_2 = [
        {
          id: "2025",
          name: "2025"
        }
      ];

      const setMonth = (value) => {
        setMonthValue(value);
      }

      const setYear = (value) => {
        setYearValue(value);
      }

    return (
        <div className="daily-visitors">
            <header style={{display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1em",
            borderBottom: "1px solid #ddddf0"}}>
                <p style={{filter: 'drop-shadow(0 0 0.25rem #eeeae9)', fontSize: '16px',
  fontWeight: '600', color: "#535457"}}>Visitantes diarios</p>
                <div style={{display: "flex", justifyContent: "flex-end"}}>

                    <CustomSelect style={{paddingRight: "0"}} data={data_1} setMonth={setMonth}/>
                    <CustomSelect style={{paddingLeft: "0"}} data={data_2} setYear={setYear} />
                </div>
            </header>


            <MyChart month={monthValue} year={yearValue}/>


        </div>
    )
}

export default DailyVisitors