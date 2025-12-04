import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Store } from 'lucide-react';
import { Button } from '../components/showcase/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/showcase/Card';
import { MarketingHeader } from '../components/MarketingHeader';

export const PricingPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              One price. Everything included. No hidden fees.
            </p>
            <p className="text-muted-foreground">
              Cancel anytime. No long-term contracts.
            </p>
          </motion.div>

          {/* Single Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <Card className="border-2 border-primary shadow-2xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Per Store</CardTitle>
                <CardDescription className="text-lg">
                  Everything you need to manage your pawn shop inventory
                </CardDescription>
                <div className="mt-8">
                  <span className="text-6xl font-bold">$99</span>
                  <span className="text-2xl text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">per store location</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8 max-w-lg mx-auto">
                  {[
                    'Unlimited listings',
                    'AI item recognition',
                    'Facebook Marketplace integration',
                    'eBay integration',
                    'Your custom website',
                    'Desktop app',
                    'Mobile app',
                    'Advanced inventory management',
                    'Analytics dashboard',
                    'Email support',
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                >
                  Book a Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  question: 'How does per-store pricing work?',
                  answer: 'Each store location is $99/month. If you have multiple locations, you pay $99 for each one. Each store gets its own account with full access to all features.',
                },
                {
                  question: 'Is there a setup fee?',
                  answer: 'No, there are no setup fees or hidden costs. You only pay the $99 monthly subscription fee per store.',
                },
                {
                  question: 'Can I cancel anytime?',
                  answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.',
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards and debit cards. Payment is processed monthly.',
                },
                {
                  question: 'What if I have multiple store locations?',
                  answer: 'Each store location requires its own subscription at $99/month. You can manage all stores from one account dashboard.',
                },
                {
                  question: 'Do I get all features with this plan?',
                  answer: 'Yes! The $99/month plan includes everything: AI recognition, multi-platform posting, desktop app, mobile app, website, analytics, and all features. No feature limitations.',
                },
              ].map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Our team is here to help. Contact us and we'll get back to you within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg">
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Schedule a Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

