import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getPlans, getMySubscription, subscribe, cancelSubscription, getPaymentMethods } from '@/api/subscriptions';
import { initiateMpesaPayment } from '@/api/payments';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export const SubscriptionsPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [mySub, setMySub] = useState(null);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [plansRes, subRes, methodsRes] = await Promise.all([
          getPlans(), getMySubscription(), getPaymentMethods(),
        ]);
        setPlans((plansRes.data || plansRes).filter(p => p.price > 0));
        setMySub(subRes.data || subRes);
        setMethods((methodsRes.data || methodsRes).filter(m => m.isActive !== false));
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan) return toast.error('Select a plan');
    if (!selectedMethod) return toast.error('Select a payment method');
    if (selectedMethod.slug === 'mpesa-stkpush' && !phone) return toast.error('Enter phone number');

    setSubscribing(true);
    try {
      await subscribe({ planId: selectedPlan._id, paymentMethodId: selectedMethod._id });
      if (selectedMethod.slug === 'mpesa-stkpush') {
        await initiateMpesaPayment({
          phone: phone.startsWith('0') ? `+254${phone.slice(1)}` : phone,
          amount: selectedPlan.price,
          purpose: 'plan_purchase',
          planId: selectedPlan._id,
        });
        toast.success('STK Push sent! Enter PIN.');
      } else {
        toast.success('Subscribed!');
      }
      refreshUser();
      setSelectedPlan(null);
      setSelectedMethod(null);
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setSubscribing(false); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription?')) return;
    try {
      await cancelSubscription('User cancelled');
      setMySub(null);
      toast.success('Cancelled');
      refreshUser();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="pb-20">
      <h2 className="text-xl font-black text-[var(--color-text)] mb-4">Subscription</h2>

      {/* Current Plan */}
      {mySub && (
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80 rounded-xl p-4 mb-4 text-white">
          <p className="text-xs text-white/70">Current Plan</p>
          <p className="text-lg font-black">{mySub.planName}</p>
          {mySub.expiresAt && <p className="text-xs text-white/70 mt-1">Expires {formatDate(mySub.expiresAt)}</p>}
          <Button variant="outline" size="sm" className="mt-3 bg-white/10 text-white border-white/20" onClick={handleCancel}>Cancel Subscription</Button>
        </div>
      )}

      {/* Available Plans */}
      <h3 className="font-bold text-[var(--color-text)] mb-3">Upgrade Plan</h3>
      <div className="space-y-3 mb-6">
        {plans.map(plan => (
          <button key={plan._id} onClick={() => setSelectedPlan(plan)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedPlan?._id === plan._id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)]'
            }`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--color-text)]">{plan.name}</span>
              <span className="text-lg font-black text-[var(--color-text)]">{formatCurrency(plan.price)}</span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{plan.durationLabel}</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {plan.features?.slice(0, 4).map((f, i) => (
                <span key={i} className="text-[10px] bg-[var(--color-bg)] px-2 py-0.5 rounded-full text-[var(--color-text-secondary)]">{f}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Payment Methods */}
      {selectedPlan && (
        <>
          <h3 className="font-bold text-[var(--color-text)] mb-3">Payment Method</h3>
          <div className="space-y-2 mb-4">
            {methods.map(m => (
              <button key={m._id} onClick={() => setSelectedMethod(m)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedMethod?._id === m._id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)]'
                }`}>
                <span className="font-semibold text-[var(--color-text)] text-sm">{m.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedMethod?.slug === 'mpesa-stkpush' && (
        <div className="mb-4">
          <Input label="M-Pesa Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712345678" />
        </div>
      )}

      {selectedPlan && selectedMethod && (
        <Button className="w-full" onClick={handleSubscribe} disabled={subscribing}>
          {subscribing ? 'Processing...' : `Pay ${formatCurrency(selectedPlan.price)}`}
        </Button>
      )}
    </div>
  );
};