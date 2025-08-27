import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface RequestFeatureProps {
  onClose: () => void;
}

const RequestFeature = ({ onClose }: RequestFeatureProps) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const SERVICE_ID = 'service_9vh6pig';
  const TEMPLATE_ID = 'template_vk85m2f';
  const PUBLIC_KEY = 'zl3WlpNTz2F31e_sD';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !message) {
      setStatus('error');
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const templateParams = {
        email: email,
        message: message,
        to_email: 'akshit07032001@gmail.com',
        subject: 'LifeNode Extension - Feature Request',
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

      setStatus('success');
      setEmail('');
      setMessage('');

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setEmail('');
    setMessage('');
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle
          size={48}
          className="mx-auto mb-4"
          style={{ color: 'var(--primary)' }}
        />
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text)' }}
        >
          Message Sent Successfully!
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Thank you for your feedback. We'll get back to you soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text)' }}
        >
          Request a Feature
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Have an idea to improve LifeNode? We'd love to hear from you!
        </p>
      </div>

      {status === 'error' && (
        <div
          className="p-3 rounded-lg border flex items-start gap-2"
          style={{
            backgroundColor: 'var(--error-bg)',
            borderColor: 'var(--error-border)',
            color: 'var(--error-text)',
          }}
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text)' }}
          >
            Your Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              //   '--tw-ring-color': 'var(--primary)',
            }}
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text)' }}
          >
            Feature Request / Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the feature you'd like to see or any feedback you have..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors resize-none"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              //   '--tw-ring-color': 'var(--primary)',
            }}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isLoading ? 'var(--surface)' : 'var(--primary)',
              color: 'white',
              border: `1px solid ${
                isLoading ? 'var(--border)' : 'var(--primary)'
              }`,
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Message
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestFeature;
