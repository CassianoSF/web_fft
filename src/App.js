import React, { Component } from 'react';
import './App.css';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Container, Row, Col } from 'reactstrap';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import * as wfuncs from 'window-function';
import * as ft     from 'fourier-transform';
import * as db     from 'decibels';

class App extends Component {
  constructor(props) {    
    super(props);

    let samples_number = 1024;
    let xs = [...Array(samples_number).keys()];
    let signal = xs.map(x => Math.sin(10*x * Math.PI / 180))
    var f_transform = ft(signal);
    var decibels = f_transform.map((value) => db.fromGain(value))
    xs = xs.map(x => (x % 20 == 0 ? x : ''))

    let signal_data = xs.map((x,i) => {return {name: x, signal: signal[i]}});
    let fourier_data = f_transform.map((x,i) => {return {name: x, fourier: decibels[i]}});
    
    this.state = {
      signal_data: signal_data,
      fourier_data: fourier_data,
      ft: ft,
      db: db,
    }
    this.uploadFile = this.uploadFile.bind(this)
    this.plotFourier = this.plotFourier.bind(this)
  }

  plotSignal(signal){
      let xs = [...Array(signal.length).keys()].map(x => (x % 20 == 0 ? x : ''))
      let signal_data = xs.map((x,i) => {return {name: x, signal: signal[i]}});
      this.setState({
        signal_data: signal_data,
      })
  }
    
  plotFourier(signal){
    let nearest_pow2 = Math.pow( 2, parseInt(Math.log( signal.length ) / Math.log( 2 )) ); 
    let f_transform = this.state.ft(signal.slice(0, nearest_pow2));
    let decibels = f_transform.map((value) => this.state.db.fromGain(value))
    let fourier_data = f_transform.map((x,i) => {return {name: x, fourier: decibels[i]}});
    this.setState({
      fourier_data: fourier_data,
    })
  }

  uploadFile(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = function(the_file) {
      let signal = the_file.target.result.split(" ").map(i => parseFloat(i))
      this.plotSignal(signal)
    }.bind(this)
    reader.readAsText(file);
  }
  
  render() {
    return (
      <div className="App">
        <Container>
          <Row>
            <Col md="8">
              <LineChart width={650} height={300} data={this.state.signal_data}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="1 1"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="signal" stroke="steelblue" dot={false} />
              </LineChart>

              <LineChart width={650} height={300} data={this.state.fourier_data}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="1 1"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="fourier" stroke="steelblue" dot={false} />
              </LineChart>
            </Col>
            <Col md="4">
              <div className="form">
                <FormGroup>
                  <Label for="exampleFile">File</Label>
                  <Input type="file" name="file" id="exampleFile" onChange={this.uploadFile}/>
                </FormGroup>
                <FormGroup>
                  <Label for="window">Select</Label>
                  <Input type="select" name="select" id="exampleSelect">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </Input>
                </FormGroup>
                <Button onClick={() => this.plotFourier(this.state.signal_data.map(i => i.signal))}>Submit</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
