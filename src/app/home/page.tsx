// app/page.tsx
"use client";
import Link from "next/link";
import { BookOpen, Users, Heart, ArrowRight, Star, PenTool, Globe, Shield } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <PenTool className="w-12 h-12" />,
      title: "Easy Writing",
      description: "Beautiful editor that makes writing a pleasure"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Global Reach",
      description: "Share your stories with readers worldwide"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Vibrant Community",
      description: "Connect with writers and readers"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Safe Space",
      description: "Respectful environment for all voices"
    }
  ];

  const stats = [
    { number: "50K+", label: "Writers" },
    { number: "50K+", label: "Blog Posts" },
    { number: "1M+", label: "Readers" },
    { number: "120+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
     
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Where Every <span className="text-blue-600">Story</span> Finds Its <span className="text-green-500">Voice</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of writers sharing their stories, ideas, and inspiration. 
            BlogHub is your platform to write, connect, and be heard in a vibrant community of storytellers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/signup"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
            >
              Start Writing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/blog"
              className="border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500 px-8 py-4 rounded-lg font-medium transition-all duration-200 text-lg"
            >
              Explore Stories
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose BlogHub?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've built the perfect platform for writers and readers to connect, 
              share, and grow together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Story?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of writers and readers today. Share your voice, discover amazing content, 
            and be part of something special.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
            >
              Create Your Account
            </Link>
            <Link 
              href="/blog"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-medium transition-all duration-200 text-lg"
            >
              Explore Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Writers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what our community members are saying about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Fiction Writer",
                content: "BlogHub helped me find my audience and connect with readers who truly appreciate my work.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Tech Blogger",
                content: "The community engagement here is incredible. I've built real connections with fellow writers.",
                rating: 5
              },
              {
                name: "Emily Davis",
                role: "Travel Writer",
                content: "Finally a platform that understands writers! The tools and community support are amazing.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Writing Journey Today</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of writers who are already sharing their stories and building their audience.
          </p>
          <Link 
            href="/signup"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2 text-lg"
          >
            <BookOpen className="w-5 h-5" />
            Begin Your Story
          </Link>
        </div>
      </section>
    </div>
  );
}