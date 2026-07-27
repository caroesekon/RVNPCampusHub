import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { applyVerification } from '@/api/users';
import { getPlans, getPaymentMethods, initiateMpesaPayment } from '@/api/payments';
import { formatCurrency } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export const VerificationPage = ({ embedded = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(user?.hdmVerified ? 'verified' : 'plans');
  const [plans, setPlans] = useState([]);
  const [methods, setMethods] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, methodsRes] = await Promise.all([getPlans(), getPaymentMethods()]);
        setPlans((plansRes.data || plansRes).filter(p => p.price > 0 && p.includesVerification));
        setMethods(methodsRes.data || methodsRes);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const isManualPayment = selectedMethod?.slug && ['mpesa-sendmoney', 'mpesa-till', 'mpesa-paybill'].includes(selectedMethod.slug);
  const isSTKPush = selectedMethod?.slug === 'mpesa-stkpush';

  const handleSubmit = async () => {
    if (!selectedPlan) return toast.error('Select a plan');
    if (!selectedMethod) return toast.error('Select a payment method');
    if (isSTKPush && !phone) return toast.error('Enter your M-Pesa phone number');
    if (isManualPayment && !confirmationCode) return toast.error('Enter the M-Pesa confirmation code');

    setLoading(true);
    try {
      await applyVerification({
        amount: selectedPlan.price,
        paymentMethod: selectedMethod.slug,
        planId: selectedPlan._id,
        phone: phone.startsWith('0') ? `+254${phone.slice(1)}` : phone,
        confirmationCode: isManualPayment ? confirmationCode : undefined,
      });

      if (isSTKPush) {
        await initiateMpesaPayment({
          phone: phone.startsWith('0') ? `+254${phone.slice(1)}` : phone,
          amount: selectedPlan.price,
          purpose: 'verification_application',
          planId: selectedPlan._id,
        });
        toast.success('STK Push sent! Enter your PIN.');
      } else {
        toast.success('Application submitted! Admin will verify your payment.');
      }

      setStep('submitted');
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getInstructions = (method) => {
    if (!method?.instructions) return '';
    let text = method.instructions;
    if (selectedPlan) text = text.replace('{amount}', formatCurrency(selectedPlan.price));
    if (method.config?.phoneNumber) {
      text = text.replace('Enter phone number', `Enter phone number: ${method.config.phoneNumber}`);
      text = text.replace('07XXXXXXXX', method.config.phoneNumber);
    }
    if (method.config?.tillNumber) text = text.replace('Enter Till Number', `Enter Till Number: ${method.config.tillNumber}`);
    if (method.config?.paybillNumber) text = text.replace('Enter Business Number', `Enter Business Number: ${method.config.paybillNumber}`);
    if (method.config?.accountNumber) text = text.replace('Account Number', `Account Number: ${method.config.accountNumber}`);
    return text;
  };

  const getMethodIcon = (slug) => {
    if (slug === 'mpesa-stkpush') return '📱';
    if (slug === 'mpesa-sendmoney') return '💸';
    if (slug === 'mpesa-till') return '🏪';
    if (slug === 'mpesa-paybill') return '🧾';
    return '💳';
  };

  const getMethodNumber = (method) => {
    if (!method?.config) return null;
    if (method.config.phoneNumber) return { label: 'Send to', value: method.config.phoneNumber };
    if (method.config.tillNumber) return { label: 'Till Number', value: method.config.tillNumber };
    if (method.config.paybillNumber) {
      const acc = method.config.accountNumber ? ` | Account: ${method.config.accountNumber}` : '';
      return { label: 'Paybill', value: `${method.config.paybillNumber}${acc}` };
    }
    return null;
  };

  const VerifiedBadge = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="10" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.5"/>
      <circle cx="11" cy="11" r="10" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
      <path d="M7 11L10 13L15 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const content = (
    <div>
      {loadingData && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}

      {!loadingData && step === 'verified' && (
        <div className="text-center py-8">
          <div className="flex justify-center mb-3"><VerifiedBadge size={40} /></div>
          <h2 className="text-lg font-black text-[var(--color-text)]">You're HDM Verified!</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">Your blue tick is active across the platform.</p>
        </div>
      )}

      {!loadingData && step === 'plans' && (
        <div>
          <h3 className="font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-bold">1</span>
            Select a Plan
          </h3>
          <div className="space-y-2 mb-6">
            {plans.map(plan => (
              <button key={plan._id} onClick={() => { setSelectedPlan(plan); setSelectedMethod(null); }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedPlan?._id === plan._id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--color-text)] text-sm">{plan.name}</span>
                  <span className="text-base font-black text-[var(--color-text)]">{formatCurrency(plan.price)}</span>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">{plan.durationLabel}</span>
              </button>
            ))}
          </div>

          {selectedPlan && (
            <>
              <h3 className="font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-bold">2</span>
                Payment Method
              </h3>
              <div className="space-y-2 mb-6">
                {methods.filter(m => m.isActive !== false).map(method => {
                  const number = getMethodNumber(method);
                  return (
                    <button key={method._id} onClick={() => { setSelectedMethod(method); setConfirmationCode(''); }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedMethod?._id === method._id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getMethodIcon(method.slug)}</span>
                        <div>
                          <span className="font-semibold text-[var(--color-text)] text-sm">{method.name}</span>
                          {number && <p className="text-xs text-[var(--color-text-secondary)]">{number.label}: <strong className="text-[var(--color-text)]">{number.value}</strong></p>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {selectedPlan && selectedMethod && (
            <>
              <h3 className="font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-bold">3</span>
                {isSTKPush ? 'Enter Phone Number' : 'Confirm Payment'}
              </h3>
              {isSTKPush && (
                <div className="mb-4">
                  <Input label="M-Pesa Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712345678" />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">You will receive an STK Push. Enter your PIN to pay <strong>{formatCurrency(selectedPlan.price)}</strong>.</p>
                </div>
              )}
              {isManualPayment && (
                <div className="mb-4">
                  <div className="bg-[var(--color-bg)] rounded-lg p-3 mb-3 whitespace-pre-line text-sm text-[var(--color-text-secondary)] leading-relaxed">{getInstructions(selectedMethod)}</div>
                  <Input label="M-Pesa Confirmation Code" value={confirmationCode} onChange={e => setConfirmationCode(e.target.value)} placeholder="e.g. RTY6W2XK9P" />
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mt-3">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 leading-relaxed">⚠️ <strong>Auto-rejection in 3 hours</strong> if payment is not confirmed. Make sure the M-Pesa confirmation code is correct.</p>
                  </div>
                </div>
              )}
              <div className="bg-[var(--color-bg)] rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm"><span className="text-[var(--color-text-secondary)]">Plan</span><span className="font-semibold text-[var(--color-text)]">{selectedPlan.name}</span></div>
                <div className="flex justify-between text-sm mt-1"><span className="text-[var(--color-text-secondary)]">Method</span><span className="font-semibold text-[var(--color-text)]">{selectedMethod.name}</span></div>
                <div className="flex justify-between text-sm mt-1 pt-1 border-t border-[var(--color-border)]"><span className="text-[var(--color-text-secondary)]">Amount</span><span className="font-black text-[var(--color-text)]">{formatCurrency(selectedPlan.price)}</span></div>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : `Submit Application — ${formatCurrency(selectedPlan.price)}`}
              </Button>
            </>
          )}
        </div>
      )}

      {step === 'submitted' && (
        <div className="text-center py-8">
          <span className="text-5xl block mb-3">✅</span>
          <h2 className="text-lg font-black text-[var(--color-text)]">Application Submitted!</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {isManualPayment ? 'Your application has been received. Admin will verify your payment and review your application.' : 'Check your phone and enter your M-Pesa PIN to complete payment.'}
          </p>
          {isManualPayment && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">⚠️ Complete payment within 3 hours to avoid auto-rejection.</p>}
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col justify-center px-6">
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">🔵</span>
        <h1 className="text-xl font-black text-[var(--color-text)]">HDM Verification</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Choose a plan and get verified</p>
      </div>
      {content}
      {!embedded && <Button variant="ghost" className="mt-4" onClick={() => navigate('/profile')}>Back to Profile</Button>}
    </div>
  );
};