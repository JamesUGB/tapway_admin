// src/components/layout/PageLayout.jsx
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

export default function PageLayout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <main className="container-fluid p-4">
          {children}
        </main>
      </div>
    </div>
  );
}