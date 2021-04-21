import './App.css';
import React, { Component } from 'react'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'

import AuthPage from './pages/Auth'
import BookingPage from './pages/Booking'
import EventsPage from './pages/Events'
import MainNavigation from './components/Navigation/MainNavigation'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <MainNavigation />
        <main className='main-content'>
          <Switch>
            <Redirect from='/' to='/auth' exact />
            <Route path='/auth' component={AuthPage} />
            <Route path='/events' component={EventsPage} />
            <Route path='/bookings' component={BookingPage} />
          </Switch>
        </main>
      </BrowserRouter>
    );
  }
}

export default App;
