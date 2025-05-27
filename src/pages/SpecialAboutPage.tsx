import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, Phone, Globe, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BranchHours {
  [key: string]: string[];
}

interface BranchAddress {
  line1: string;
  city: string;
  postcode: string;
  country: string;
}

interface Branch {
  name: string;
  address: BranchAddress;
  phone: string;
  email: string;
  hours: BranchHours;
}

const branchesData: Branch[] = [
  {
    name: 'DUNFERMLINE',
    address: {
      line1: '26 Bruce Street',
      city: 'Dunfermline',
      postcode: 'KY12 7AG',
      country: 'United Kingdom',
    },
    phone: '01383623409',
    email: 'dunfermline@restroman.com',
    hours: {
      Monday: ['11:45–14:30', '16:30–22:00'],
      Tuesday: ['16:30–22:00'],
      Wednesday: ['16:30–22:00'],
      Thursday: ['11:45–14:30', '16:30–22:00'],
      Friday: ['11:45–14:30', '16:30–23:00'],
      Saturday: ['11:45–14:30', '16:30–23:00'],
      Sunday: ['11:45–14:30', '16:30–22:00'],
    },
  },
  {
    name: 'EDINBURGH',
    address: {
      line1: '175 Dalry Road',
      city: 'Edinburgh',
      postcode: 'EH11 2EB',
      country: 'United Kingdom',
    },
    phone: '01312374516',
    email: 'edinburgh@restroman.com',
    hours: {
      Monday: ['11:45–22:55'],
      Tuesday: ['11:45–22:55'],
      Wednesday: ['11:45–22:55'],
      Thursday: ['11:45–22:55'],
      Friday: ['11:45–22:55'],
      Saturday: ['11:45–22:55'],
      Sunday: ['11:45–22:55'],
    },
  },
];

const SpecialAboutPage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    setBranches(branchesData);
  }, []);

  return (
    <div className="min-h-screen relative font-sans">
      {/* Background Layer */}
      <div
        className="fixed inset-0 w-full h-screen"
        style={{ zIndex: -1 }}
      >
        <img
          src="/bg-home.png"
          alt="background"
          className="w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        {/* Close/Back Button and Header */}
        <header className="flex items-center justify-between mb-12">
          <Link
            to="/"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">About Us</h1>
          {/* Placeholder to keep header balanced */}
          <div style={{ width: 40 }} />
        </header>

        {/* Company Description */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-white/20 shadow-lg">
          <h2 className="md:text-3xl text-2xl font-bold text-white mb-6">RESTROMAN</h2>
          <p className="text-white/80 text-lg leading-relaxed mb-6">
            Discover the warmth of authentic cuisine and personalized service. At Restroman,
            every dish tells a story, and every guest is family.
          </p>
          <div className="flex items-center gap-2 text-green-500">
            <Globe size={20} />
            <a
              href="https://www.restroman.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 underline hover:text-green-400 transition"
            >
              www.restroman.com <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* Branches Grid */}
        <section className="grid md:grid-cols-2 gap-6">
          {branches.map((branch, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-colors shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-green-400 mb-6">{branch.name}</h3>

              {/* Contact Info */}
              <div className="space-y-6 mb-8 text-white/90">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-500 mt-1" />
                  <address className="not-italic leading-relaxed">
                    {branch.address.line1}
                    <br />
                    {branch.address.city}, {branch.address.postcode}
                    <br />
                    {branch.address.country}
                  </address>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <a
                    href={`tel:${branch.phone}`}
                    className="hover:text-green-400 underline transition"
                  >
                    {branch.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-500" />
                  <a
                    href={`mailto:${branch.email}`}
                    className="hover:text-green-400 underline transition"
                  >
                    {branch.email}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-4 text-white">
                  <Clock className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold">Opening Hours</h4>
                </div>
                <div className="space-y-2 text-white/90 text-sm">
                  {Object.entries(branch.hours).map(([day, times]) => (
                    <div key={day} className="flex justify-between">
                      <span className="font-medium">{day}</span>
                      <span>{times.length ? times.join(', ') : 'Closed'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Note */}
        <section className="bg-green-600 rounded-xl p-6 mt-16 text-center text-white font-semibold shadow-lg">
          Kitchen closes 30 minutes before closing. Please ensure last orders are placed accordingly.
        </section>
      </div>
    </div>
  );
};

export default SpecialAboutPage;
