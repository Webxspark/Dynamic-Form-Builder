import { createBrowserRouter } from "react-router-dom";
import Login from "./pages";
export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/form",
    element: <>Forms page</>,
  },
]);
