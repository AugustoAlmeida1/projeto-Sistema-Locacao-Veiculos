import { Button } from "./components/Button"

function App() {

  return (
    <>
    <Button  label = "Clicar" variant='danger' onClick={() => alert('Botão clicado!')}/>
    </>
  )
}

export default App
