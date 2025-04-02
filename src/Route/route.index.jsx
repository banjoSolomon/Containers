import Layout from "../Layout";
import Home from "../Componet/Home";
import Status from "../Componet/Home/Pages/status.module";
import Enum from "../Componet/Home/Pages/enum.module";
import Karrabo from "../Componet/Home/Pages/karrabo.module";



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

            {
                path: '/metrics',
                element: <Enum />,
            },
            {
                path: '/enum',
                element: <Karrabo />,
            }

        ],
    },
];