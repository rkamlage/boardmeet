import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './context/StoreContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Groups from './pages/Groups';
import NewGroup from './pages/NewGroup';
import GroupDetail from './pages/GroupDetail';
import JoinGroup from './pages/JoinGroup';
import Events from './pages/Events';
import NewEvent from './pages/NewEvent';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Games from './pages/Games';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  const { currentUser, authLoading } = useStore();

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/new" element={<NewGroup />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:id/join" element={<JoinGroup />} />
          <Route path="/groups/:id/events/new" element={<NewEvent />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="games" element={<Games />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
