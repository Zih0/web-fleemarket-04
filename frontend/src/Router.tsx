import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from './routers/Chat';
import Home from './routers/Home';
import Like from './routers/Like';
import Login from './routers/Login';
import My from './routers/My';
import Sold from './routers/Sold';
import Location from './routers/Location';
import LocationSearch from './routers/LocationSearch';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/like" element={<Like />} />
        <Route path="/sold" element={<Sold />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/my" element={<My />} />

        <Route path="/location" element={<Location />} />
        <Route path="/location/search" element={<LocationSearch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
