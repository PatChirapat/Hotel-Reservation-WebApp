import react from 'react';
import "../ui/Home.css";

import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';

function Home() {
    return (
        <div className="home-container">
            <Navbar />
            <Carousel />
        </div>
    );
}

export default Home;