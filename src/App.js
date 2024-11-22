
import './App.css';
import {useRoutes} from "react-router-dom";
import {ROUTES} from "./Route/route.index";


function App() {

  return (
      useRoutes(ROUTES)

  );


}

export default App;
