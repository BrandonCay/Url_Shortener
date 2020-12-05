import React from 'react';
import Input from './components/Input';
import RedirectComp from './components/RedirectComp';
import {BrowserRouter,  Switch, Route} from 'react-router-dom';
import Button from 'react-bootstrap/esm/Button';
const App = () =>{
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Input}/>
        <Route path="/:short_url" exact component={RedirectComp}/>
        <Route path='/shorturl/notfound' exact>
          <div>
              Not Found <br/>
              <Button href="/" >Return Home</Button>
          </div>
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App;
