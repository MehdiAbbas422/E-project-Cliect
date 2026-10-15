import { useEffect, useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api'
import { getStripePromise } from '../stripe'

const CheckoutForm = ({ amount, expoId, exhibitorData, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    try {
      // First create the exhibitor profile
      const { data: exhibitor } = await api.post('/exhibitors', exhibitorData)

      // Create payment intent
      const { data: { clientSecret } } = await api.post('/payments/create-intent', {
        expoId,
        amount,
        exhibitorId: exhibitor._id
      })

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      })

      if (stripeError) {
        setError(stripeError.message)
        setLoading(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(exhibitor)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-amount">
        <span>Registration Fee:</span>
        <strong>₹{Number(amount).toFixed(2)}</strong>
      </div>
      <div className="card-element-wrapper">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#fff',
              '::placeholder': { color: 'rgba(255,255,255,0.5)' }
            }
          }
        }} />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="row mt">
        <button type="submit" disabled={!stripe || loading} className="full">
          {loading ? 'Processing...' : `Pay ₹${Number(amount).toFixed(2)}`}
        </button>
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}

const PaymentForm = ({ amount, expoId, exhibitorData, onSuccess, onCancel }) => {
  const [stripePromise, setStripePromise] = useState(null)
  const [stripeError, setStripeError] = useState('')

  useEffect(() => {
    let active = true
    getStripePromise()
      .then((promise) => { if (active) setStripePromise(promise) })
      .catch((error) => { if (active) setStripeError(error.response?.data?.message || error.message) })
    return () => { active = false }
  }, [])

  if (stripeError) return <p className="error">{stripeError}</p>
  if (!stripePromise) return <p className="muted">Loading secure payment...</p>

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        expoId={expoId}
        exhibitorData={exhibitorData}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  )
}

export default PaymentForm
