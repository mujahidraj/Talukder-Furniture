import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../components/ui/Loader';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data } = await api.get('/faqs');
        if (data && data.length > 0) {
          setFaqs(data);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch FAQs, falling back to mock data.', err);
      }

      // Mock data for UI scaffolding fallback
      setFaqs([
        { id: 'mock1', question: 'What is your return policy?', answer: 'We offer a 30-day return window for all standard items in original condition. Custom-made or modified furniture pieces are non-returnable unless there is a manufacturing defect.' },
        { id: 'mock2', question: 'Do you offer delivery and assembly services?', answer: 'Yes! We offer free standard delivery on orders over ৳50,000. We also provide a premium service which includes delivery to your room of choice and full assembly.' },
        { id: 'mock3', question: 'Are your materials sustainably sourced?', answer: 'Absolutely. We are committed to environmental responsibility. All our solid wood is ethically sourced, and we prioritize materials with low environmental impact.' },
        { id: 'mock4', question: 'Can I customize the dimensions of a piece?', answer: 'Many of our signature pieces can be customized. Please contact our design team through the Contact Us page or visit a showroom to discuss your specific dimensional requirements.' },
        { id: 'mock5', question: 'How do I care for my new furniture?', answer: 'Care instructions vary by material. Generally, we recommend dusting with a soft, dry cloth. Avoid harsh chemical cleaners. For wood, occasionally use a high-quality furniture polish.' },
      ]);
    };

    fetchFaqs().finally(() => setLoading(false));
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-secondary min-h-screen pt-12 pb-24">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-16">
          <MessageCircleQuestion size={48} className="text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-500 text-lg">
            Find answers to common questions about our products, shipping, returns, and more.
          </p>
        </div>

        {loading ? (
          <Loader text="Loading FAQs..." />
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={faq.id} 
                className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'border-accent shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className={`font-semibold text-lg pr-8 ${openIndex === index ? 'text-primary' : 'text-primary'}`}>
                    {faq.question}
                  </h3>
                  <div className={`transform transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 bg-primary rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-serif font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            If you couldn't find the answer you were looking for, our customer support team is ready to help.
          </p>
          <Link to="/contact" className="btn btn-primary bg-accent hover:bg-accent/90 border-none px-8 py-3">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
