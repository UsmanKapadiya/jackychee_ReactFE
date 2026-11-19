import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import PortfolioDetail from './pages/PortfolioDetail.jsx';
import ContentPage from './pages/ContentPage.jsx';
import NotFound from './pages/NotFound.jsx';

// Public website only. The admin panel is a separate app in the /admin folder
// (deployed on its own domain, e.g. admin.jackychee.com).
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="portfolio-type/:category" element={<Home />} />
        <Route path="portfolio/:slug" element={<PortfolioDetail />} />
        <Route path=":slug" element={<ContentPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
