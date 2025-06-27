import './App.css'
import {Route, Routes} from "react-router-dom";
import Layout from "../features/layout/layout.tsx";
import Batyr from "../components/batyr/batyr.tsx";
import GenerateComics from "../components/generateComics/generateComics.tsx";
import Photo from "../components/photo/photo.tsx";

function App() {

    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<Batyr/>}/>
                <Route path="generateComics" element={<GenerateComics/>}/>
                <Route path='generatePhoto' element={<Photo/>}/>
            </Route>
        </Routes>
    )
}

export default App
