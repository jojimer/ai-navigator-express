export const mockTrainingData = {
  id: 'test-id-1',
  content: 'This is a test training data',
  metadata: {
    source: 'test',
    timestamp: new Date().toISOString(),
  },
};

export const mockTrainingDataList = [
  mockTrainingData,
  {
    id: 'test-id-2',
    content: 'Another test training data',
    metadata: {
      source: 'test',
      timestamp: new Date().toISOString(),
    },
  },
];

export const mockAIResponse = {
  id: 'ai-response-1',
  content: 'This is a test AI response',
  model: 'test-model',
  timestamp: new Date().toISOString(),
};

export const mockExtensionData = {
  id: 'extension-1',
  name: 'Test Extension',
  version: '1.0.0',
  status: 'active',
};

export const mockToken = 'test-jwt-token';

export const mockError = {
  statusCode: 400,
  message: 'Test error message',
}; 