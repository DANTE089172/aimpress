// This file provides a complete mock of the Base44 backend for local UI testing.
// It simulates the User, Board, and StickyNote entities, as well as backend functions.

// --- MOCK DATA STORE ---
const mockData = {
  user: {
    id: 'mock-user-123',
    full_name: 'Local Tester',
    email: 'tester@example.com',
    role: 'user',
    subscription_status: 'pro',
    has_seen_onboarding: true,
  },
  boards: [
    { id: 'board-1', name: 'Local Test Board', owner_email: 'tester@example.com', updated_date: new Date().toISOString() },
    { id: 'board-2', name: 'UI Automation Project', owner_email: 'tester@example.com', updated_date: new Date().toISOString() },
  ],
  notes: [
    { id: 'note-1', title: 'Test Note 1', content: 'This is a mock note for the test board.', board_id: 'board-1', color: 'yellow', priority: 'medium', status: 'active', created_by: 'tester@example.com', updated_date: new Date().toISOString(), position_x: 100, position_y: 100, width: 280, height: 200, is_archived: false },
    { id: 'note-2', title: 'Important Task', content: 'An important mock task.', board_id: 'board-1', color: 'blue', priority: 'high', status: 'active', created_by: 'tester@example.com', updated_date: new Date().toISOString(), position_x: 400, position_y: 150, width: 280, height: 200, is_archived: false },
    { id: 'note-3', title: 'Archived Idea', content: 'An idea that was archived.', board_id: 'board-2', color: 'green', priority: 'low', status: 'completed', created_by: 'tester@example.com', updated_date: new Date().toISOString(), is_archived: true },
  ]
};

// --- MOCK ENTITY HELPERS ---
const createMockEntity = (dataSource, entityName) => ({
  list: async () => {
    console.log(`[MOCK] ${entityName}.list called`);
    return [...dataSource];
  },
  filter: async (filters = {}) => {
    console.log(`[MOCK] ${entityName}.filter called with:`, filters);
    return dataSource.filter(item => Object.keys(filters).every(key => item[key] === filters[key]));
  },
  create: async (newItem) => {
    console.log(`[MOCK] ${entityName}.create called`);
    const created = { id: `mock-${entityName.toLowerCase()}-${Date.now()}`, ...newItem, created_by: mockData.user.email, updated_date: new Date().toISOString() };
    dataSource.push(created);
    return created;
  },
  update: async (id, updates) => {
    console.log(`[MOCK] ${entityName}.update called for ${id}`);
    let updatedItem;
    mockData[dataSource === mockData.boards ? 'boards' : 'notes'] = dataSource.map(item => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates, updated_date: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });
    return updatedItem;
  },
  delete: async (id) => {
    console.log(`[MOCK] ${entityName}.delete called for ${id}`);
    mockData[dataSource === mockData.boards ? 'boards' : 'notes'] = dataSource.filter(item => item.id !== id);
    return { success: true };
  },
});


// --- EXPORTED MOCKS ---

// Mock for: @/api/entities/User
export const User = {
  me: async () => {
    console.log('[MOCK] User.me called');
    return mockData.user;
  },
  login: async () => console.log('[MOCK] User.login called. Doing nothing.'),
  logout: async () => {
    console.log('[MOCK] User.logout called.');
    window.location.reload();
  },
  loginWithRedirect: async () => console.log('[MOCK] User.loginWithRedirect called. Doing nothing.'),
  updateMyUserData: async (data) => {
    console.log('[MOCK] User.updateMyUserData called');
    Object.assign(mockData.user, data);
    return mockData.user;
  },
};

// Mock for: @/api/entities/Board
export const Board = createMockEntity(mockData.boards, 'Board');

// Mock for: @/api/entities/StickyNote
export const StickyNote = createMockEntity(mockData.notes, 'StickyNote');

// Mock for: @/api/functions/initiateStripeCheckout
export const initiateStripeCheckout = async (params) => {
  console.log('[MOCK] initiateStripeCheckout called with:', params);
  alert('Checkout is disabled in local mock mode.');
  return { data: { error: 'Checkout disabled in mock mode.' } };
};

// Mock for: @/api/integrations/Core
export const InvokeLLM = async ({ prompt }) => {
  console.log('[MOCK] InvokeLLM called with prompt:', prompt);
  await new Promise(res => setTimeout(res, 300));
  return { responseText: "This is a mock AI response for local testing." };
};

export const UploadFile = async ({ file }) => {
  console.log('[MOCK] UploadFile called with file:', file.name);
  return { file_url: 'https://via.placeholder.com/400x300.png?text=Mock+Upload' };
};

// Default export is a dummy component to make this a valid component file.
export default function LocalMockProvider() { return null; }