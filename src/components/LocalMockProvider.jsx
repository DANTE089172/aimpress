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
    const arrayName = dataSource === mockData.boards ? 'boards' : 'notes';
    mockData[arrayName] = dataSource.map(item => {
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
    const arrayName = dataSource === mockData.boards ? 'boards' : 'notes';
    mockData[arrayName] = dataSource.filter(item => item.id !== id);
    return { success: true };
  },
});

// --- EXPORTED MOCKS (NAMED EXPORTS) ---

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
  // Adding filter method directly to User mock for createClient consistency
  filter: async (filters) => {
    console.log('[MOCK] User.filter called with:', filters);
    if (filters.email === mockData.user.email) return [mockData.user];
    return [];
  },
};

// Mock for: @/api/entities/Board and @/api/entities/StickyNote
export const Board = createMockEntity(mockData.boards, 'Board');
export const StickyNote = createMockEntity(mockData.notes, 'StickyNote');

// Mock for: @/api/functions/*
export const initiateStripeCheckout = async (payload) => {
  console.log('[MOCK] initiateStripeCheckout called', payload);
  return { data: { checkout_url: 'https://mock-checkout-url.com' } };
};

// Mock for: @/api/integrations/Core
export const Core = {
  UploadFile: async ({ file }) => {
    console.log('[MOCK Core] UploadFile called', file?.name);
    return { file_url: `mock-file-url/${file?.name || 'test.png'}` };
  },
  InvokeLLM: async ({ prompt, add_context_from_internet, response_json_schema, file_urls }) => {
    console.log('[MOCK Core] InvokeLLM called', { prompt: prompt.substring(0, 50), add_context_from_internet, response_json_schema, file_urls });
    return { responseText: "Mock LLM response: Hello from your AI mock!" };
  },
  GenerateImage: async ({ prompt }) => {
    console.log('[MOCK Core] GenerateImage called', prompt.substring(0, 50));
    return { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688' };
  },
  ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
    console.log('[MOCK Core] ExtractDataFromUploadedFile called', { file_url, json_schema });
    return { status: 'success', output: [{ id: 'mock-data-1', value: 'extracted from mock file' }] };
  }
};

// Mock for: @base44/sdk's createClient
// This is the main mock entry point when using the client.
export const createClient = (config) => {
  console.log(`[MOCK] createClient called for app: ${config.appId}, auth required: ${config.requiresAuth}`);
  // This return object MUST mirror the real base44 client structure
  return {
    auth: {
      me: async () => { console.log('[MOCK SDK] auth.me called'); return mockData.user; },
      setToken: (token) => console.log(`[MOCK SDK] auth.setToken called with: ${token}`),
    },
    entities: {
      User,
      Board,
      StickyNote,
    },
    // This was the missing piece causing the "reading 'Core'" error
    integrations: {
      Core,
    },
    // You can add other mocked client properties here if needed
  };
};

// --- DEFAULT EXPORT ---
// This is crucial to handle `import MyModule from '...'` syntax
export default {
  User,
  Board,
  StickyNote,
  initiateStripeCheckout,
  Core,
  createClient,
};