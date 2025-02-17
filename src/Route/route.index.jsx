import Layout from "../Layout";
import Home from "../Componet/Home";
import Status from "../Componet/Home/Pages/status.module";
; // Import the Status component

export const ROUTES = [
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/status',
                element: <Status />,
            },

        ],
    },
];