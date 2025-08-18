import React from 'react';
import {Route, Routes} from 'react-router-dom';
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Debtors from './pages/Debtors';


export default function AppRoutes(){
    return(
        <Routes>
            <Route path= '/' exact element={<Login/>}/>
            <Route path= '/dashboard' element={<Dashboard/>}>
                <Route index element={<Stock />} /> 
                <Route path= 'stock' element={<Stock/>}/>
                <Route path= 'debtors' element={<Debtors/>}/>
            </Route>


        </Routes>
    );
}