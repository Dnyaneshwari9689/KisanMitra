import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import {
  Sprout, Brain, MapPin, Users, Calculator, Truck, TrendingUp, Clock,
  Bell, ShieldCheck, BarChart3, ArrowRight, Tractor, Store, Check,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sprout size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900">KisanMitra</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#farmers" className="hover:text-emerald-600 transition-colors">For Farmers</a>
            <a href="#buyers" className="hover:text-emerald-600 transition-colors">For Buyers</a>
            <a href="#analytics" className="hover:text-emerald-600 transition-colors">Analytics</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #059669 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI-Powered Agricultural Market Intelligence
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Sell Smarter.<br /><span className="text-emerald-600">Earn Better.</span>
              </h1>
              <p className="text-base text-gray-600 mb-8 max-w-lg leading-relaxed">
                KisanMitra connects farmers with the right markets and buyers using data-driven price prediction, market intelligence and profit analysis.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register"><Button size="lg">Get Started <ArrowRight size={18} /></Button></Link>
                <Link to="/login"><Button variant="outline" size="lg">Explore Markets</Button></Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-xs text-gray-500">
                <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-600" /> Secure & Private</div>
                <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-600" /> No setup fees</div>
              </div>
            </div>

            {/* Visual flow */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Smart Selling Journey</p>
              <div className="space-y-3">
                {[
                  { icon: <Tractor size={18} />, label: 'Farmer adds produce', color: 'bg-emerald-100 text-emerald-700' },
                  { icon: <Brain size={18} />, label: 'AI predicts future price', color: 'bg-blue-100 text-blue-700' },
                  { icon: <BarChart3 size={18} />, label: 'Market comparison & scoring', color: 'bg-amber-100 text-amber-700' },
                  { icon: <Users size={18} />, label: 'Buyer matching', color: 'bg-purple-100 text-purple-700' },
                  { icon: <Truck size={18} />, label: 'Transport & profit calculation', color: 'bg-rose-100 text-rose-700' },
                  { icon: <Check size={18} />, label: 'Best selling recommendation', color: 'bg-emerald-100 text-emerald-700' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.color} flex-shrink-0`}>
                      {step.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{step.label}</span>
                    {i < 5 && <ArrowRight size={14} className="text-gray-300 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">From adding your crop to getting the best deal — KisanMitra guides you at every step</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Sprout size={24} />, title: 'Add Your Produce', desc: 'List your crop with quantity, quality grade, and minimum expected price.' },
              { icon: <Brain size={24} />, title: 'Get AI Prediction', desc: 'Our ML model predicts prices for 3, 7, and 15 days ahead with confidence scores.' },
              { icon: <MapPin size={24} />, title: 'Compare Markets', desc: 'TOPSIS-based scoring ranks markets by net return, not just headline price.' },
              { icon: <Users size={24} />, title: 'Connect with Buyers', desc: 'Smart matching finds buyers who need your crop, at your quality, near you.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-emerald-500 mb-1">STEP {i + 1}</div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Key Features</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">Everything you need to make informed selling decisions</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <TrendingUp size={22} />, title: 'Market Price Discovery', desc: 'Real-time mandi prices with min, max, modal, arrivals, and demand levels across markets.' },
              { icon: <Brain size={22} />, title: 'AI Price Prediction', desc: 'ML-based 3/7/15-day price forecasts with confidence indicators and sell recommendations.' },
              { icon: <MapPin size={22} />, title: 'Best Market Finder', desc: 'TOPSIS-weighted scoring compares markets by net return after transport, commission, and costs.' },
              { icon: <Users size={22} />, title: 'Buyer Matching', desc: 'Content-based recommendation matches your produce to verified buyers by crop, quality, and location.' },
              { icon: <Truck size={22} />, title: 'Transport Calculator', desc: 'Calculate distance, vehicle cost, and delivery time for any market or buyer location.' },
              { icon: <Calculator size={22} />, title: 'Profit Calculator', desc: 'Know your real profit per kg after transport, commission, storage, and all expenses.' },
              { icon: <Clock size={22} />, title: 'Best Time to Sell', desc: 'AI recommends whether to sell now, wait, or monitor based on predicted price trends.' },
              { icon: <Bell size={22} />, title: 'Price Alerts', desc: 'Set target price alerts for any crop and market. Get notified when your target is reached.' },
              { icon: <HandshakeIcon />, title: 'Offer & Negotiate', desc: 'Send offers to buyers, negotiate prices, and track deals from pending to completed.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-200 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Farmers */}
      <section id="farmers" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-4">
                <Tractor size={14} /> For Farmers
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Maximize Your Earnings</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Stop guessing where and when to sell. KisanMitra gives you data-backed answers: what price to expect, which market pays the most after costs, when to sell, and who to sell to.
              </p>
              <ul className="space-y-3">
                {[
                  'AI-predicted prices for the next 3, 7, and 15 days',
                  'Market comparison by net return, not just headline price',
                  'Buyer matching with match scores and verification status',
                  'Transport cost and profit calculation built in',
                  'Price alerts so you never miss a good deal',
                  'Offer and negotiate directly with buyers',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-8 inline-block">
                <Button size="lg">Start as Farmer <ArrowRight size={18} /></Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-8">
              <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">Tomato — 500 kg, Grade A</span>
                  <span className="text-xs font-medium text-emerald-600">Predicted ↑</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500">Today</p>
                    <p className="text-sm font-bold text-gray-900">₹25/kg</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50">
                    <p className="text-xs text-blue-500">3 days</p>
                    <p className="text-sm font-bold text-blue-700">₹27/kg</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <p className="text-xs text-emerald-500">7 days</p>
                    <p className="text-sm font-bold text-emerald-700">₹29/kg</p>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded-lg bg-emerald-50 text-center">
                  <p className="text-xs text-emerald-700 font-medium">Recommendation: Wait — prices rising</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-xs font-medium text-gray-500 mb-3">Best Market (Net Return)</p>
                <div className="space-y-2">
                  {[
                    { name: 'Nashik', net: '₹11,200', score: 92 },
                    { name: 'Pune', net: '₹10,450', score: 78 },
                    { name: 'Mumbai', net: '₹9,800', score: 65 },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">{m.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{m.net}</span>
                        <span className="text-xs font-medium text-emerald-600">{m.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Buyers */}
      <section id="buyers" className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-8">
              <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
                <p className="text-xs font-medium text-gray-500 mb-3">Matching Farmers for: Onion — 1000 kg</p>
                <div className="space-y-2">
                  {[
                    { name: 'Rajesh Patil', village: 'Niphad, Nashik', match: 94, price: '₹32/kg' },
                    { name: 'Sunita Deshmukh', village: 'Sinnar, Nashik', match: 88, price: '₹30/kg' },
                    { name: 'Amit Jadhav', village: 'Kalwan, Nashik', match: 82, price: '₹31/kg' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-500">{f.village}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{f.price}</p>
                        <p className="text-xs font-medium text-emerald-600">{f.match}% match</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
                <Store size={14} /> For Buyers
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Find Quality Produce</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Post your requirements and let KisanMitra match you with farmers who have exactly what you need. Compare offers, negotiate prices, and close deals — all in one place.
              </p>
              <ul className="space-y-3">
                {[
                  'Post crop requirements with quantity, quality, and price',
                  'Automatic matching with nearby farmers',
                  'Receive and negotiate offers from farmers',
                  'Track transactions and build supplier relationships',
                  'Verified buyer profile builds trust with farmers',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-8 inline-block">
                <Button size="lg" variant="secondary">Start as Buyer <ArrowRight size={18} /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI & Analytics */}
      <section id="analytics" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-4">
              <Brain size={14} /> AI & Analytics
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Data-Driven Decision Support</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">Not just a price listing — an intelligent market decision-support platform</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain size={22} />, title: 'ML Price Prediction', desc: 'XGBoost/Random Forest-ready architecture. Currently uses mock predictions with seasonal trends, demand, and supply factors.' },
              { icon: <BarChart3 size={22} />, title: 'Market Analytics', desc: 'Top markets by price and demand, price volatility, arrival trends, and market clustering analysis.' },
              { icon: <MapPin size={22} />, title: 'TOPSIS Market Scoring', desc: 'Transparent weighted scoring: net revenue (40%), demand (20%), distance (20%), price trend (20%).' },
              { icon: <TrendingUp size={22} />, title: 'Historical Trends', desc: '30 days of price history per crop per market with interactive charts and trend lines.' },
              { icon: <ShieldCheck size={22} />, title: 'Feedback Loop', desc: 'Actual vs predicted prices are recorded after each sale to improve future ML model accuracy.' },
              { icon: <Clock size={22} />, title: 'Best Time to Sell', desc: 'Clear recommendations: Sell Now, Wait, or Monitor — with reasoning based on predicted trends.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / CTA */}
      <section className="py-16 lg:py-20 bg-emerald-700">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Sell Smarter?</h2>
          <p className="text-emerald-100 text-sm mb-8 max-w-xl mx-auto">
            Join KisanMitra today and make data-driven decisions about where, when, and to whom to sell your produce.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register"><Button size="lg" variant="secondary">Get Started Free</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">Sign In</Button></Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">About KisanMitra</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            KisanMitra is a smart agricultural market linkage and price discovery platform built to answer the five key questions every farmer faces: <span className="font-medium text-gray-900">What</span> price can I expect? <span className="font-medium text-gray-900">Where</span> should I sell? <span className="font-medium text-gray-900">When</span> should I sell? <span className="font-medium text-gray-900">Who</span> should I sell to? <span className="font-medium text-gray-900">How much</span> profit can I expect after logistics and other costs?
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-4">
            Built with a modern React + TypeScript + Tailwind CSS frontend, Supabase backend with PostgreSQL and Row Level Security, and a modular ML service layer ready for XGBoost/Random Forest integration.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Sprout size={18} />
                </div>
                <span className="text-lg font-bold text-white">KisanMitra</span>
              </div>
              <p className="text-xs leading-relaxed">Smart Agricultural Market Linkage & Price Discovery Platform</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#how-it-works" className="hover:text-emerald-400">How It Works</a></li>
                <li><a href="#features" className="hover:text-emerald-400">Features</a></li>
                <li><a href="#analytics" className="hover:text-emerald-400">AI & Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-3">For Users</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/register" className="hover:text-emerald-400">For Farmers</Link></li>
                <li><Link to="/register" className="hover:text-emerald-400">For Buyers</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-xs">
                <li>support@agrilink.in</li>
                <li>+91 98765 43210</li>
                <li>Nashik, Maharashtra</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-center">
            <p>KisanMitra — Built for Smart India Hackathon. Demo predictions use mock data. Not real-time market data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HandshakeIcon() {
  return <span className="text-lg">🤝</span>;
}
