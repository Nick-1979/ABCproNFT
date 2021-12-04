import React from 'react';
import {makeStyles } from "@mui/styles";

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';


export default function LinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Edit', 'confirm', 'submit']

  const nextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };


  const resetStepper = () => {
    setActiveStep(0);
  };

  return (
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
   
  );
}
