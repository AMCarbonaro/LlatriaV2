import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Sparkles,
  Camera,
  Share2,
  Smartphone,
  Monitor,
  Globe,
  ArrowRight,
  Brain,
  Shield,
  CheckCircle2,
  BarChart3,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../components/showcase/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/showcase/Card';
import { AIDataDisplay } from '../components/showcase/AIDataDisplay';
import { MarketingHeader } from '../components/MarketingHeader';
import { InventoryItemShowcase } from '../components/showcase/InventoryItemShowcase';
import { PlatformPreview } from '../components/showcase/PlatformPreview';

export const HomePage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

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

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });

  const workflowRef = useRef<HTMLDivElement>(null);
  const workflowInView = useInView(workflowRef, { once: true, margin: '-100px' });

  const handleImageUpload = async (images: string[]) => {
    if (images.length > 0 && !aiData && !isProcessingAI) {
      setIsProcessingAI(true);
      // Simulate AI processing
      setTimeout(() => {
        setAiData({
          recognizedItem: 'iPhone 13 Pro',
          confidence: 0.95,
          description: 'Apple iPhone 13 Pro in excellent condition. 128GB storage, unlocked, includes original box and charger. Minor wear on screen protector.',
          suggestedPrice: 649.99,
          marketPrice: 699.99,
          condition: 'like_new',
          category: 'Electronics',
          specifications: {
            'Storage': '128GB',
            'Color': 'Sierra Blue',
            'Condition': 'Like New',
            'Unlocked': 'Yes',
          },
          similarItems: [
            { title: 'iPhone 13 Pro 128GB', price: 675.00, platform: 'eBay' },
            { title: 'iPhone 13 Pro - Like New', price: 650.00, platform: 'Facebook' },
          ],
        });
        setIsProcessingAI(false);
        if (workflowStep === 1) {
          setWorkflowStep(2);
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <MarketingHeader darkMode={darkMode} toggleTheme={toggleTheme} />
      
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ y, opacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5">
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3), transparent 50%)',
              backgroundSize: '200% 200%',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Pawn Shop Management</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                List Items in Seconds,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Not Hours
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Upload a photo. AI recognizes the item, suggests a price, and generates a listing.
              Post to Facebook Marketplace, eBay, and your website—all from one place.
            </p>

            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Llatria automates your entire inventory workflow, saving you hours every day.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button size="lg" className="group">
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                See How It Works
              </Button>
            </motion.div>

            <motion.div
              className="mt-16 flex justify-center gap-8 opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <Monitor className="h-8 w-8" />
                <span className="text-xs">Desktop App</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <Smartphone className="h-8 w-8" />
                <span className="text-xs">Mobile App</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
                className="flex flex-col items-center gap-2"
              >
                <Globe className="h-8 w-8" />
                <span className="text-xs">Your Website</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowRight className="h-6 w-6 rotate-90 text-muted-foreground" />
        </motion.div>
      </motion.section>

      {/* What is Llatria Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Content - Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">The Complete Solution</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Built for
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Pawn Shops
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Llatria is the all-in-one platform that transforms how pawn shops manage inventory.
                From photo to listing in seconds, powered by AI that understands your business.
              </p>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { number: '90%', label: 'Time Saved' },
                  { number: '3x', label: 'Faster Listings' },
                  { number: '24/7', label: 'AI Powered' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg">
                  See It In Action
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            {/* Right Side - Visual Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* App Mockup Container */}
              <div className="relative">
                {/* Desktop App Preview */}
                <Card className="overflow-hidden shadow-2xl border-2">
                  <div className="bg-muted/50 p-4 border-b border-border">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="p-6 bg-background">
                    <div className="space-y-4">
                      {/* Mock Inventory Item */}
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Camera className="h-10 w-10 text-primary/50" />
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                          <div className="flex gap-2">
                            <div className="h-6 bg-green-100 dark:bg-green-900 rounded px-2 w-20" />
                            <div className="h-6 bg-muted rounded w-16" />
                          </div>
                        </div>
                      </div>
                      {/* AI Badge */}
                      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <Brain className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="h-3 bg-primary/20 rounded w-32 mb-1" />
                          <div className="h-2 bg-primary/10 rounded w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg p-4 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Posted to 3 platforms</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -left-6 bg-card border border-border rounded-lg p-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Suggested Price</div>
                      <div className="text-lg font-bold">$649.99</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Camera,
                title: 'AI Recognition',
                description: 'Upload a photo, get instant item recognition and pricing',
                gradient: 'from-blue-500/20 to-blue-600/10',
                iconColor: 'text-blue-600',
              },
              {
                icon: Share2,
                title: 'Multi-Platform',
                description: 'Post to Facebook, eBay, and your website simultaneously',
                gradient: 'from-green-500/20 to-green-600/10',
                iconColor: 'text-green-600',
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                description: 'Track performance and optimize your inventory strategy',
                gradient: 'from-purple-500/20 to-purple-600/10',
                iconColor: 'text-purple-600',
              },
              {
                icon: Shield,
                title: 'Secure',
                description: 'Enterprise-grade security for your business data',
                gradient: 'from-orange-500/20 to-orange-600/10',
                iconColor: 'text-orange-600',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                        <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Interactive Workflow */}
      <section id="how-it-works" ref={workflowRef} className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={workflowInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See the actual workflow using real components from Llatria
            </p>
          </motion.div>

          {/* Workflow Steps */}
          <div className="mb-12 flex justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => setWorkflowStep(step)}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all
                  ${workflowStep === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                Step {step}
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            {workflowStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <CardTitle>Step 1: Take a Photo</CardTitle>
                    </div>
                    <CardDescription>
                      Use the Llatria mobile app to take a photo of your inventory item. Point, shoot, and you're done.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Mobile App Mockup */}
                      <div className="mx-auto max-w-xs">
                        <div className="bg-background border-2 border-border rounded-[2rem] p-2 shadow-2xl">
                          <div className="bg-muted rounded-[1.5rem] overflow-hidden aspect-[9/19] relative">
                            {/* Camera View */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <div className="text-center">
                                <Camera className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                                <div className="w-32 h-32 mx-auto border-4 border-primary/30 border-dashed rounded-lg flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="w-20 h-20 bg-primary/20 rounded-lg mb-2 mx-auto flex items-center justify-center">
                                      <ImageIcon className="h-10 w-10 text-primary/50" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Item Photo</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Camera Button */}
                            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                              <div className="w-16 h-16 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center">
                                <Camera className="h-8 w-8 text-primary" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Open the Llatria app on your phone and snap a photo of any item
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {workflowStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <CardTitle>Step 2: AI Recognizes & Creates Data</CardTitle>
                    </div>
                    <CardDescription>
                      Our AI instantly recognizes the item, extracts all details, suggests pricing, and generates complete listing data automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIDataDisplay aiData={aiData} isProcessing={isProcessingAI} />
                    {!aiData && !isProcessingAI && (
                      <div className="mt-4 text-center">
                        <Button onClick={() => {
                          handleImageUpload(['mock']);
                        }}>
                          Simulate AI Processing
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {aiData && (
                      <div className="mt-4">
                        <Button onClick={() => setWorkflowStep(3)}>
                          Continue to Post
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {workflowStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="h-5 w-5 text-primary" />
                      <CardTitle>Step 3: Press Post</CardTitle>
                    </div>
                    <CardDescription>
                      Review the AI-generated listing and press post. Your item goes live on Facebook Marketplace, eBay, and your website instantly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Post Button Preview */}
                      <div className="flex justify-center">
                        <Button size="lg" className="group">
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Post to All Platforms
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>

                      {/* Platform Status */}
                      <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                          { name: 'Facebook', icon: '📘', status: 'Ready' },
                          { name: 'eBay', icon: '🛒', status: 'Ready' },
                          { name: 'Website', icon: '🌐', status: 'Ready' },
                        ].map((platform, index) => (
                          <Card key={index} className="text-center">
                            <CardContent className="p-4">
                              <div className="text-3xl mb-2">{platform.icon}</div>
                              <div className="font-medium mb-1">{platform.name}</div>
                              <div className="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                {platform.status}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Success Message */}
                      <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">That's it! Your listing is live.</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Manage and track your listing from the desktop app or mobile app
                        </p>
                      </div>

                      {/* Inventory Item Preview */}
                      <div className="mt-8">
                        <InventoryItemShowcase />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - Complete Platform */}
      <section ref={featuresRef} className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-muted/30" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">The Complete Platform</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
              Three powerful apps working together. Desktop for management, mobile for capturing,
              and your own website for sales. All synchronized in real-time.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the actual platform below. Switch between views to see how it all works together.
            </p>
          </motion.div>

          {/* Platform Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <PlatformPreview />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Pawn Shop?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join pawn shops already using Llatria to streamline their operations and save hours every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                window.location.href = '/pricing';
              }}>
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Llatria</h3>
              <p className="text-muted-foreground">
                Modern inventory management for pawn shops
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/store" className="hover:text-foreground transition-colors">Store Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2024 Llatria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
