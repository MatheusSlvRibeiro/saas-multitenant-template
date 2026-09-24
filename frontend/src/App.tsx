import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HealthPage } from '@/routes/HealthPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HealthPage />} />
      </Routes>
    </BrowserRouter>
  );
}
