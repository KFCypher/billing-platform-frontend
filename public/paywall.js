/**
 * Billing Platform Paywall Helper
 * 
 * Use this script to protect premium content on your website.
 * Requires the customer's email to verify their subscription status.
 */

(function() {
    'use strict';

    const BillingPaywall = {
        apiUrl: 'http://localhost:8000/api/v1/widget',
        apiKey: null,

        /**
         * Initialize the paywall with your API key
         * @param {string} apiKey - Your public API key (starts with pk_)
         */
        init: function(apiKey) {
            this.apiKey = apiKey;
            console.log('BillingPaywall: Initialized');
        },

        /**
         * Check if a user has an active subscription
         * @param {string} email - Customer's email address
         * @returns {Promise<Object>} Subscription verification result
         */
        verifySubscription: async function(email) {
            if (!this.apiKey) {
                throw new Error('BillingPaywall: API key not set. Call init() first.');
            }

            if (!email) {
                throw new Error('BillingPaywall: Email is required');
            }

            try {
                const response = await fetch(`${this.apiUrl}/verify-subscription`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        api_key: this.apiKey,
                        email: email
                    })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to verify subscription');
                }

                return data;
            } catch (error) {
                console.error('BillingPaywall: Error verifying subscription:', error);
                throw error;
            }
        },

        /**
         * Check if a user has access to a specific feature
         * @param {string} email - Customer's email address
         * @param {string} feature - Feature name to check
         * @returns {Promise<Object>} Feature access result
         */
        checkFeatureAccess: async function(email, feature) {
            if (!this.apiKey) {
                throw new Error('BillingPaywall: API key not set. Call init() first.');
            }

            if (!email || !feature) {
                throw new Error('BillingPaywall: Email and feature are required');
            }

            try {
                const response = await fetch(`${this.apiUrl}/check-feature-access`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        api_key: this.apiKey,
                        email: email,
                        feature: feature
                    })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to check feature access');
                }

                return data;
            } catch (error) {
                console.error('BillingPaywall: Error checking feature access:', error);
                throw error;
            }
        },

        /**
         * Protect an element - show only if user has active subscription
         * @param {string} selector - CSS selector for element(s) to protect
         * @param {string} email - Customer's email address
         * @param {Object} options - Optional configuration
         */
        protect: async function(selector, email, options = {}) {
            const elements = document.querySelectorAll(selector);
            
            if (elements.length === 0) {
                console.warn(`BillingPaywall: No elements found for selector "${selector}"`);
                return;
            }

            try {
                const result = await this.verifySubscription(email);
                
                if (result.has_subscription) {
                    // User has subscription - show content
                    elements.forEach(el => {
                        el.style.display = '';
                        el.classList.remove('paywall-locked');
                        el.classList.add('paywall-unlocked');
                    });

                    if (options.onUnlock) {
                        options.onUnlock(result.subscription);
                    }
                } else {
                    // No subscription - hide content or show upgrade message
                    elements.forEach(el => {
                        if (options.hideContent !== false) {
                            el.style.display = 'none';
                        }
                        el.classList.add('paywall-locked');
                        el.classList.remove('paywall-unlocked');
                    });

                    if (options.onLock) {
                        options.onLock();
                    }

                    if (options.showUpgradeMessage !== false) {
                        this.showUpgradeMessage(elements[0], options);
                    }
                }
            } catch (error) {
                console.error('BillingPaywall: Error protecting content:', error);
                
                // On error, hide content by default for security
                if (options.hideOnError !== false) {
                    elements.forEach(el => {
                        el.style.display = 'none';
                    });
                }
            }
        },

        /**
         * Protect content based on specific feature access
         * @param {string} selector - CSS selector for element(s) to protect
         * @param {string} email - Customer's email address
         * @param {string} feature - Required feature name
         * @param {Object} options - Optional configuration
         */
        protectByFeature: async function(selector, email, feature, options = {}) {
            const elements = document.querySelectorAll(selector);
            
            if (elements.length === 0) {
                console.warn(`BillingPaywall: No elements found for selector "${selector}"`);
                return;
            }

            try {
                const result = await this.checkFeatureAccess(email, feature);
                
                if (result.has_access) {
                    // User has access to feature - show content
                    elements.forEach(el => {
                        el.style.display = '';
                        el.classList.remove('paywall-locked');
                        el.classList.add('paywall-unlocked');
                    });

                    if (options.onUnlock) {
                        options.onUnlock(result);
                    }
                } else {
                    // No access - hide content
                    elements.forEach(el => {
                        if (options.hideContent !== false) {
                            el.style.display = 'none';
                        }
                        el.classList.add('paywall-locked');
                    });

                    if (options.onLock) {
                        options.onLock();
                    }
                }
            } catch (error) {
                console.error('BillingPaywall: Error protecting content by feature:', error);
                
                if (options.hideOnError !== false) {
                    elements.forEach(el => {
                        el.style.display = 'none';
                    });
                }
            }
        },

        /**
         * Show upgrade message overlay
         */
        showUpgradeMessage: function(element, options = {}) {
            const message = options.upgradeMessage || 'This content requires an active subscription.';
            const buttonText = options.upgradeButtonText || 'Upgrade Now';
            const upgradeUrl = options.upgradeUrl || '/pricing';

            const overlay = document.createElement('div');
            overlay.className = 'paywall-upgrade-overlay';
            overlay.innerHTML = `
                <div class="paywall-upgrade-message">
                    <div class="paywall-upgrade-icon">🔒</div>
                    <h3>${message}</h3>
                    <a href="${upgradeUrl}" class="paywall-upgrade-button">${buttonText}</a>
                </div>
            `;

            // Add basic styles if not already present
            if (!document.getElementById('paywall-styles')) {
                const style = document.createElement('style');
                style.id = 'paywall-styles';
                style.textContent = `
                    .paywall-upgrade-overlay {
                        position: relative;
                        background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95));
                        backdrop-filter: blur(10px);
                        border-radius: 8px;
                        padding: 40px 20px;
                        text-align: center;
                        margin: 20px 0;
                        border: 2px solid #e0e0e0;
                    }
                    .paywall-upgrade-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }
                    .paywall-upgrade-message h3 {
                        color: #333;
                        font-size: 20px;
                        margin-bottom: 20px;
                    }
                    .paywall-upgrade-button {
                        display: inline-block;
                        background: #007bff;
                        color: white;
                        padding: 12px 32px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: 600;
                        transition: background 0.2s;
                    }
                    .paywall-upgrade-button:hover {
                        background: #0056b3;
                    }
                `;
                document.head.appendChild(style);
            }

            element.parentNode.insertBefore(overlay, element);
        },

        /**
         * Store user email in localStorage for convenience
         */
        saveUserEmail: function(email) {
            localStorage.setItem('billing_user_email', email);
        },

        /**
         * Get stored user email
         */
        getUserEmail: function() {
            return localStorage.getItem('billing_user_email');
        },

        /**
         * Clear stored user email (on logout)
         */
        clearUserEmail: function() {
            localStorage.removeItem('billing_user_email');
        }
    };

    // Export to global scope
    window.BillingPaywall = BillingPaywall;

})();
