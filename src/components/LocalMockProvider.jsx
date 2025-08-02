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
export const initiateStripeCheckout = async (payload) => {
  console.log('[MOCK] initiateStripeCheckout called', payload);
  return { data: { checkout_url: 'https://mock-checkout-url.com' } };
};

// Mock for: @/api/integrations/Core.js
// Group these into a 'Core' object if some code expects it this way
export const Core = {
  UploadFile: async ({ file }) => {
    console.log('[MOCK Core] UploadFile called', file?.name);
    return { file_url: `mock-file-url/${file?.name || 'test.png'}` };
  },
  InvokeLLM: async ({ prompt, add_context_from_internet, response_json_schema, file_urls }) => {
    console.log('[MOCK Core] InvokeLLM called', prompt.substring(0, 50));
    if (response_json_schema) {
      // Return a simple mock object matching a common schema if a schema is provided
      return { responseText: "Mock JSON response based on schema" };
    }
    // Otherwise, return a string response
    return { responseText: "Mock LLM response: Hello from your AI mock!" };
  },
  GenerateImage: async ({ prompt }) => {
    console.log('[MOCK Core] GenerateImage called', prompt.substring(0, 50));
    // Provide a valid Unsplash image URL for testing
    return { url: 'https://images.unsplash.com/photo-1698656165516-e5264b38340d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTQxfHxtb2NrJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D' };
  },
  ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
    console.log('[MOCK Core] ExtractDataFromUploadedFile called', file_url);
    // Return a mock success response for file extraction
    return { status: 'success', output: [{ id: 'mock-data-1', value: 'extracted from mock file' }] };
  }
};

// Also export individual integration functions for backward compatibility
export const UploadFile = Core.UploadFile;
export const InvokeLLM = Core.InvokeLLM;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;

// Mock for: @base44/sdk
export const createClient = ({ appId, requiresAuth }) => {
  console.log(`[MOCK] createClient called for app: ${appId}, auth required: ${requiresAuth}`);
  return {
    auth: {
      me: async () => {
        console.log('[MOCK SDK] auth.me called');
        return mockData.user;
      },
      setToken: (token) => console.log(`[MOCK SDK] auth.setToken called with: ${token}`),
      // Add other auth methods if you use them (e.g., login, logout)
    },
    entities: {
      Board: createMockEntity(mockData.boards, 'Board'),
      StickyNote: createMockEntity(mockData.notes, 'StickyNote'),
      User: {
        update: async (id, updates) => {
          console.log(`[MOCK SDK] entities.User.update called for ${id}`);
          Object.assign(mockData.user, updates); // Assuming only current user is updated
          return mockData.user;
        },
        filter: async (filters) => {
            console.log(`[MOCK SDK] entities.User.filter called with: ${JSON.stringify(filters)}`);
            if (filters.email === mockData.user.email) return [mockData.user];
            return [];
        }
      },
    },
    // Add other top-level SDK properties if your app uses them
  };
};