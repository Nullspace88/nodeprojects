import Vacations from './Vacation'
import React from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
} from 'react-router-dom'
import logo from './img/logo.jpg';
import './App.css';

function Home() {
    return (
	<div>
	    <h2>Welcome to Meadowlark Travel</h2>
	    <p>Check out our "<Link to="/about">About</Link>" page!</p>
		<p>While you're here you can also check out our "<Link to="/vacations">Vacations</Link>" page!</p>
	</div>
    )
}

function About() {
    return(<i>coming soon</i>)
}

function NotFound() {
    return(<i>Not Found</i>)
}

function App() {
    return (
	<Router>
	    <div className="container">
		<header>
		    <h1>Meadowlark Travel</h1>
		    <Link to="/"><img src={logo} className="App-logo" alt="logo" /></Link>
		</header>
		
		<Routes>
		    <Route exact path="/" element={<Home />} />
		    <Route exact path="/about" element={<About />} />
		    <Route exact path="/vacations" element={<Vacations />} />
		    <Route element={<NotFound />} />
		</Routes>
	    </div>
	</Router>
  );
}

export default App;
