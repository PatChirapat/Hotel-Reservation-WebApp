import react from 'react';
import "../ui/Home.css";

import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import BookingBar from '../components/BookingBar';

function Home() {
    return (
        <div className="home-container">
            <Navbar />
            <Carousel />
            <BookingBar />
        </div>
    );
}

export default Home;