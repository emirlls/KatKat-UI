/**
 * Mirror of the backend KatKatPermissions constants (src/KatKat.Application.Contracts/Permissions).
 * These exact dotted strings are the keys ABP returns in application-configuration.auth.grantedPolicies,
 * so the UI gates buttons/pages by looking each one up via usePermission().hasPermission(...).
 * Keep in sync with the backend if a permission is added or renamed.
 */
export const Permissions = {
  Complexes: {
    Update: 'KatKat.Complexes.Update',
    Delete: 'KatKat.Complexes.Delete',
  },
  Buildings: {
    Create: 'KatKat.Buildings.Create',
    Update: 'KatKat.Buildings.Update',
    Delete: 'KatKat.Buildings.Delete',
  },
  Flats: {
    Create: 'KatKat.Flats.Create',
    Update: 'KatKat.Flats.Update',
    Delete: 'KatKat.Flats.Delete',
  },
  FlatMembers: {
    Approve: 'KatKat.FlatMembers.Approve',
    PromoteToManager: 'KatKat.FlatMembers.PromoteToManager',
    Invite: 'KatKat.FlatMembers.Invite',
    Remove: 'KatKat.FlatMembers.Remove',
    UpdateResidentInfo: 'KatKat.FlatMembers.UpdateResidentInfo',
  },
  P2PRequests: {
    Create: 'KatKat.P2PRequests.Create',
  },
  Expenses: {
    Create: 'KatKat.Expenses.Create',
  },
  Issues: {
    Create: 'KatKat.Issues.Create',
    Resolve: 'KatKat.Issues.Resolve',
  },
  Resources: {
    Create: 'KatKat.Resources.Create',
  },
  ResourceReservations: {
    Create: 'KatKat.ResourceReservations.Create',
    Approve: 'KatKat.ResourceReservations.Approve',
  },
  SosAlerts: {
    Resolve: 'KatKat.SosAlerts.Resolve',
  },
} as const;
