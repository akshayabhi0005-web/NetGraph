import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Link as LinkIcon,
  FileUp,
  FileText,
  Trash2,
  Plus,
  Edit2,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { SkillCategory, SkillType, SkillItem } from '../types';

export const ProfilePage: React.FC = () => {
  const {
    profile,
    updateProfile,
    addSkill,
    removeSkill,
    addProject,
    removeProject,
    addEducation,
    removeEducation,
    addExperience,
    removeExperience,
    addCertification,
    removeCertification,
    handleResumeUpload,
    removeResumeFile,
    resetToDemoData,
  } = useAppData();

  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'projects' | 'education' | 'experience' | 'resume'>('info');
  const [saveToast, setSaveToast] = useState(false);

  // New Skill Form State
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Programming Languages');
  const [newSkillType, setNewSkillType] = useState<SkillType>('technical');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      type: newSkillType,
      proficiency: newSkillProficiency,
      source: 'user',
      marketDemand: 85,
    });
    setNewSkillName('');
    setShowAddSkillModal(false);
    handleSave();
  };

  const onResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|docx)$/i)) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setUploadingResume(true);
    await handleResumeUpload(file);
    setUploadingResume(false);
    handleSave();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved and synchronized locally!</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {profile.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                Research Candidate
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">{profile.headline}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
              <span>{profile.location}</span>
              <span>•</span>
              <span>{profile.email}</span>
              {profile.phone && (
                <>
                  <span>•</span>
                  <span>{profile.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Reset all profile data back to original demo values?')) {
                resetToDemoData();
              }
            }}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Reset to default demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0.5 text-xs">
        {[
          { id: 'info', label: 'Personal & Links', icon: User },
          { id: 'skills', label: `Skills (${profile.skills.length})`, icon: Sparkles },
          { id: 'projects', label: `Projects (${profile.projects.length})`, icon: Layers },
          { id: 'education', label: `Education (${profile.education.length})`, icon: GraduationCap },
          { id: 'experience', label: `Experience (${profile.experience.length})`, icon: Briefcase },
          { id: 'resume', label: 'Resume Upload', icon: FileUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Personal Info & Links */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => updateProfile({ fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => updateProfile({ headline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => updateProfile({ location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Biography / Academic Statement</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500 text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* External Links & Ethics Note */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Optional External Profiles</h3>
              <p className="text-[11px] text-slate-500">
                Links are optional and analyzed only through permitted public endpoints.
              </p>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 block mb-1">GitHub</span>
                  <input
                    type="url"
                    value={profile.links.github || ''}
                    onChange={(e) => updateProfile({ links: { ...profile.links, github: e.target.value } })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 block mb-1">LinkedIn</span>
                  <input
                    type="url"
                    value={profile.links.linkedin || ''}
                    onChange={(e) => updateProfile({ links: { ...profile.links, linkedin: e.target.value } })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 block mb-1">LeetCode</span>
                  <input
                    type="url"
                    value={profile.links.leetcode || ''}
                    onChange={(e) => updateProfile({ links: { ...profile.links, leetcode: e.target.value } })}
                    placeholder="https://leetcode.com/u/username"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 block mb-1">Portfolio</span>
                  <input
                    type="url"
                    value={profile.links.portfolio || ''}
                    onChange={(e) => updateProfile({ links: { ...profile.links, portfolio: e.target.value } })}
                    placeholder="https://myportfolio.dev"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
              <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                NETGRAPH never performs unauthorized scraping on private accounts or password-protected content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Skills Management */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Represented Profile Skills</h3>
              <p className="text-xs text-slate-500">Skills categorized by domain, proficiency, and extraction provenance</p>
            </div>
            <button
              onClick={() => setShowAddSkillModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.skills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 truncate">{skill.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        skill.type === 'technical'
                          ? 'bg-blue-100 text-blue-800'
                          : skill.type === 'tool'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {skill.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{skill.category}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="text-indigo-600 font-medium">{skill.proficiency}</span>
                    <span>•</span>
                    <span className="capitalize">Source: {skill.source}</span>
                  </div>
                </div>

                <button
                  onClick={() => removeSkill(skill.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                  title="Remove skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Skill Modal */}
          {showAddSkillModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left space-y-4 animate-in fade-in zoom-in-95">
                <h3 className="text-base font-bold text-slate-900">Add New Competency</h3>
                <form onSubmit={handleCreateSkill} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PyTorch, Kubernetes, GraphQL"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Domain Category</label>
                    <select
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Programming Languages">Programming Languages</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Databases">Databases</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="Development Tools">Development Tools</option>
                      <option value="Soft Skills">Soft Skills</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Type</label>
                      <select
                        value={newSkillType}
                        onChange={(e) => setNewSkillType(e.target.value as SkillType)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="technical">Technical</option>
                        <option value="tool">Tool / Framework</option>
                        <option value="soft">Soft Skill</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Proficiency</label>
                      <select
                        value={newSkillProficiency}
                        onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddSkillModal(false)}
                      className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      Add Skill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Projects */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic & Open Source Projects</h3>
              <p className="text-xs text-slate-500">Documented project descriptions mined for technology relationships</p>
            </div>
          </div>

          <div className="space-y-4">
            {profile.projects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                    <span className="text-[11px] text-indigo-600 font-medium">{proj.role}</span>
                  </div>
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Remove project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed">{proj.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {proj.technologiesUsed.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4 & 5: Education & Experience */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Education History</h3>
          <div className="space-y-4 text-xs">
            {profile.education.map((edu) => (
              <div key={edu.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{edu.institution}</h4>
                  <div className="text-slate-700 font-medium">{edu.degree} in {edu.fieldOfStudy}</div>
                  <div className="text-slate-400 text-[11px]">{edu.startYear} - {edu.graduationYear} • Grade: {edu.grade}</div>
                  {edu.coursework && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {edu.coursework.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px]">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Internship & Research Experience</h3>
          <div className="space-y-4 text-xs">
            {profile.experience.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h4>
                  <span className="text-[11px] text-slate-400">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-indigo-600 font-medium">{exp.organization} • {exp.employmentType}</div>
                <p className="text-slate-600 leading-relaxed pt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Resume Upload (Optional) */}
      {activeTab === 'resume' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Optional Resume Upload</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload an existing resume (PDF or DOCX) to simulate automated skill extraction into your profile.
            </p>
          </div>

          {profile.resumeFile ? (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{profile.resumeFile.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {(profile.resumeFile.size / 1024).toFixed(1)} KB • Uploaded {profile.resumeFile.uploadDate} • {profile.resumeFile.extractedSkillCount} skills extracted
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer">
                  Replace File
                  <input type="file" accept=".pdf,.docx" onChange={onResumeFileChange} className="hidden" />
                </label>
                <button
                  onClick={removeResumeFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove uploaded resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 hover:border-indigo-400 transition-colors">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Upload candidate resume</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF and DOCX up to 5MB</p>
              </div>
              <label className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors">
                {uploadingResume ? 'Extracting competencies...' : 'Select Resume File'}
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={onResumeFileChange}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
