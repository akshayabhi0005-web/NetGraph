import { apiClient } from './api';
import { GraphData } from '../types';
import { fullMockGraph } from '../data/graphData';

export const graphService = {
  // Simulates or triggers FastAPI /api/v1/graph
  getKnowledgeGraph: async (): Promise<GraphData> => {
    try {
      const response = await apiClient.get('/graph');
      return response.data;
    } catch (e) {
      return fullMockGraph;
    }
  },

  // Simulates or triggers FastAPI /api/v1/graph/neighbors/:nodeId
  getNodeNeighbors: async (nodeId: string) => {
    try {
      const response = await apiClient.get(`/graph/neighbors/${nodeId}`);
      return response.data;
    } catch (e) {
      const edges = fullMockGraph.edges.filter((ed) => ed.source === nodeId || ed.target === nodeId);
      return edges;
    }
  },
};
