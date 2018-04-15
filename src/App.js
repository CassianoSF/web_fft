import React, { Component } from 'react';
import './App.css';
import * as fftjs from 'fft-js';
import {Line} from 'react-chartjs';



// Use the in-place mapper to populate the data.

class App extends Component {
  constructor(props) {    
    super(props);

    let fft = fftjs.fft,
        fftUtil = fftjs.util

    let xs = [...Array(512).keys()]

    let signal = xs.map(x => 5*Math.sin(0.8*6.28*x) + 2.5*Math.sin(1.1*6.28*x) )

    let phasors= fft(signal);

    let frequencies = fftUtil.fftFreq(phasors, 8000),
        magnitudes = fftUtil.fftMag(phasors).map(m => m/200); 

    let both = frequencies.map(function (f, ix) {
        return {frequency: f, magnitude: magnitudes[ix]};
    });

    let options = {
      pointDot: false,
    }


    this.state = {
          phasors: phasors,
               xs: xs,
             both: both,
           signal: signal,
      frequencies: frequencies,
       magnitudes: magnitudes,
          options: options
    }

  }

  
  render() {
    console.log(this.state)
    let signal_graph = {
      labels:  this.state.xs,
      datasets: [
        {
          label: "My First dataset",
          fillColor: "rgba(220,220,255,0)",
          strokeColor: "rgba(0,0,255,1)",
          pointColor: "rgba(0,0,255,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data:  this.state.signal
        }
      ]
    }

    let ft_graph = {
      labels:  this.state.frequencies,
      datasets: [
        {
          label: "My First dataset",
          fillColor: "rgba(220,220,255,0)",
          strokeColor: "rgba(0,0,255,1)",
          pointColor: "rgba(0,0,255,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data:  this.state.magnitudes
        }
      ]
    }
    return (
      <div className="App">
        <Line data={signal_graph} options={this.state.options} width="1200" height="400"/>
        <Line data={ft_graph} options={this.state.options} width="1200" height="400"/>
      </div>
    );
  }
}

export default App;
