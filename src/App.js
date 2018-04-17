import React, { Component } from 'react';
import './App.css';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Container, Row, Col } from 'reactstrap';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import * as wfuncs from 'window-function';
import * as ft     from 'fourier-transform';
import * as db     from 'decibels';


// Use the in-place mapper to populate the data.

class App extends Component {
  constructor(props) {    
    super(props);

    let samples_number = 1024;
    let xs = [...Array(samples_number).keys()];
    let signal = xs.map(x => Math.sin(x * Math.PI / 180) + (1/6) *Math.sin(6 * x * Math.PI / 180))
    var f_transform = ft(signal);
    var decibels = f_transform.map((value) => db.fromGain(value))
    xs = xs.map(x => (x % 20 == 0 ? x : ''))

    let signal_data = xs.map((x,i) => {return {name: x, sinal: signal[i]}});
    let ft_data = f_transform.map((x,i) => {return {name: x, fourier: decibels[i]}});
    
    this.state = {
      signal_data: signal_data,
      ft_data: ft_data
    }
  }

  
  render() {
    let signal_data = this.state.signal_data
    let ft_data = this.state.ft_data
    return (
      <div className="App">
        <Container>
          <Row>
            <Col md="8">
              <LineChart width={650} height={300} data={signal_data}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="1 1"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="sinal" stroke="steelblue" dot={false} />
              </LineChart>

              <LineChart width={650} height={300} data={ft_data}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="1 1"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="fourier" stroke="steelblue" dot={false} />
              </LineChart>
            </Col>
            <Col md="4">
              <Form>
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
                <FormGroup>
                  <Label for="exampleFile">File</Label>
                  <Input type="file" name="file" id="exampleFile" />
                  <FormText color="muted">
                    This is some placeholder block-level help text for the above input.
                    It's a bit lighter and easily wraps to a new line.
                  </FormText>
                </FormGroup>
                <Button>Submit</Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
