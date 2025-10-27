import react from 'react';

import '../ui/Room.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Room() {
    return (
        <div className="room">
            <Navbar />
            <h1>Room page test</h1>
            <Footer />
        </div>
    );
}

export default Room;