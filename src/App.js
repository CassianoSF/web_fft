import React, { Component } from 'react';
import './App.css';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Container, Row, Col } from 'reactstrap';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import * as wfuncs from 'window-function';
import * as fft    from 'fourier-transform';
import * as db     from 'decibels';


class App extends Component {
  constructor(props) {    
    super(props);

    this.uploadFile         = this.uploadFile.bind(this)
    this.handleSelectWindow = this.handleSelectWindow.bind(this)
    this.handleChangeFilter = this.handleChangeFilter.bind(this)
    this.handleChange       = this.handleChange.bind(this)

    this.lowPass   = this.lowPass.bind(this)
    this.highPass  = this.highPass.bind(this)
    this.bandPass  = this.bandPass.bind(this)
    this.bandBlock = this.bandBlock.bind(this)

    let xs = [...Array(256).keys()]
    let signal = xs.map(x => Math.sin(x/10) + 0.2*Math.sin(x) ) 

    let siganl_fft = fft(signal)

    this.state = {
      sampling_frequency: 512, 
           cut_frequency: 30, 
                  result: [],
                  signal: signal, 
                      xs: [], 
              signal_fft: siganl_fft, 
           signal_fft_db: [], 
                  filter: [],
              filter_fft: [],
             filter_type: null, 
             window_type: "lowPass",
    }
  }

  convolve(signal, filter) {
    let matrix = signal.map(sig => {
      return filter.map(fil =>{
        return sig * fil
      })
    })

    let result = []
    for (let linha = 0; linha < matrix.length; linha++)
      for (let coluna = 0; coluna < matrix[0].length; coluna++)
        if (result[linha+coluna])
          result[linha+coluna] += matrix[linha][coluna]
        else
          result[linha+coluna] = matrix[linha][coluna]
    return result
  }

  lowPass(){
    let xs =[...Array(this.state.sampling_frequency).keys()]
    let norm_rate = this.state.cut_frequency/this.state.sampling_frequency
    let half_samp = this.state.sampling_frequency/2
    let last
    return xs.map((x) => {
      let val = ((Math.sin(10 * Math.PI * norm_rate * (x-half_samp)) / (Math.PI * (x-half_samp))) || last)
      last = val
      return val
    })
  }

  highPass(){
    let xs =[...Array(this.state.sampling_frequency).keys()]
    let norm_rate = this.state.cut_frequency/this.state.sampling_frequency
    let half_samp = this.state.sampling_frequency/2
    let last
    return xs.map((x) => {
      let val = -(Math.sin(10 * Math.PI * norm_rate * (x-half_samp)) / (Math.PI * (x-half_samp))) || last
      last = val
      return val
    })
  }

  bandPass(){
    let xs =[...Array(this.state.sampling_frequency).keys()]
    let norm_rate = this.state.cut_frequency/this.state.sampling_frequency
    let half_samp = this.state.sampling_frequency/2
    let last
    return xs.map((x) => {
      let val = (Math.sin(10 * Math.PI * norm_rate * (x-half_samp)) / (Math.PI * (x-half_samp))) || last
      last = val
      return val
    })
  }

  bandBlock(){
    let xs =[...Array(this.state.sampling_frequency).keys()]
    let norm_rate = this.state.cut_frequency/this.state.sampling_frequency
    let half_samp = this.state.sampling_frequency/2
    let last
    return xs.map((x) => {
      let val = (Math.sin(10 * Math.PI * norm_rate * (x-half_samp)) / (Math.PI * (x-half_samp))) || last
      last = val
      return val
    })
  }

  loadSignal(signal){
    let xs = [...Array(signal.length).keys()].map(x => x/360)
    this.setState({
      signal: signal,
      xs: xs,
      sampling_frequency: signal.length
    })
    let nearest_pow2 = Math.pow( 2, parseInt(Math.log( this.state.signal.length ) / Math.log( 2 )) ); 
    let signal_fft = fft(this.state.signal.slice(0, nearest_pow2));
    let signal_fft_db = signal_fft.map((value) => db.fromGain(value))
    this.setState({
      signal_fft: signal_fft,
      signal_fft_db: signal_fft_db
    })
  }

  uploadFile(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = function(the_file) {
      let signal = the_file.target.result.split("\n").map(i => parseFloat(i))
      this.loadSignal(signal)
    }.bind(this)
    reader.readAsText(file);
  }

  handleSelectWindow(e){
    this.setState({window: wfuncs[e.target.value] })
  }

  graphData(values, name){
    return (
      values.map((x, i) => {
        return {
          name: name == "fourier" ? i/180 * 32 : i/180, 
          [name]: x
        }
      })
    )
  }

