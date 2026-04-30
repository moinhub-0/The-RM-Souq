import React from 'react';
import { motion } from 'motion/react';
import { Code, Layout, Smartphone, Globe, Mail, Phone, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function DeveloperProfile() {
  const skills = [
    { name: 'Web Development', icon: <Globe className="text-blue-500" /> },
    { name: 'UI/UX Design', icon: <Layout className="text-purple-500" /> },
    { name: 'Mobile Responsive', icon: <Smartphone className="text-green-500" /> },
    { name: 'React / Next.js', icon: <Code className="text-cyan-500" /> },
    { name: 'Fullstack Solutions', icon: <CheckCircle2 className="text-orange-500" /> }
  ];

  return (
    <div className="min-h-screen bg-brand-sand-50 py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-brand-sand-200"
        >
          {/* Header Section */}
          <div className="bg-brand-green-900 p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--brand-gold-500)_0%,_transparent_70%)]"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-serif text-brand-gold-400 mb-4">Moinuddin Hasan</h1>
              <p className="text-xl md:text-2xl font-light text-brand-sand-200">Fullstack Web Developer & Digital Architect</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* About Me */}
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-brand-green-900 border-b-2 border-brand-gold-500 pb-2 inline-block">About Me</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Dedicated to crafting beautiful, high-performance web applications that solve real-world problems. With a sharp eye for design and a passion for clean code, I help businesses establish a powerful digital presence.
                </p>
                
                <div className="bg-brand-sand-100 p-6 rounded-2xl border border-brand-sand-200">
                  <h3 className="font-bold text-brand-green-900 mb-4 flex items-center gap-2">
                    <Mail size={18} /> Contact for Projects
                  </h3>
                  <div className="space-y-3">
                    <p className="flex items-center gap-3 text-gray-700">
                      <Phone className="text-brand-green-700" size={16} />
                      <span className="font-medium">+91 7853903438</span>
                    </p>
                    <a href="tel:7853903438" className="inline-block bg-brand-green-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-green-800 transition-all shadow-lg hover:shadow-brand-green-900/20 active:scale-95">
                      Call Now
                    </a>
                  </div>
                </div>
              </div>

              {/* Skills Area */}
              <div>
                <h2 className="text-2xl font-serif text-brand-green-900 border-b-2 border-brand-gold-500 pb-2 inline-block mb-6">Expertise</h2>
                <div className="grid grid-cols-1 gap-4">
                  {skills.map((skill, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white border border-brand-sand-200 rounded-xl hover:border-brand-gold-400 hover:shadow-md transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-brand-sand-50 transition-colors">
                        {skill.icon}
                      </div>
                      <span className="font-medium text-gray-800">{skill.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-16 text-center pt-12 border-t border-brand-sand-200">
              <p className="text-brand-green-900 font-serif text-xl mb-6">Want a professional website like this one?</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="tel:7853903438" className="bg-brand-gold-500 text-brand-green-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-gold-400 transition-all flex items-center justify-center gap-2">
                  Get a Free Quote <ExternalLink size={20} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
