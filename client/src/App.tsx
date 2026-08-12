import { Route, Routes } from "react-router";
import { PrivateRoute } from "./routes/PrivateRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { NotesApp } from "./pages/NotesApp";
import { Toaster } from "@/components";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
