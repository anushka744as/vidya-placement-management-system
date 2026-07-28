'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Briefcase, MapPin, Sparkles } from 'lucide-react';
import { fetchFeaturedSuccessStories } from '@/app/actions/success-stories';
import { SuccessStory } from '@/lib/supabase/success-story-types';

const AUTO_ADVANCE_MS = 6000;

export function SuccessStoriesCarousel() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedSuccessStories().then((res) => {
      setStories(res.data);
      setLoading(false);
    });
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (stories.length ? (i + 1) % stories.length : 0));
  }, [stories.length]);

  const prev = () => {
    setIndex((i) => (stories.length ? (i - 1 + stories.length) % stories.length : 0));
  };

  useEffect(() => {
    if (stories.length < 2) return;
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [stories.length, next]);

  if (loading || stories.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/40 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100/80 text-blue-700 text-xs font-bold rounded-full">
            <Sparkles size={14} /> Real Stories, Real Impact
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Student Success Stories</h2>
          <p className="text-sm text-gray-500">Hear directly from students Vidya has helped place into meaningful careers.</p>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] shadow-2xl overflow-hidden bg-white">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {stories.map((story) => (
                <div key={story.id} className="w-full shrink-0">
                  <div className="relative w-full h-72 md:h-[26rem] bg-blue-100">
                    {story.photo_url ? (
                      <img
                        src={story.photo_url}
                        alt={story.student_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 font-extrabold text-7xl">
                        {story.student_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8">
                      <p className="font-bold text-white text-lg md:text-xl">{story.student_name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-white/80 mt-1.5">
                        {story.job_role && story.company_placed && (
                          <span className="flex items-center gap-1"><Briefcase size={13} /> {story.job_role} at {story.company_placed}</span>
                        )}
                        {story.centre && (
                          <span className="flex items-center gap-1"><MapPin size={13} /> {story.centre}</span>
                        )}
                        {story.batch_year && <span>Batch of {story.batch_year}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-10">
                    <Quote size={32} className="text-blue-100 mb-3" />
                    <p className="text-base md:text-xl text-gray-800 leading-relaxed font-medium">
                      "{story.testimonial}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {stories.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous story"
                className="absolute left-2 md:-left-5 top-32 md:top-44 w-10 h-10 md:w-12 md:h-12 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all hover:scale-105"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                aria-label="Next story"
                className="absolute right-2 md:-right-5 top-32 md:top-44 w-10 h-10 md:w-12 md:h-12 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all hover:scale-105"
              >
                <ChevronRight size={20} />
              </button>

              <div className="flex items-center justify-center gap-2 mt-6">
                {stories.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to story ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
