import { loadStripe } from '@stripe/stripe-js'
import api from './api'

let stripePromise

export const getStripePromise = async () => {
  if (!stripePromise) {
    const { data } = await api.get('/payments/config')
    if (!data.publishableKey)
      throw new Error('Stripe publishable key is not configured on the server')
    stripePromise = loadStripe(data.publishableKey)
  }

  const stripe = await stripePromise
  if (!stripe) {
    stripePromise = null
    throw new Error('Could not connect to Stripe. Please try again.')
  }

  return stripePromise
}