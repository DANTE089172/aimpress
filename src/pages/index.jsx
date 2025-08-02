import Layout from "./Layout.jsx";

import Board from "./Board";

import Archive from "./Archive";

import Profile from "./Profile";

import Boards from "./Boards";

import Landing from "./Landing";

import Pricing from "./Pricing";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Board: Board,
    
    Archive: Archive,
    
    Profile: Profile,
    
    Boards: Boards,
    
    Landing: Landing,
    
    Pricing: Pricing,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Board />} />
                
                
                <Route path="/Board" element={<Board />} />
                
                <Route path="/Archive" element={<Archive />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Boards" element={<Boards />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}