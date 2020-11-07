import React from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import './App.css';

const textSize="3";
const barSize="9";
const lgBarSize="10";
const lgTextSize="2";

class App extends React.Component {
  constructor(props){
    super(props);
    this.state={
      shortUrl:"",
      originalUrl:""
    }
  }
  
  handleKeyPress(e){
    if(e.charCode===13){
      this.handleSubmit(e);
    }
  }
  handleChange(e){
    const name=e.target.name;
    this.setState({
      [name]:e.target.value //computed property name / partial state replacement syntax
    });
  }

  handleSubmit(e){
    this.setState({shortUrl:"Loading..."});
    const oUrl={oUrl:this.state.originalUrl};
    fetch('http://localhost:4000/api/shortUrl/new',{//localhost should be in variable that updates along with express
      method:'POST',
      headers:{
        'Accept':'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(oUrl)
    }).then((res)=>{
      return res.json();
    }).then((data)=>{
        if('error' in data){
          this.setState({shortUrl:`${data.error}`});
        }else{
          this.setState({shortUrl:`http://localhost:4000/api/shorturl/new/${data.short_url}`});
        }
    }).catch((err)=>{return console.log(err)});

  }
  render(){
    return (
        <div className="App">
          <Container fluid={true}>
            <Row id="pRow" className="justify-content-center align-items-center">
              <Col id="pCol" md="8" sm="8" xs="10" >

                <Row>
                  <Col sm="12" xs="12">
                  <Form.Group > {/**  */}
                  <Form.Row className="justify-content-end align-items-center">
                    <Col md="12" sm="12" xs="12" id="title">
                      <h1>
                        Url-Shortener
                      </h1>
                    </Col>
                  </Form.Row>
                  </Form.Group>
                  </Col>
                </Row>


                <Row id="row2">
                  <Col sm="12">
                  <Form.Group > {/**  */}
                    <Form.Label srOnly>Enter URL to receive a shortened version of it</Form.Label>
                    <Form.Row className="align-items-center">
                    <Col lg={lgTextSize} md={textSize} sm={textSize} xs={textSize}>
                      http://www.
                    </Col>
                    <Col lg={lgBarSize} md={barSize} sm={barSize} xs={barSize}>
                      <Form.Control onChange={this.handleChange.bind(this)} onKeyPress={this.handleKeyPress.bind(this)} placeholder="Enter Url you want to convert. Exclude the http(s)://www" name="originalUrl" />
                    </Col>
                    </Form.Row>
                  </Form.Group>
                  
                  <Form.Group>
                  <Form.Row className="justify-content-end">
                  <Col  lg={lgBarSize} md={barSize} sm={barSize} xs={barSize}>
                    <Button onClick={this.handleSubmit.bind(this)} variant="primary" id="button">Submit</Button>
                    </Col>
                    
                  </Form.Row>
                  </Form.Group>
                
                  <Form.Group id="btmGrp">
                  <Form.Row  className="align-items-center">
                    <Col lg={lgTextSize} md={textSize} sm={textSize} xs={textSize}>
                      New Link:
                    </Col>
                    <Col lg={lgBarSize} md={barSize} sm={barSize} xs={barSize}>
                    <Form.Control type="text"  value={`${this.state.shortUrl}`} readOnly/>
                    </Col>
                  </Form.Row>
                  </Form.Group>

                  </Col>
                </Row>

              </Col>
            </Row>          
          </Container>
        </div>
    );
  }
}

export default App;
