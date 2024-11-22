import {Outlet} from "react-router-dom";
import Navbar from "../Navber/index.module";
import Footer from "../Footer/index.module";


const Layout = () => {
    return(
        <>
            <Navbar/>
            <Outlet/>
            <Footer/>
        </>


    )
}

export default Layout;