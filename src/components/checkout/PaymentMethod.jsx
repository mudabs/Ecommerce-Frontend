import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material'
import React from 'react'

const PaymentMethod = ({ paymentMethod, onChange }) => {
  return (
    <div className='max-w-md mx-auto p-5 bg-white shadow-md rounded-lg mt-16 border'>
        <h1 className='text-2xl font-semibold mb-4'>Select Payment Method</h1>
        <FormControl>
            <RadioGroup
                aria-label="payment method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => onChange(e.target.value)}
            >
                <FormControlLabel 
                    value="Stripe" 
                    control={<Radio color='primary' />} 
                    label="Stripe" 
                    className='text-gray-700'/>

                <FormControlLabel 
                    value="Paypal" 
                    control={<Radio color='primary' />} 
                    label="Paypal" 
                    className='text-gray-700'/>
            </RadioGroup>
        </FormControl>
    </div>
  )
}

export default PaymentMethod