import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Grammar from './pages/Grammar';
import Vocab from './pages/Vocab';
import Quiz from './pages/Quiz';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/vocab" element={<Vocab />} />
        <Route path="/quiz" element={<Quiz />} />
      </Route>
    </Routes>
  );
}
