import type { ComplexDto } from '../../../types/complex';

/** Seeds a Complex edit form from its DTO. Shared by ComplexPage (a manager's own site) and AllSitesPage (admin cross-tenant edit). */
export function complexFormFromDto(complex: ComplexDto) {
  return {
    name: complex.name,
    neighborhoodId: complex.neighborhood.id as number | null,
    address: complex.address ?? '',
    latitude: String(complex.latitude),
    longitude: String(complex.longitude),
  };
}
