'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react'
import { evaluateProfileDataQuality, type DataQualityReport, type UserProfileData } from '@/lib/data-validation'

interface DataQualityCardProps {
  profile?: Partial<UserProfileData> | null
  compact?: boolean
  className?: string
  showRecommendations?: boolean
}

export function DataQualityCard({
  profile,
  compact = false,
  className = '',
  showRecommendations = true,
}: DataQualityCardProps) {
  const quality: DataQualityReport = useMemo(() => {
    return evaluateProfileDataQuality(profile)
  }, [profile])

  const completenessColor =
    quality.completeness >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : quality.completeness >= 50
      ? 'text-indigo-600 dark:text-indigo-400'
      : 'text-amber-600 dark:text-amber-400'

  const progressBgColor =
    quality.completeness >= 80
      ? 'bg-emerald-500'
      : quality.completeness >= 50
      ? 'bg-indigo-500'
      : 'bg-amber-500'

  const statusBadge =
    quality.completeness >= 80
      ? { text: 'High Quality', class: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' }
      : quality.completeness >= 50
      ? { text: 'Moderate Quality', class: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' }
      : { text: 'Needs Improvement', class: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-5 shadow-sm transition-all ${className}`}
    >
      {/* Header & Completeness Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Profile Data Quality & Mining Health
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusBadge.class}`}
            >
              {statusBadge.text}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validates integrity, prevents false matches, and measures algorithmic readiness.
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono ${completenessColor}`}>
            {quality.completeness}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
            Completeness
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${progressBgColor}`}
          style={{ width: `${quality.completeness}%` }}
        />
      </div>

      {/* Mining Readiness Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Career Matching Readiness */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              Career Matching Engine
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                quality.miningReadiness.careerMatchQuality === 'high'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : quality.miningReadiness.careerMatchQuality === 'medium'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : quality.miningReadiness.careerMatchQuality === 'low'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {quality.miningReadiness.careerMatchQuality.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {quality.miningReadiness.canMatchCareers
              ? 'Profile contains sufficient skill points for deterministic role similarity.'
              : 'Add technical skills to unlock accurate role match calculations.'}
          </p>
        </div>

        {/* Relationship Mining Readiness */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              Relationship Mining (Apriori)
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                quality.miningReadiness.relationshipMiningQuality === 'high'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : quality.miningReadiness.relationshipMiningQuality === 'medium'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : quality.miningReadiness.relationshipMiningQuality === 'low'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {quality.miningReadiness.relationshipMiningQuality.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {quality.miningReadiness.canMineRelationships
              ? 'Multi-item project & work transaction baskets available for rule mining.'
              : 'Tag technologies in 2+ projects or roles to generate association rules.'}
          </p>
        </div>
      </div>

      {/* Downstream Impact & Hygiene Warnings */}
      {quality.warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {quality.warnings.map((w, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold mr-1.5">[{w.section}]</span>
                <span>{w.message}</span>
                {w.impact === 'career_matching' && (
                  <span className="ml-1 text-[11px] opacity-80 font-medium">
                    (Affects career alignment score accuracy)
                  </span>
                )}
                {w.impact === 'relationship_mining' && (
                  <span className="ml-1 text-[11px] opacity-80 font-medium">
                    (Affects association rule confidence & graph edges)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inconsistencies / Duplicate warnings */}
      {quality.inconsistencies.length > 0 && (
        <div className="mb-4 space-y-2">
          {quality.inconsistencies.map((inc, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 text-xs"
            >
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>{inc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Critical Validation Errors (if any exist on root profile) */}
      {quality.errors.length > 0 && (
        <div className="mb-4 space-y-2">
          {quality.errors.map((err, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong>{err.section}:</strong> {err.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations & Actionable Next Steps */}
      {!compact && showRecommendations && quality.recommendations.length > 0 && (
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Recommended Quality Enhancements:</span>
          </div>
          <ul className="space-y-1.5">
            {quality.recommendations.slice(0, 4).map((rec, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {rec.action}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
                    — {rec.benefit}
                  </span>
                </div>
                {rec.link && (
                  <Link
                    href={rec.link}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                  >
                    Update <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
