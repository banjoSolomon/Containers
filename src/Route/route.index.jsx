import Layout from "../Layout";
import Home from "../Componet/Home/Section2/index.module";

export const ROUTES = [
    {
        path: '/',
        element: <Layout/>,
        children : [
    {
        path: '/',
        element: <Home/>
    },

]
    }
]