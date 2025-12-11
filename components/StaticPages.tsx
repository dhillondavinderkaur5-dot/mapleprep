
import React, { useState } from 'react';
import { Check, MapPin, FileText, CheckCircle, Clock, Globe, Shield, BookOpen, Users, Download, Star, Sparkles, Crown, Tag, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: "Province-Specific Curriculum",
      desc: "Our AI is trained on official curriculum documents from Ontario, BC, Alberta, and other provinces. Select your grade and subject, and get content that hits specific learning expectations.",
      icon: <MapPin className="w-6 h-6 text-white" />,
      color: "bg-red-500"
    },
    {
      title: "Instant Worksheet Generation",
      desc: "Don't just get slides. Get a matching Markdown-formatted worksheet for your students to fill out during the lesson. Printable and editable.",
      icon: <FileText className="w-6 h-6 text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "Interactive Class Quizzes",
      desc: "Generate a 15-25 question multiple-choice quiz automatically. Use it as an exit ticket or a lively class game to check for understanding.",
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      color: "bg-green-500"
    },
    {
      title: "Drag & Drop Builder",
      desc: "Customize your slides with our intuitive builder. Add stickers, educational charts, YouTube videos, and your own images in seconds.",
      icon: <Globe className="w-6 h-6 text-white" />,
      color: "bg-purple-500"
    },
    {
      title: "Smart History & Reuse",
      desc: "Every lesson you generate is saved to your local history. Reuse last year's 'Grade 4 Rocks & Minerals' lesson without starting from scratch.",
      icon: <Clock className="w-6 h-6 text-white" />,
      color: "bg-amber-500"
    },
    {
      title: "Kid-Friendly Content",
      desc: "The AI is tuned for elementary audiences. It uses age-appropriate vocabulary, relatable Canadian examples, and engaging explanations.",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-base font-bold text-red-600 tracking-wide uppercase">Powerful Tools</h2>
        <p className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Everything you need to run your classroom.
        </p>
        <p className="mt-4 text-xl text-slate-500">
          MaplePrep goes beyond generic AI. We've built a suite of tools specifically designed for the daily workflow of Canadian elementary teachers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md ${f.color}`}>
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
            <p className="text-slate-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResourcesPage: React.FC = () => {
  const [activeResource, setActiveResource] = useState<string | null>(null);

  const RESOURCES = [
    {
      id: 'guides',
      category: "Curriculum Guides",
      desc: "Deep dives into provincial standards.",
      items: [
        { title: "Ontario Math 2020 Breakdown", type: "PDF Guide", size: "2.4 MB" },
        { title: "BC New Curriculum Overview", type: "PDF Guide", size: "1.8 MB" },
        { title: "Alberta K-6 Curriculum Maps", type: "PDF Guide", size: "3.1 MB" },
        { title: "Quebec Progression of Learning", type: "PDF Guide", size: "2.2 MB" }
      ]
    },
    {
      id: 'management',
      category: "Classroom Management",
      desc: "Tools to keep your class running smoothly.",
      items: [
        { title: "Printable Exit Tickets", type: "Template", size: "0.5 MB" },
        { title: "Morning Meeting Slides", type: "PPTX", size: "5.4 MB" },
        { title: "Report Card Comment Bank", type: "Excel", size: "1.2 MB" },
        { title: "Behavior Tracking Sheet", type: "PDF", size: "0.3 MB" }
      ]
    },
    {
      id: 'ai',
      category: "AI in Education",
      desc: "Learn how to use AI ethically and effectively.",
      items: [
        { title: "Prompt Engineering for Teachers", type: "Video Course", size: "15 mins" },
        { title: "Ethical AI Use in Classrooms", type: "Article", size: "5 min read" },
        { title: "Generating Differentiated Material", type: "Guide", size: "1.1 MB" }
      ]
    }
  ];

  const activeData = RESOURCES.find(r => r.id === activeResource);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn min-h-[80vh]">
      <div className="bg-slate-900 rounded-3xl p-12 text-white text-center mb-12 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Teacher Resource Hub</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Tips, tricks, and guides to help you get the most out of MaplePrep and improve your teaching practice.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span className="font-medium text-sm">New guides added weekly</span>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/3 space-y-4">
          {RESOURCES.map((res) => (
            <button 
              key={res.id}
              onClick={() => setActiveResource(res.id)}
              className={`w-full text-left p-6 rounded-xl border transition-all duration-200 group relative overflow-hidden ${activeResource === res.id ? 'bg-white border-red-500 shadow-md ring-1 ring-red-500' : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-sm'}`}
            >
              <div className="relative z-10">
                <h3 className={`font-bold text-lg mb-1 ${activeResource === res.id ? 'text-red-700' : 'text-slate-800'}`}>{res.category}</h3>
                <p className="text-sm text-slate-500">{res.desc}</p>
              </div>
              {activeResource === res.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500"></div>}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full md:w-2/3">
          {activeData ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fadeIn">
               <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                 <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                   <Download className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-slate-900">{activeData.category}</h3>
                   <p className="text-slate-500 text-sm">Access your materials below</p>
                 </div>
               </div>
               
               <div className="space-y-3">
                 {activeData.items.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group cursor-pointer border border-transparent hover:border-slate-200">
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                        <div>
                          <div className="font-bold text-slate-800">{item.title}</div>
                          <div className="text-xs text-slate-500">{item.type} • {item.size}</div>
                        </div>
                      </div>
                      <button className="text-sm font-bold text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        Download
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
               <BookOpen className="w-12 h-12 mb-4 opacity-50" />
               <p className="font-medium">Select a category to view resources</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PricingPageProps {
  onGetStarted: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const basePrice = billingCycle === 'monthly' ? 89 : 890;
  const finalPrice = basePrice - discount;

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'TEACH20') {
      setDiscount(20);
      setPromoMessage('Coupon applied! $20.00 off.');
      setPromoStatus('success');
    } else if (code === 'MAPLE10') {
      setDiscount(10);
      setPromoMessage('Coupon applied! $10.00 off.');
      setPromoStatus('success');
    } else {
      setDiscount(0);
      setPromoMessage('Invalid promo code.');
      setPromoStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Pricing Simplified</h2>
        <p className="text-xl text-slate-600 mb-8">One powerful plan. Unlimited possibilities for your school.</p>
        
        {/* Monthly/Yearly Toggle */}
        <div className="inline-flex bg-slate-200 p-1 rounded-full">
          <button 
            onClick={() => { setBillingCycle('monthly'); setDiscount(0); setPromoCode(''); setPromoStatus('idle'); }}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => { setBillingCycle('yearly'); setDiscount(0); setPromoCode(''); setPromoStatus('idle'); }}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Yearly <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Card Container */}
        <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 relative">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-3 text-center">
            <span className="text-slate-900 font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 fill-current" /> Most Popular Choice
            </span>
          </div>

          <div className="p-10 text-white">
            <h3 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              MaplePrep <span className="text-yellow-400 font-serif italic">Elite</span>
            </h3>
            <p className="text-slate-400 text-center mb-8">The ultimate all-in-one suite for modern educators.</p>

            {/* Price Display */}
            <div className="text-center mb-8 bg-white/5 rounded-2xl p-6 border border-white/10 transition-all">
              <div className="flex items-center justify-center items-baseline gap-1">
                <span className="text-6xl font-extrabold text-white">${finalPrice}</span>
                <span className="text-xl text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              {billingCycle === 'yearly' && (
                 <div className="text-sm text-green-400 font-bold mt-2">Billed annually (${(finalPrice / 12).toFixed(0)}/mo equivalent)</div>
              )}
              {discount > 0 && (
                <div className="mt-2 text-sm text-green-400 font-bold animate-pulse">
                  Original Price: <span className="line-through text-slate-500">${basePrice}</span> (You save ${discount})
                </div>
              )}
            </div>

            {/* Features List */}
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                <span className="text-slate-300"><strong className="text-white">Unlimited</strong> AI Lesson Generation</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                <span className="text-slate-300">Complete <strong className="text-white">Worksheet & Quiz</strong> Studio</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                <span className="text-slate-300">Interactive <strong className="text-white">Smart Board</strong> & Games</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                <span className="text-slate-300">School Admin Dashboard & <strong className="text-white">Reporting</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                <span className="text-slate-300">Priority <strong className="text-white">24/7 Support</strong></span>
              </li>
            </ul>

            {/* Promo Code Section */}
            <div className="mb-8">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Have a Promo Code?</label>
               <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Enter code" 
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoStatus('idle'); }}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-yellow-500 outline-none text-sm font-mono uppercase"
                    />
                  </div>
                  <button 
                    onClick={applyPromo}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg text-sm font-bold transition-colors"
                  >
                    Apply
                  </button>
               </div>
               {promoStatus !== 'idle' && (
                 <p className={`text-xs mt-2 font-bold ${promoStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                   {promoMessage}
                 </p>
               )}
            </div>

            <div className="space-y-4">
              <Button 
                onClick={onGetStarted} 
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 font-extrabold text-lg shadow-xl shadow-yellow-900/20 border-none"
              >
                Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <button 
                onClick={onGetStarted}
                className="w-full text-slate-400 hover:text-white text-sm font-bold flex items-center justify-center gap-2 group transition-colors"
              >
                <Clock className="w-4 h-4 group-hover:text-yellow-400 transition-colors" /> Start 2-Day Free Trial
              </button>
            </div>
            
            <p className="text-center text-xs text-slate-500 mt-6">
              Cancel anytime. Secure payment processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
