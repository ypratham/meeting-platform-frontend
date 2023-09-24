import { Routes } from "react-router-dom";
import "./App.css";
import { SocketProvider } from "./context/SocketProvider";
import { Route } from "react-router-dom";
import { Meet } from "./pages/Meet";

function App() {
  return (
    <>
      <SocketProvider>
        <Routes>
          <Route path="/meet" element={<Meet />} />
        </Routes>
      </SocketProvider>
    </>
  );
}

export default App;
