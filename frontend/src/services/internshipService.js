import { invokeFunction } from './api'

const domains = ['WEB_DEVELOPMENT', 'JAVA_DEVELOPMENT', 'PYTHON_DEVELOPMENT', 'AI_MACHINE_LEARNING', 'DATA_SCIENCE', 'CYBERSECURITY', 'FULL_STACK_DEVELOPMENT']
export const getInternshipProgramInfo = async () => ({ data: { durations: [1, 2, 3, 6], modes: ['ONLINE', 'OFFLINE'], domains } })
export const getInternshipDomains = async () => ({ data: domains })
export const submitInternshipApplication = (payload) => {
  return invokeFunction('submit-application?type=internship', { method: 'POST', body: payload })
}