  handleChange(event) {
    let filter = this.state.filter_type && this[this.state.filter_type]() || []
    let nearest_pow2 = Math.pow( 2, parseInt(Math.log( filter.length ) / Math.log( 2 )) ); 
    let filter_fft = fft(filter.slice(0, nearest_pow2));
    let result = this.convolve(this.state.signal, filter)
    this.setState({
      [event.target.name]: parseInt(event.target.value),
                   filter: filter,
               filter_fft: filter_fft,
                   result: result.filter(r => r)
    });
  }

  handleChangeFilter(event){
    let filter = this[event.target.value]()
    let nearest_pow2 = Math.pow( 2, parseInt(Math.log( filter.length ) / Math.log( 2 )) ); 
    let filter_fft = fft(filter.slice(0, nearest_pow2));
    let result = this.convolve(this.state.signal, filter)
    this.setState({
     filter_type: event.target.value,
          filter: filter,
      filter_fft: filter_fft,
          result: result.filter(r => r)
    });
  }

  
  render() {
    let signal_data     = this.graphData(this.state.signal,     "signal")
    let fourier_data    = this.graphData(this.state.signal_fft, "fourier")
    let filter_data     = this.graphData(this.state.filter,     "signal")
    let filter_fft_data = this.graphData(this.state.filter_fft, "fourier")
    let result_data     = this.graphData(this.state.result,     "signal")

    console.log(this.state.result)

    return (
      <Container>
        <Row>
          <Col md="10">
            <Row>
              <LineChart width={475} height={200} data={signal_data}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="1 1"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="signal" stroke="steelblue" dot={false} />
              </LineChart>
              <LineChart width={475} height={200} data={fourier_data}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="1 1"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="fourier" stroke="steelblue" dot={false} />
              </LineChart>
            </Row>

            <Row>
            </Row>
            <Row>
              <LineChart width={475} height={200} data={filter_data}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="1 1"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="signal" stroke="steelblue" dot={false} />
              </LineChart>


              <LineChart width={475} height={200} data={filter_fft_data}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="1 1"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="fourier" stroke="steelblue" dot={false} />
              </LineChart>
            </Row>

            <LineChart width={475} height={200} data={result_data}>
              <XAxis dataKey="name"/>
              <YAxis />
              <CartesianGrid strokeDasharray="1 1"/>
              <Tooltip/>
              <Legend />
              <Line type="monotone" dataKey="signal" stroke="steelblue" dot={false} />
            </LineChart>
          </Col>


          <Col md="2">
            <div className="form">
              <FormGroup>
                <Label>Sampling frequency</Label>
                <Input value={this.state.sampling_frequency} type="number" name="sampling_frequency" onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label for="exampleFile">Upload signal</Label>
                <Input type="file" name="file" onChange={this.uploadFile}/>
              </FormGroup>
              <FormGroup>
                <Label for="window">Filter type</Label>
                <Input onChange={this.handleChangeFilter} type="select" name="filter_type">
                  <option disabled selected value>Select</option>
                  <option value={"lowPass"}>Low Pass</option>
                  <option value={"highPass"}>High Pass</option>
                  <option value={"bandPass"}>Band Pass</option>
                  <option value={"bandBlock"}>Band Block</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Cut frequency</Label>
                <Input value={this.state.cut_frequency} type="number" name="cut_frequency" onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label for="window">Window Function</Label>
                <Input onChange={this.handleSelectWindow} type="select" name="wfunc_select">
                  <option disabled selected value >Select</option>
                  <option value={"bartlettHann"}>Bartlett-Hann</option>
                  <option value={"bartlett"}>Bartlett</option>
                  <option value={"blackmanHarris"}>Blackman-Harris</option>
                  <option value={"blackmanNuttall"}>Blackman-Nuttall</option>
                  <option value={"cosine"}>Cosine</option>
                  <option value={"exactBlackman"}>Exact Blackman</option>
                  <option value={"flatTop"}>Flat top</option>
                  <option value={"gaussian"}>Gaussian</option>
                  <option value={"hamming"}>Hamming</option>
                  <option value={"hann"}>Hann</option>
                  <option value={"lanczos"}>Lanczos</option>
                  <option value={"nuttall"}>Nuttall</option>
                  <option value={"rectangular"}>Rectangular</option>
                  <option value={"triangular"}>Triangular</option>
                  <option value={"tukey"}>Tukey</option>
                  <option value={"welch"}>Welch</option>
                </Input>
              </FormGroup>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
