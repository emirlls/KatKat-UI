import { api } from '../../../services/api';
import type { DistrictLeaderboardDto, LeaderboardDto, NeighborhoodLeaderboardDto } from '../../../types/complex';

export const leaderboardService = {
  getLeaderboard: (districtId?: number, neighborhoodId?: number, maxResultCount = 20) =>
    api.get<LeaderboardDto[]>('/complexes/leaderboard', { districtId, neighborhoodId, maxResultCount }),
  getNearbyLeaderboard: (latitude: number, longitude: number, radiusKm?: number, maxResultCount = 20) =>
    api.get<LeaderboardDto[]>('/complexes/nearby-leaderboard', { latitude, longitude, radiusKm, maxResultCount }),
  getAllDistrictLeaderboards: (maxResultCountPerDistrict = 20) =>
    api.get<DistrictLeaderboardDto[]>('/complexes/leaderboard/by-district', { maxResultCountPerDistrict }),
  getAllNeighborhoodLeaderboards: (maxResultCountPerNeighborhood = 20) =>
    api.get<NeighborhoodLeaderboardDto[]>('/complexes/leaderboard/by-neighborhood', { maxResultCountPerNeighborhood }),
};
