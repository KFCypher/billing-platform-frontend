/**
 * Billing Platform - Embeddable Widget
 * 
 * Usage:
 * <div id="billing-widget"></div>
 * <script src="https://your-domain.com/billing-widget.js"></script>
 * <script>
 *   BillingWidget.init({
 *     apiKey: 'pk_test_xxx',
 *     container: '#billing-widget',
 *     successUrl: 'https://example.com/success',
 *     cancelUrl: 'https://example.com/cancel'
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  const API_BASE_URL = window.BILLING_WIDGET_API_URL || 'http://localhost:8000';

  const BillingWidget = {
    config: {},
    plans: [],

    /**
     * Initialize the billing widget
     */
    init: function(config) {
      // Validate configuration
      if (!config.apiKey) {
        console.error('BillingWidget: apiKey is required');
        return;
      }
      if (!config.container) {
        console.error('BillingWidget: container is required');
        return;
      }

      this.config = {
        apiKey: config.apiKey,
        container: config.container,
        successUrl: config.successUrl || window.location.href,
        cancelUrl: config.cancelUrl || window.location.href,
        theme: config.theme || 'light',
        currency: config.currency || 'GH₵',
        paymentProvider: config.paymentProvider || 'stripe', // stripe, paystack, momo
      };

      // Load plans and render
      this.loadPlans();
    },

    /**
     * Fetch plans from API
     */
    loadPlans: async function() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/widget/plans?api_key=${this.config.apiKey}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }

        const data = await response.json();
        this.plans = data.plans || [];
        this.render();
      } catch (error) {
        console.error('BillingWidget: Error loading plans', error);
        this.renderError('Failed to load pricing plans. Please try again later.');
      }
    },

    /**
     * Render the widget
     */
    render: function() {
      const container = document.querySelector(this.config.container);
      if (!container) {
        console.error('BillingWidget: Container not found');
        return;
      }

      // Inject styles
      this.injectStyles();

      // Build HTML
      const html = `
        <div class="billing-widget" data-theme="${this.config.theme}">
          <div class="billing-widget-header">
            <h2>Choose Your Plan</h2>
            <p>Select the plan that best fits your needs</p>
          </div>
          <div class="billing-widget-plans">
            ${this.plans.map(plan => this.renderPlan(plan)).join('')}
          </div>
          <div class="billing-widget-footer">
            <p>Secure payment powered by <strong>Billing Platform</strong></p>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Attach event listeners
      this.attachEventListeners();
    },

    /**
     * Render individual plan card
     */
    renderPlan: function(plan) {
      const featuredBadge = plan.is_featured 
        ? '<span class="billing-widget-badge">Popular</span>' 
        : '';

      const trialText = plan.trial_days > 0 
        ? `<p class="billing-widget-trial">${plan.trial_days} day free trial</p>` 
        : '';

      const features = plan.features && plan.features.length > 0
        ? plan.features.map(feature => `<li>${feature}</li>`).join('')
        : '<li>All features included</li>';

      const interval = plan.billing_interval === 'month' ? 'mo' : 'yr';

      return `
        <div class="billing-widget-plan ${plan.is_featured ? 'featured' : ''}">
          ${featuredBadge}
          <div class="billing-widget-plan-header">
            <h3>${plan.name}</h3>
            <div class="billing-widget-price">
              <span class="currency">${this.config.currency}</span>
              <span class="amount">${plan.price.toFixed(2)}</span>
              <span class="interval">/${interval}</span>
            </div>
            ${trialText}
          </div>
          <div class="billing-widget-plan-body">
            <p class="description">${plan.description || ''}</p>
            <ul class="features">
              ${features}
            </ul>
          </div>
          <div class="billing-widget-plan-footer">
            <button 
              class="billing-widget-btn ${plan.is_featured ? 'primary' : 'secondary'}"
              data-plan-id="${plan.id}"
            >
              Choose ${plan.name}
            </button>
          </div>
        </div>
      `;
    },

    /**
     * Render error message
     */
    renderError: function(message) {
      const container = document.querySelector(this.config.container);
      if (!container) return;

      container.innerHTML = `
        <div class="billing-widget-error">
          <p>${message}</p>
        </div>
      `;
    },

    /**
     * Attach event listeners to plan buttons
     */
    attachEventListeners: function() {
      const buttons = document.querySelectorAll('.billing-widget-btn');
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          const planId = e.target.getAttribute('data-plan-id');
          this.handleSubscribe(planId);
        });
      });
    },

    /**
     * Handle subscription button click
     */
    handleSubscribe: async function(planId) {
      // Collect customer info (you can customize this)
      const email = prompt('Enter your email address:');
      if (!email) return;

      const name = prompt('Enter your name:');
      if (!name) return;

      const button = document.querySelector(`[data-plan-id="${planId}"]`);
      if (!button) return;
      
      const originalText = button.textContent;

      try {
        // Show loading state
        button.textContent = 'Processing...';
        button.disabled = true;

        console.log('BillingWidget: Creating checkout session', {
          planId,
          email,
          name,
          paymentProvider: this.config.paymentProvider,
          apiKey: this.config.apiKey.substring(0, 10) + '...'
        });

        // Create checkout session
        const response = await fetch(`${API_BASE_URL}/api/v1/widget/checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: this.config.apiKey,
            plan_id: parseInt(planId),
            customer_email: email,
            customer_name: name,
            payment_provider: this.config.paymentProvider,
            success_url: this.config.successUrl,
            cancel_url: this.config.cancelUrl,
          }),
        });

        console.log('BillingWidget: Response status', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('BillingWidget: Checkout error response', errorData);
          throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const data = await response.json();
        console.log('BillingWidget: Checkout response', data);

        // Redirect to checkout
        if (data.checkout_url) {
          console.log('BillingWidget: Redirecting to', data.checkout_url);
          window.location.href = data.checkout_url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (error) {
        console.error('BillingWidget: Checkout error', error);
        alert(`Failed to process checkout: ${error.message}`);
        
        // Restore button state
        button.textContent = originalText;
        button.disabled = false;
      }
    },

    /**
     * Inject widget styles
     */
    injectStyles: function() {
      if (document.getElementById('billing-widget-styles')) return;

      const styles = `
        <style id="billing-widget-styles">
          .billing-widget {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          .billing-widget[data-theme="dark"] {
            color: #e5e7eb;
          }

          .billing-widget-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .billing-widget-header h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            color: #111827;
          }

          .billing-widget[data-theme="dark"] .billing-widget-header h2 {
            color: #f9fafb;
          }

          .billing-widget-header p {
            font-size: 1.125rem;
            color: #6b7280;
            margin: 0;
          }

          .billing-widget-plans {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
          }

          .billing-widget-plan {
            position: relative;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 1rem;
            padding: 2rem;
            transition: all 0.3s ease;
          }

          .billing-widget-plan:hover {
            border-color: #3b82f6;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
            transform: translateY(-4px);
          }

          .billing-widget-plan.featured {
            border-color: #3b82f6;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
          }

          .billing-widget-badge {
            position: absolute;
            top: -12px;
            right: 20px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
          }

          .billing-widget-plan-header h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            color: #111827;
          }

          .billing-widget-price {
            display: flex;
            align-items: baseline;
            margin-bottom: 0.5rem;
          }

          .billing-widget-price .currency {
            font-size: 1.25rem;
            color: #6b7280;
            margin-right: 0.25rem;
          }

          .billing-widget-price .amount {
            font-size: 3rem;
            font-weight: 700;
            color: #111827;
          }

          .billing-widget-price .interval {
            font-size: 1rem;
            color: #6b7280;
            margin-left: 0.25rem;
          }

          .billing-widget-trial {
            color: #10b981;
            font-weight: 500;
            margin: 0;
          }

          .billing-widget-plan-body {
            padding: 1.5rem 0;
          }

          .billing-widget-plan-body .description {
            color: #6b7280;
            margin-bottom: 1.5rem;
          }

          .billing-widget-plan-body .features {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .billing-widget-plan-body .features li {
            padding: 0.5rem 0;
            color: #374151;
            position: relative;
            padding-left: 1.5rem;
          }

          .billing-widget-plan-body .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: 700;
          }

          .billing-widget-btn {
            width: 100%;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .billing-widget-btn.primary {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
          }

          .billing-widget-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
          }

          .billing-widget-btn.secondary {
            background: white;
            color: #3b82f6;
            border: 2px solid #3b82f6;
          }

          .billing-widget-btn.secondary:hover {
            background: #eff6ff;
          }

          .billing-widget-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .billing-widget-footer {
            text-align: center;
            color: #9ca3af;
            font-size: 0.875rem;
          }

          .billing-widget-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 0.5rem;
            padding: 1rem;
            color: #991b1b;
            text-align: center;
          }

          /* Dark theme overrides */
          .billing-widget[data-theme="dark"] .billing-widget-plan {
            background: #1f2937;
            border-color: #374151;
          }

          .billing-widget[data-theme="dark"] .billing-widget-plan:hover {
            border-color: #3b82f6;
          }

          .billing-widget[data-theme="dark"] .billing-widget-plan-header h3,
          .billing-widget[data-theme="dark"] .billing-widget-price .amount {
            color: #f9fafb;
          }

          .billing-widget[data-theme="dark"] .billing-widget-plan-body .features li {
            color: #d1d5db;
          }
        </style>
      `;

      document.head.insertAdjacentHTML('beforeend', styles);
    },
  };

  // Expose to global scope
  window.BillingWidget = BillingWidget;

})(window);
