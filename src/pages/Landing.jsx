import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Brain, Layers, Target, ArrowRight,
  GraduationCap, Briefcase, Play, Lock
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 text-white overflow-x-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">
              <span className="font-light">AI</span>mpress Notes
            </h1>
          </div>
          <Button asChild variant="outline" className="bg-white/20 border-white/30 hover:bg-white/30 backdrop-blur-sm">
            <Link to={createPageUrl('Pricing')}>Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center p-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="z-10 max-w-5xl mx-auto">
          <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-2 text-lg font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Organization
          </Badge>
          <h1 
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
            style={{ textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
          >
            Unlock Your Mind's Potential
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-10 leading-relaxed" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            The most intelligent sticky note app ever created. Harness the power of AI to organize your thoughts, boost productivity, and create presentations that truly impress.
          </p>
          <div>
            <Button asChild size="lg" className="bg-gradient-to-r from-white/95 to-white/85 text-purple-700 hover:text-purple-800 font-bold text-lg px-12 py-8 rounded-full shadow-2xl backdrop-blur-md border border-white/30">
              <Link to={createPageUrl('Pricing')}>
                Start Impressing Today <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* App Visuals Section */}
      <section className="py-20 px-6 bg-black/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">See AImpress Notes in Action</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Experience the power of AI-driven note organization with our intuitive interface.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=top" alt="App Dashboard" className="w-full h-auto" />
              </div>
              <p className="text-center text-white/80 mt-4 text-sm font-medium">Beautiful Board Overview - Organize multiple projects with ease.</p>
            </div>
            
            <div className="relative group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center" alt="AI Categorization Video" className="w-full h-auto" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
              <p className="text-center text-white/80 mt-4 text-sm font-medium">Watch AI Categorization in Real-Time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Features That Impress</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Every feature is designed with intelligence at its core, helping you work smarter.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 text-center">
              <div className="w-16 h-16 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI-Powered Organization</h3>
              <p className="text-white/80 leading-relaxed">Our AI automatically categorizes your notes, suggests layouts, and identifies connections.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 text-center">
              <div className="w-16 h-16 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cognitive Frameworks</h3>
              <p className="text-white/80 leading-relaxed">Visualize thoughts using proven frameworks like the Eisenhower Matrix for better decision-making.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 text-center">
              <div className="w-16 h-16 mb-4 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multiple View Modes</h3>
              <p className="text-white/80 leading-relaxed">Switch between freeform canvases, timelines, and structured lists to see your notes how you need them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Modes Section */}
      <section className="py-20 px-6 bg-black/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Designed for Every User</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Choose your personalized experience and let AI adapt to your workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Professional Mode</h3>
                  <p className="text-white/60 text-sm">AI-powered workspace for business productivity</p>
                </div>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">Streamlined productivity with intelligent insights, perfect for managing projects, meetings, and strategic planning.</p>
              <div className="space-y-3">
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">AI Analytics & Insights</span>
                </div>
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">Smart Organization</span>
                </div>
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">Workflow Optimization</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Student Mode</h3>
                  <p className="text-white/60 text-sm">AI study companion for academic excellence</p>
                </div>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">Learn smarter with AI-powered study tools, designed to help you organize subjects, track assignments, and optimize learning.</p>
              <div className="space-y-3">
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  <span className="text-sm">Study Optimization</span>
                </div>
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  <span className="text-sm">AI Learning Coach</span>
                </div>
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  <span className="text-sm">Smart Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Impress?</h2>
            <p className="text-xl text-white/80 mb-10 leading-relaxed">
              Join thousands who have transformed their productivity with AImpress Notes.
            </p>
            <div>
              <Button asChild size="lg" className="bg-gradient-to-r from-white/95 to-white/85 text-purple-700 hover:text-purple-800 font-bold text-xl px-12 py-8 rounded-full shadow-2xl backdrop-blur-md border border-white/30">
                <Link to={createPageUrl('Pricing')}>
                  <Lock className="mr-2 w-5 h-5" />
                  Unlock All Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}