import { RouterProvider } from "react-router-dom";
import { routes } from "./router/routes";
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <div className="bg-primary/2">
            <RouterProvider router={routes} />
            <ToastContainer autoClose={2000} />
        </div>
    );
}

export default App;
