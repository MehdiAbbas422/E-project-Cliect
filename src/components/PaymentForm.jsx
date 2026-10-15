import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

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

const PaymentForm = ({ amount, expoId, exhibitorData, onSuccess, onCancel }) => (
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

export default PaymentForm
