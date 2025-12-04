import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Globe, Search, CheckCircle2, ArrowLeft, Sparkles, Save, Trash2, X, Image as ImageIcon, Send, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { AIDataDisplay } from './AIDataDisplay';
import { clsx } from 'clsx';

type Platform = 'desktop' | 'mobile' | 'website';

const mockInventoryItems = [
  {
    id: '1',
    title: 'iPhone 13 Pro',
    price: 649.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
    ],
    platforms: ['facebook', 'ebay', 'website'],
    status: 'posted',
    condition: 'like_new',
    description: 'Apple iPhone 13 Pro in excellent condition. 128GB storage, unlocked, includes original box and charger. Minor wear on screen protector.',
    aiData: {
      recognizedItem: 'iPhone 13 Pro',
      confidence: 0.95,
      description: 'Apple iPhone 13 Pro in excellent condition. 128GB storage, unlocked, includes original box and charger.',
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
    },
  },
  {
    id: '2',
    title: 'Vintage Rolex Watch',
    price: 2499.99,
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'],
    platforms: ['facebook', 'website'],
    status: 'posted',
    condition: 'used',
    description: 'Classic timepiece in excellent condition, perfect for collectors.',
  },
  {
    id: '3',
    title: 'MacBook Pro 16"',
    price: 1899.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200',
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200'],
    platforms: ['ebay', 'website'],
    status: 'posting',
    condition: 'used',
    description: 'Powerful laptop for professionals. M1 Pro chip, 16GB RAM, 512GB SSD.',
  },
];

