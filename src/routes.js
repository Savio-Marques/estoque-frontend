import React from 'react';
import {Route, Routes} from 'react-router-dom';
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Debtors from './pages/Debtors';
import Categories from './pages/Categories';

export default function AppRoutes(){
    return(
        <Routes>
            <Route path= '/' exact element={<Login/>}/>
            <Route path= '/dashboard' element={<Dashboard/>}>
                <Route index element={<Stock />} /> 
                <Route path= 'stock' element={<Stock/>}/>
                <Route path= 'debtors' element={<Debtors/>}/>
                <Route path= 'categories' element={<Categories/>}/>
            </Route>


        </Routes>
    );
}