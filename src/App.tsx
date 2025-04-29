import "./styles.css";
import {
  Route,
  Routes,
  //  RouterProvider,
} from "react-router-dom";
import Login from "./pages";
import FormPage from "./pages/form";
// import { GlobalContextProvider } from "./contexts/global-context";
// import { AppRouter } from "./router";

export default function App() {
  return (
    // <GlobalContextProvider>
    //   <RouterProvider router={AppRouter} />
    // </GlobalContextProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/form" element={<FormPage />} />
    </Routes>
  );
}