export const PlatformPreview: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<Platform>('desktop');
  const [selectedItem, setSelectedItem] = useState(mockInventoryItems[0]);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [mobileSelectedItem, setMobileSelectedItem] = useState(mockInventoryItems[0]);
  const [websiteView, setWebsiteView] = useState<'list' | 'detail'>('list');
  const [websiteSelectedItem, setWebsiteSelectedItem] = useState(mockInventoryItems[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleMobileItemClick = (item: typeof mockInventoryItems[0]) => {
    setMobileSelectedItem(item);
    setMobileView('detail');
  };

  const selectedItemWithAI = selectedItem.aiData ? selectedItem : { ...selectedItem, aiData: mockInventoryItems[0].aiData };

  return (
    <div className="w-full">
      {/* Platform Selector */}
      <div className="flex justify-center gap-4 mb-8">
        {[
          { id: 'desktop' as Platform, icon: Monitor, label: 'Desktop App' },
          { id: 'mobile' as Platform, icon: Smartphone, label: 'Mobile App' },
          { id: 'website' as Platform, icon: Globe, label: 'Your Website' },
        ].map((platform) => {
          const Icon = platform.icon;
          return (
            <button
              key={platform.id}
              onClick={() => {
                setActivePlatform(platform.id);
                if (platform.id === 'mobile') setMobileView('list');
                if (platform.id === 'website') setWebsiteView('list');
              }}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                activePlatform === platform.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Icon className="h-5 w-5" />
              {platform.label}
            </button>
          );
        })}
      </div>

      {/* Desktop App Preview */}
      {activePlatform === 'desktop' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="overflow-hidden border-2 shadow-2xl">
            {/* Window Chrome */}
            <div className="bg-muted/50 p-3 border-b border-border flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-xs text-muted-foreground">Llatria Desktop</div>
            </div>

            <div className="flex h-[700px] bg-background">
              {/* Left Sidebar */}
              <div className="w-80 border-r border-border bg-card flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search inventory..."
                      className="pl-10"
                      value=""
                      onChange={() => {}}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</span>
                      <div className="flex gap-1">
                        <Button variant="primary" size="sm" className="flex-1 text-xs">All</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">Active</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">Sold</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {mockInventoryItems.map((item) => (
                    <Card
                      key={item.id}
                      className={clsx(
                        'cursor-pointer transition-all hover:shadow-md',
                        selectedItem.id === item.id && 'ring-2 ring-primary'
                      )}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="p-3">
                        <div className="flex gap-3">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate mb-1">{item.title}</h3>
                            <span className="text-base font-bold">${item.price.toFixed(2)}</span>
                            <div className="flex items-center gap-1 mt-1">
                              {item.platforms.map((p) => (
                                <span key={p} className="text-xs">
                                  {p === 'facebook' ? '📘' : p === 'ebay' ? '🛒' : '🌐'}
                                </span>
                              ))}
                            </div>
                            <div className="mt-1">
                              {item.status === 'posted' ? (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-bold">
                                  POSTED
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-bold">
                                  POSTING
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Side - Full Item Details */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border sticky top-0 bg-background z-10">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">Edit Listing</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Photos Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Photos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        {selectedItem.images?.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                              <img
                                src={image}
                                alt={`${selectedItem.title} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                        {(!selectedItem.images || selectedItem.images.length < 10) && (
                          <button className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors bg-muted/50">
                            <div className="text-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                              <span className="text-xs text-muted-foreground">Add Photo</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Analysis Section */}
                  {selectedItemWithAI.aiData && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <CardTitle>AI Generated Data</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <AIDataDisplay aiData={selectedItemWithAI.aiData} isProcessing={false} />
                        <p className="text-xs text-muted-foreground mt-4">
                          Use the AI data below as a starting point. Edit each platform's listing individually.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Base Listing Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Generated Listing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Title" value={selectedItem.title} onChange={() => {}} />
                        <Input label="Price" type="number" value={selectedItem.price.toString()} onChange={() => {}} step="0.01" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Description</label>
                        <textarea
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          rows={6}
                          defaultValue={selectedItem.description}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-foreground">Condition</label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="new">New</option>
                            <option value="like_new" selected={selectedItem.condition === 'like_new'}>Like New</option>
                            <option value="used" selected={selectedItem.condition === 'used'}>Used</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        </div>
                        <Input label="Category" value={selectedItem.category} onChange={() => {}} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Facebook Marketplace Section */}
                  <Card>
                    <CardHeader className="bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📘</span>
                          <CardTitle className="text-foreground flex items-center">
                            Facebook Marketplace
                            <span className="w-2 h-2 rounded-full bg-green-500 ml-2" />
                          </CardTitle>
                        </div>
                        <Button variant={selectedItem.platforms.includes('facebook') ? 'outline' : 'primary'} size="sm">
                          {selectedItem.platforms.includes('facebook') ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Remove
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Post
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input label="Title" value={selectedItem.title} onChange={() => {}} />
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Description</label>
                        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={4} defaultValue={selectedItem.description} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Price" type="number" value={selectedItem.price.toString()} onChange={() => {}} step="0.01" />
                        <Input label="Location (City, State or ZIP)" placeholder="e.g., New York, NY" onChange={() => {}} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* eBay Section */}
                  <Card>
                    <CardHeader className="bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🛒</span>
                          <CardTitle className="text-foreground flex items-center">
                            eBay Listing
                            <span className="w-2 h-2 rounded-full bg-green-500 ml-2" />
                          </CardTitle>
                        </div>
                        <Button variant={selectedItem.platforms.includes('ebay') ? 'outline' : 'primary'} size="sm">
                          {selectedItem.platforms.includes('ebay') ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Remove
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Post
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input label="Title" value={selectedItem.title} onChange={() => {}} />
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Description</label>
                        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={6} defaultValue={selectedItem.description} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Price" type="number" value={selectedItem.price.toString()} onChange={() => {}} step="0.01" />
                        <Input label="Shipping Cost" type="number" value="0" onChange={() => {}} step="0.01" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-foreground">Shipping Method</label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option>Standard Shipping</option>
                            <option>Expedited Shipping</option>
                            <option>Overnight Shipping</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-foreground">Return Policy (Days)</label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option>No Returns</option>
                            <option>14 Days</option>
                            <option selected>30 Days</option>
                            <option>60 Days</option>
                          </select>
                        </div>
                      </div>
                      {selectedItemWithAI.aiData?.specifications && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">Item Specifics</label>
                          <div className="space-y-2">
                            {Object.entries(selectedItemWithAI.aiData.specifications).map(([key, value]) => (
                              <div key={key} className="grid grid-cols-2 gap-2">
                                <Input label={key} value={value as string} onChange={() => {}} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Website Section */}
                  <Card>
                    <CardHeader className="bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🌐</span>
                          <CardTitle className="text-foreground flex items-center">
                            Your Website
                            <span className="w-2 h-2 rounded-full bg-green-500 ml-2" />
                          </CardTitle>
                        </div>
                        <Button variant={selectedItem.platforms.includes('website') ? 'outline' : 'primary'} size="sm">
                          {selectedItem.platforms.includes('website') ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Remove
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Post
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input label="Title" value={selectedItem.title} onChange={() => {}} />
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Description</label>
                        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={4} defaultValue={selectedItem.description} />
                      </div>
                      <Input label="Price" type="number" value={selectedItem.price.toString()} onChange={() => {}} step="0.01" />
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">SEO Title (for search engines)</label>
                        <Input value={selectedItem.title} placeholder="Optimized title for search engines" onChange={() => {}} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                          SEO Description (for search engines)
                        </label>
                        <textarea
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          rows={3}
                          placeholder="Meta description (150-160 characters recommended)"
                          defaultValue={selectedItem.description.substring(0, 160)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{selectedItem.description.length}/160 characters</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Mobile App Preview */}
      {activePlatform === 'mobile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-sm">
            <Card className="overflow-hidden border-2 shadow-2xl">
              {/* Phone Frame */}
              <div className="bg-background rounded-t-[2rem] p-2">
                <div className="bg-muted rounded-[1.5rem] overflow-hidden aspect-[9/19] relative">
                  {/* Mobile App Content */}
                  <div className="h-full flex flex-col bg-background overflow-hidden">
                    {mobileView === 'list' ? (
                      <>
                        {/* Header */}
                        <div className="p-6 pt-12 border-b border-border">
                          <h1 className="text-3xl font-bold mb-1">Inventory</h1>
                          <p className="text-sm text-muted-foreground">{mockInventoryItems.length} items</p>
                        </div>

                        {/* Inventory List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {mockInventoryItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleMobileItemClick(item)}
                              className="flex gap-3 p-3 bg-card rounded-xl border border-border cursor-pointer hover:shadow-md transition-all active:scale-95"
                            >
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base mb-1 truncate">{item.title}</h3>
                                <p className="text-lg font-bold mb-1">${item.price.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-1">
                                    {item.platforms.map((p) => (
                                      <span key={p} className="text-sm">
                                        {p === 'facebook' ? '📘' : p === 'ebay' ? '🛒' : '🌐'}
                                      </span>
                                    ))}
                                  </div>
                                  {item.status === 'posted' ? (
                                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-bold">
                                      POSTED
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-bold">
                                      POSTING
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Tab Bar */}
                        <div className="border-t border-border p-4 bg-card">
                          <div className="flex justify-around">
                            {['Inventory', 'Camera', 'Settings'].map((tab, idx) => (
                              <div
                                key={tab}
                                className={clsx(
                                  'flex flex-col items-center gap-1',
                                  idx === 0 && 'text-primary'
                                )}
                              >
                                <div className="w-6 h-6 rounded bg-muted" />
                                <span className="text-xs">{tab}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Mobile Detail View */
                      <div className="flex-1 overflow-y-auto">
                        {/* Header with Back Button */}
                        <div className="p-4 pt-12 border-b border-border bg-card sticky top-0 z-10">
                          <button
                            onClick={() => setMobileView('list')}
                            className="flex items-center gap-2 text-primary mb-4"
                          >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back</span>
                          </button>
                          <h2 className="text-2xl font-bold mb-2">Edit Listing</h2>
                        </div>

                        {/* Detail Content */}
                        <div className="p-4 space-y-4">
                          {/* Photos */}
                          <div>
                            <h3 className="font-semibold mb-3">Photos</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {mobileSelectedItem.images?.map((image, index) => (
                                <div key={index} className="relative flex-shrink-0">
                                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted">
                                    <img src={image} alt={`${mobileSelectedItem.title} ${index + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                  {index === 0 && (
                                    <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                                      Primary
                                    </div>
                                  )}
                                </div>
                              ))}
                              <button className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-muted-foreground">+ Add</span>
                              </button>
                            </div>
                          </div>

                          {/* AI Data */}
                          {mobileSelectedItem.aiData && (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">AI Generated Data</h3>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Recognized:</span>
                                  <span className="font-medium">{mobileSelectedItem.aiData.recognizedItem}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Confidence:</span>
                                  <span className="font-medium">{Math.round(mobileSelectedItem.aiData.confidence * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Market Price:</span>
                                  <span className="font-medium">${mobileSelectedItem.aiData.marketPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Suggested:</span>
                                  <span className="font-medium text-primary">${mobileSelectedItem.aiData.suggestedPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Listing Info */}
                          <div>
                            <h3 className="font-semibold mb-3">Listing Information</h3>
                            <div className="space-y-3">
                              <Input label="Title" value={mobileSelectedItem.title} onChange={() => {}} />
                              <div className="grid grid-cols-2 gap-3">
                                <Input label="Price" type="number" value={mobileSelectedItem.price.toString()} onChange={() => {}} />
                                <Input label="Category" value={mobileSelectedItem.category} onChange={() => {}} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1.5">Description</label>
                                <textarea
                                  className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  defaultValue={mobileSelectedItem.description}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Platform Sections */}
                          <div className="space-y-4">
                            {['facebook', 'ebay', 'website'].map((platform) => {
                              const isActive = mobileSelectedItem.platforms.includes(platform as any);
                              return (
                                <div key={platform} className="border border-border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xl">
                                        {platform === 'facebook' ? '📘' : platform === 'ebay' ? '🛒' : '🌐'}
                                      </span>
                                      <span className="font-semibold capitalize">{platform === 'facebook' ? 'Facebook' : platform === 'ebay' ? 'eBay' : 'Website'}</span>
                                      {isActive && <CheckCircle2 className="h-4 w-4 text-green-600 ml-2" />}
                                    </div>
                                    <button className={clsx(
                                      'px-3 py-1.5 rounded text-xs font-medium',
                                      isActive
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-primary text-primary-foreground'
                                    )}>
                                      {isActive ? 'Remove' : 'Post'}
                                    </button>
                                  </div>
                                  {isActive && (
                                    <div className="space-y-2 text-xs text-muted-foreground">
                                      <Input label="Title" value={mobileSelectedItem.title} onChange={() => {}} />
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Description</label>
                                        <textarea className="w-full h-20 rounded-md border border-input bg-background px-2 py-1.5 text-xs" defaultValue={mobileSelectedItem.description} />
                                      </div>
                                      <Input label="Price" type="number" value={mobileSelectedItem.price.toString()} onChange={() => {}} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t border-border">
                            <Button className="flex-1" size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Website Preview */}
      {activePlatform === 'website' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="overflow-hidden border-2 shadow-2xl">
            {/* Browser Chrome */}
            <div className="bg-muted/50 p-3 border-b border-border flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 bg-background rounded px-3 py-1 text-xs text-muted-foreground text-center">
                myshop.llatria.com
              </div>
            </div>

            {/* Website Content */}
            <div className="bg-background min-h-[600px] max-h-[700px] overflow-y-auto">
              {websiteView === 'list' ? (
                <>
                  {/* Header */}
                  <div className="border-b border-border p-6 sticky top-0 bg-background z-10">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <h1 className="text-2xl font-bold">My Pawn Shop</h1>
                      <Button variant="outline" size="sm">View All</Button>
                    </div>
                  </div>

                  {/* Product Grid */}
                  <div className="p-6">
                    <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {mockInventoryItems.map((item) => (
                          <Card
                            key={item.id}
                            onClick={() => {
                              setWebsiteSelectedItem(item);
                              setWebsiteView('detail');
                              setSelectedImageIndex(0);
                            }}
                            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer active:scale-95"
                          >
                            <div className="aspect-square overflow-hidden bg-muted">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                              <p className="text-2xl font-bold mb-2">${item.price.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Product Detail Page */
                <div className="max-w-7xl mx-auto px-6 py-8">
                  {/* Back Button */}
                  <button
                    onClick={() => setWebsiteView('list')}
                    className="flex items-center gap-2 text-primary hover:underline mb-6"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Products</span>
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div>
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 border border-border">
                        <img
                          src={websiteSelectedItem.images?.[selectedImageIndex] || websiteSelectedItem.image}
                          alt={websiteSelectedItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {websiteSelectedItem.images && websiteSelectedItem.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {websiteSelectedItem.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={clsx(
                                'aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all',
                                selectedImageIndex === index
                                  ? 'border-primary'
                                  : 'border-transparent hover:border-border'
                              )}
                            >
                              <img
                                src={image}
                                alt={`${websiteSelectedItem.title} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div>
                      <h1 className="text-4xl font-bold mb-4">{websiteSelectedItem.title}</h1>
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-4xl font-bold">${websiteSelectedItem.price.toFixed(2)}</span>
                        <span className="px-3 py-1 bg-muted rounded-full text-sm capitalize">
                          {websiteSelectedItem.condition.replace('_', ' ')}
                        </span>
                        <span className="px-3 py-1 bg-muted rounded-full text-sm">{websiteSelectedItem.category}</span>
                      </div>

                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Description</h2>
                        <p className="text-muted-foreground leading-relaxed">{websiteSelectedItem.description}</p>
                      </div>

                      {/* AI Data Specifications */}
                      {websiteSelectedItem.aiData?.specifications && (
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold mb-3">Specifications</h2>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(websiteSelectedItem.aiData.specifications).map(([key, value]) => (
                              <div key={key} className="border-b border-border pb-2">
                                <span className="text-sm text-muted-foreground">{key}:</span>
                                <span className="ml-2 font-medium">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Buy Buttons */}
                      <div className="space-y-3">
                        {websiteSelectedItem.platforms.includes('facebook') && (
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
                          >
                            Buy on Facebook Marketplace
                          </a>
                        )}
                        {websiteSelectedItem.platforms.includes('ebay') && (
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
                          >
                            Buy on eBay
                          </a>
                        )}
                        {websiteSelectedItem.platforms.includes('website') && (
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
                          >
                            Buy on eBay
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
