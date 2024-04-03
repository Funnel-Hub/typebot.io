import { router } from '@/helpers/server/trpc'
import { createWorkspace } from './createWorkspace'
import { deleteWorkspace } from './deleteWorkspace'
import { getWorkspace } from './getWorkspace'
import { listMembersInWorkspace } from './listMembersInWorkspace'
import { listWorkspaces } from './listWorkspaces'
import { updateWorkspace } from './updateWorkspace'
import { createWorkspaceInvitation } from './createWorkspaceInvitation'
import { addWorkspaceMember } from './addWorkspaceMember'

export const workspaceRouter = router({
  listWorkspaces,
  getWorkspace,
  listMembersInWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  createWorkspaceInvitation,
  addWorkspaceMember,
})
