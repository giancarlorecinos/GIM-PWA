import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type QueryConstraint,
  or,
} from 'firebase/firestore'
import { firestore } from './config'
import type { UserRole } from './auth'

export interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'critical' | 'high' | 'medium' | 'low'
  ticketType?: 'incident' | 'service_request' | 'question'
  created_by: string
  assigned_to: string | null
  category: string
  categoryId?: string
  createdAt: ReturnType<typeof serverTimestamp>
  updatedAt: ReturnType<typeof serverTimestamp>
}

const ticketsRef = collection(firestore, 'tickets')

function buildTicketConstraints(role: UserRole, uid: string): QueryConstraint[] {
  switch (role) {
    case 'customer':
      return [where('created_by', '==', uid)]
    case 'agent':
      return [or(where('assigned_to', '==', uid), where('status', '==', 'open'))]
    case 'admin':
      return []
  }
}

export function subscribeToTickets(
  role: UserRole,
  uid: string,
  callback: (tickets: Ticket[]) => void,
) {
  const constraints = buildTicketConstraints(role, uid)
  const q = query(ticketsRef, ...constraints, orderBy('createdAt', 'desc'))

  return onSnapshot(q, (snap) => {
    const tickets = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ticket)
    callback(tickets)
  })
}

export async function getTickets(role: UserRole, uid: string): Promise<Ticket[]> {
  const constraints = buildTicketConstraints(role, uid)
  const q = query(ticketsRef, ...constraints, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ticket)
}

export async function createTicket(
  uid: string,
  data: Pick<Ticket, 'title' | 'description' | 'priority' | 'category'> & { categoryId?: string; ticketType?: string },
): Promise<string> {
  const docRef = await addDoc(ticketsRef, {
    ...data,
    status: 'open',
    created_by: uid,
    assigned_to: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateTicket(
  ticketId: string,
  data: Partial<Omit<Ticket, 'id' | 'created_by' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(firestore, 'tickets', ticketId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTicket(ticketId: string): Promise<void> {
  await deleteDoc(doc(firestore, 'tickets', ticketId))
}

export async function claimTicket(ticketId: string, agentUid: string): Promise<void> {
  await updateDoc(doc(firestore, 'tickets', ticketId), {
    assigned_to: agentUid,
    status: 'in-progress',
    updatedAt: serverTimestamp(),
  })
}

export async function unassignTicket(ticketId: string): Promise<void> {
  await updateDoc(doc(firestore, 'tickets', ticketId), {
    assigned_to: null,
    status: 'open',
    updatedAt: serverTimestamp(),
  })
}

export async function changeUserRole(uid: string, newRole: string): Promise<void> {
  await updateDoc(doc(firestore, 'users', uid), { role: newRole })
}

export async function updateUserStatus(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(firestore, 'users', uid), { isActive })
}
