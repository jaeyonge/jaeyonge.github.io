import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import YAML from 'yaml';
import { resumeSchema } from '../../schemas/resume.mjs';
const raw = readFileSync('content/resume.yaml', 'utf8');
export const data = resumeSchema.parse(YAML.parse(raw));
export const contentHash = createHash('sha256').update(raw).digest('hex');
export const profileId = process.env.RESUME_PROFILE || 'general';
export const selectedProfile = data.profiles[profileId];
if (!selectedProfile) throw new Error(`Unknown resume profile ${profileId}`);
export function selectedExperience(profile = selectedProfile) {
  return data.experience.map((e) => ({
    ...e,
    highlights: profile.experience[e.id].map((id) => {
      const h = e.highlights.find((h) => h.id === id);
      if (!h) throw new Error(`Unknown highlight ${id}`);
      return h;
    }),
  }));
}
export function selectedResearch(profile = selectedProfile) {
  return profile.research.map((id) => data.research.find((x) => x.id === id));
}
