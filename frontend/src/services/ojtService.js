import { invokeFunction } from './api'

const tracks = ['WEB_DEVELOPMENT', 'JAVA_DEVELOPMENT', 'PYTHON_AI', 'CYBERSECURITY', 'AI_DATA_SCIENCE']
export const getOjtProgramInfo = async () => ({ data: { durations: [4, 6, 8, 12], trainingHours: '60-120 Hours', modes: ['ONLINE', 'OFFLINE'], tracks } })
export const getOjtTracks = async () => ({ data: tracks })
export const submitOjtApplication = (payload) => {
  return invokeFunction('submit-application?type=ojt', { method: 'POST', body: payload })
}
