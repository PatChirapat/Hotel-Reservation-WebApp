import react from 'react';
import "../ui/Home.css";

import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import BookingBar from '../components/BookingBar';
import Roomlist from '../components/Roomlist';
import FacilityComp from '../components/FacilityComp';
import Footer from '../components/Footer';

function Home() {
    return (
        <div className="home-container">
            <Navbar />
            <Carousel />
            <BookingBar />
            <Roomlist />
            <FacilityComp />
            <Footer />
        </div>
    );
}

export default Home;