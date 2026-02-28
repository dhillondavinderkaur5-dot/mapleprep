
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

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 md:p-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-500 font-medium">Last Updated: February 23, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">1. Introduction</h2>
            <p>
              At MaplePrep, we are committed to protecting the privacy of our users, primarily Canadian educators. This policy outlines how we collect, use, and safeguard your information in compliance with Canadian privacy laws, including <strong>FIPPA</strong> (Freedom of Information and Protection of Privacy Act) and <strong>PHIPA</strong> (Personal Health Information Protection Act) standards where applicable to educational environments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, professional email address, and school affiliation.</li>
              <li><strong>Usage Data:</strong> Lesson topics, grade levels, and subjects selected for generation.</li>
              <li><strong>Payment Data:</strong> Handled securely via Stripe; we do not store full credit card numbers on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">3. How We Use AI</h2>
            <p>
              MaplePrep utilizes advanced AI models (including Google Gemini) to generate educational content. 
              <strong> We do not sell your data to third parties.</strong> Data sent to AI models is used strictly for the purpose of generating your requested lesson materials and is anonymized to protect educator identity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">4. Data Security</h2>
            <p>
              We employ industry-standard encryption (AES-256) for data at rest and TLS for data in transit. Our servers are located in secure facilities, and we conduct regular security audits to ensure your classroom materials remain private.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">5. Contact Us</h2>
            <p>
              If you have questions about our privacy practices or wish to request a data export/deletion, please contact our Privacy Officer at <a href="mailto:privacy@mymapleprep.com" className="text-blue-600 font-bold hover:underline">privacy@mymapleprep.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 md:p-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
            <p className="text-slate-500 font-medium">Effective Date: February 23, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MaplePrep, you agree to be bound by these Terms of Service. If you are using the service on behalf of a school or district, you represent that you have the authority to bind that entity to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">2. Description of Service</h2>
            <p>
              MaplePrep provides an AI-powered platform designed to assist Canadian educators in creating lesson plans, worksheets, and interactive classroom materials aligned with provincial curriculum standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">3. User Responsibilities</h2>
            <p>
              Educators are responsible for reviewing all AI-generated content for accuracy, age-appropriateness, and curriculum alignment before use in a classroom. MaplePrep is a tool to assist, not replace, professional teacher judgment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">4. Intellectual Property</h2>
            <p>
              <strong>Your Content:</strong> You retain ownership of the specific lesson plans and materials you generate using the platform.
              <br />
              <strong>Our Platform:</strong> MaplePrep retains all rights to the underlying technology, AI configurations, and proprietary curriculum mapping data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">5. Limitation of Liability</h2>
            <p>
              MaplePrep is provided "as is" without warranties of any kind. We are not liable for any classroom disruptions or educational outcomes resulting from the use of AI-generated materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">6. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
