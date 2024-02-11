import { UserTeam } from "../data/models.ts";

export function RoleBadge({
  role,
  displayRole,
  member,
  onClick,
} : {
  member: UserTeam,
  role: string,
  displayRole: string,
  onClick: () => void }) {
  return <div
    className={member.role === role ? "badge bg-primary text-white me-1" : "badge bg-primary-subtle text-primary me-1 cursor-pointer"}
    onClick={onClick}
  >
    {displayRole} {member.role === role && "(current)"}
  </div>;
}