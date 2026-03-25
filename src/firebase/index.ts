export { auth, firestore } from './config'
export { useAuth, type UserRole } from './auth'
export {
  subscribeToTickets,
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  claimTicket,
  unassignTicket,
  changeUserRole,
  type Ticket,
} from './firestore'
