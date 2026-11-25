import { Navbar } from "./components/NavBar";
import { AppRouter } from "./routes/app.router";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <AppRouter />
      </main>
    </>
  );
}
