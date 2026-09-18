import React from 'react';
import { TimelineItem } from '../types';
import { Clock, CheckCircle2, Circle, Radio, Shield, Sparkles } from 'lucide-react';

interface EventTimelineProps {
  timeline: TimelineItem[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ timeline }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-600" />
          <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wide">
            EVENT AUDIT TIMELINE
          </h2>
        </div>
        <span className="text-[11px] font-mono text-neutral-500">
          Chronological Lifecycle Audit
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
        {timeline.map((item, idx) => {
          const isLatest = idx === timeline.length - 1;
          return (
            <div key={item.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition-colors ${
                  isLatest
                    ? 'border-neutral-900 text-neutral-900 ring-4 ring-neutral-100'
                    : 'border-emerald-600 text-emerald-600'
                }`}
              >
                {isLatest ? (
                  <Circle className="w-2 h-2 fill-neutral-900 text-neutral-900" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xs font-bold text-neutral-900 font-mono uppercase">
                    {item.stage.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-neutral-700 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
