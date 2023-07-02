import React from "react";
import Home from "./Home"
import Customizer from "./Customizer";
import Canvas from "./canvas";
function App() {
return (
    <main className="app transition-all ease-in">
       <Home/>
       <Canvas/>
       <Customizer/>
     </main> 

  )
}

export default App
