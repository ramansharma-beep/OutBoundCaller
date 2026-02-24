
const parentsInHoldFlow = new Set();

function addParentInHoldFlow(parentCallSid) {
  parentsInHoldFlow.add(parentCallSid);
  setTimeout(() => parentsInHoldFlow.delete(parentCallSid), 60000);
}

function isParentInHoldFlow(callSid) {
  return parentsInHoldFlow.has(callSid);
}

function removeParentFromHoldFlow(callSid) {
  parentsInHoldFlow.delete(callSid);
}

module.exports = {
  addParentInHoldFlow,
  isParentInHoldFlow,
  removeParentFromHoldFlow,
};
