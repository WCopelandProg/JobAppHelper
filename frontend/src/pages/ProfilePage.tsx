import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchProfile, updateProfile } from "../api/profile";
import { deleteResume, downloadResume, listResumes, setPrimaryResume, uploadResume } from "../api/resumes";
import { Spinner } from "../components/common/Spinner";
import { ErrorState } from "../components/common/ErrorState";
import { TagInput } from "../components/common/TagInput";
import { ResumeUploader } from "../components/resume/ResumeUploader";
import { ResumeList } from "../components/resume/ResumeList";
import { extractErrorMessage } from "../api/client";
import { JOB_CATEGORY_LABELS, JobCategory, Profile, RemotePreference, Resume } from "../types";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const resumesQuery = useQuery({ queryKey: ["resumes"], queryFn: listResumes });

  const [form, setForm] = useState<Partial<Profile> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileQuery.data) setForm(profileQuery.data);
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (input: Partial<Profile>) => updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedJobs"] });
      refreshUser();
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await updateMutation.mutateAsync(form);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    await uploadResume(file);
    queryClient.invalidateQueries({ queryKey: ["resumes"] });
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await deleteResume(id);
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryResume(id);
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDownload = async (resume: Resume) => {
    try {
      await downloadResume(resume.id, resume.fileName);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (profileQuery.isLoading || !form) return <Spinner label="Loading your profile..." />;
  if (profileQuery.isError) return <ErrorState message={extractErrorMessage(profileQuery.error)} onRetry={() => profileQuery.refetch()} />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile & Resume</h1>
        <p className="mt-1 text-sm text-slate-500">This information powers job matching and cover letter generation.</p>
      </div>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold text-slate-900">Resume</h2>
        <ResumeUploader onUpload={handleUpload} />
        {resumesQuery.isLoading && <Spinner label="Loading resumes..." />}
        {resumesQuery.data && resumesQuery.data.length > 0 && (
          <ResumeList resumes={resumesQuery.data} onDelete={handleDeleteResume} onSetPrimary={handleSetPrimary} onDownload={handleDownload} />
        )}
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold text-slate-900">Career profile</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Headline</label>
            <input
              className="input"
              value={form.headline ?? ""}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g. Data Science student"
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label">Remote preference</label>
            <select
              className="input"
              value={form.remotePref ?? "ANY"}
              onChange={(e) => setForm({ ...form, remotePref: e.target.value as RemotePreference })}
            >
              <option value="ANY">Any</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">Onsite</option>
            </select>
          </div>
          <div>
            <label className="label">Years of experience</label>
            <input
              type="number"
              className="input"
              value={form.yearsExperience ?? 0}
              onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="label">Target categories</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(JOB_CATEGORY_LABELS) as [JobCategory, string][])
              .filter(([value]) => value !== "OTHER")
              .map(([value, label]) => {
                const active = (form.targetCategories ?? []).includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    className={`badge cursor-pointer border ${active ? "border-brand-500 bg-brand-100 text-brand-700" : "border-slate-200 bg-white text-slate-600"}`}
                    onClick={() => {
                      const current = form.targetCategories ?? [];
                      setForm({
                        ...form,
                        targetCategories: active ? current.filter((c) => c !== value) : [...current, value],
                      });
                    }}
                  >
                    {label}
                  </button>
                );
              })}
          </div>
        </div>

        <div>
          <label className="label">Target roles</label>
          <TagInput value={form.targetRoles ?? []} onChange={(v) => setForm({ ...form, targetRoles: v })} placeholder="e.g. Data Analyst" />
        </div>

        <div>
          <label className="label">Skills</label>
          <TagInput value={form.skills ?? []} onChange={(v) => setForm({ ...form, skills: v })} placeholder="e.g. Python, SQL" />
        </div>

        <div>
          <label className="label">Interests</label>
          <TagInput value={form.interests ?? []} onChange={(v) => setForm({ ...form, interests: v })} placeholder="e.g. experimentation" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">LinkedIn URL</label>
            <input className="input" value={form.linkedinUrl ?? ""} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input className="input" value={form.githubUrl ?? ""} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
          </div>
          <div>
            <label className="label">Portfolio URL</label>
            <input className="input" value={form.portfolioUrl ?? ""} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-[100px]" value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>

        <div className="flex justify-end">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </section>
    </div>
  );
}
