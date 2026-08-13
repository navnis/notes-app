import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { PrivateRoute } from "./routes/PrivateRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { NotesApp } from "./pages/NotesApp";
import { Toaster } from "@/components";
import { useAuth } from "@/hooks/useAuth";

function App() {
  const { restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<NotesApp />} />
          <Route path="/notes/:id" element={<NotesApp />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
