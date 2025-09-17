import React from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from "./components/Sidebar";
import Content from "./components/Content";
import {Theme} from "./Theme";
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

function Admin() {
  return (
    <MuiThemeProvider theme={Theme}>
    <div className="App">
     <Header />
     <Sidebar />
     <Content />
    </div>
    </MuiThemeProvider>
  );
}

export default Admin;
